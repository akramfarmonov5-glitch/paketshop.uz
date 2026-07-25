import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { buildRollbackPlan, snapshotToUpdateData } from '@/lib/import/importRollback';
import { auditJson } from '@/lib/server/adminCatalogService';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';

// Rollback mahsulotlarni o'chiradi/qaytaradi — faqat to'liq huquqli rollar.
const roles = ['SUPER_ADMIN', 'ADMIN'] as const;

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  try {
    const job = await db.importJob.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ error: 'Import topilmadi' }, { status: 404 });
    if (job.rolledBackAt) return NextResponse.json({ error: 'Bu import allaqachon qaytarilgan' }, { status: 409 });
    if (job.status !== 'COMPLETED') return NextResponse.json({ error: 'Faqat yakunlangan importni qaytarish mumkin' }, { status: 409 });

    const plan = buildRollbackPlan(job.rollbackData);
    if (!plan.deleteProductIds.length && !plan.restore.length) {
      return NextResponse.json({ error: 'Bu import uchun rollback ma’lumoti saqlanmagan' }, { status: 409 });
    }

    const result = await db.$transaction(async (transaction: any) => {
      // Import yaratgan mahsulotlar o'chiriladi. OrderItem.productId SetNull bo'lgani uchun
      // buyurtmalardagi SKU/nom snapshot'lari saqlanib qoladi.
      let deleted = 0;
      if (plan.deleteProductIds.length) {
        const removed = await transaction.product.deleteMany({ where: { id: { in: plan.deleteProductIds } } });
        deleted = removed.count;
      }

      // Yangilangan mahsulotlar oldingi holatiga qaytariladi.
      let restored = 0;
      for (const item of plan.restore) {
        const exists = await transaction.product.findUnique({ where: { id: item.productId }, select: { id: true } });
        if (!exists) continue;

        await transaction.product.update({ where: { id: item.productId }, data: snapshotToUpdateData(item.before) });
        await transaction.productTranslation.deleteMany({ where: { productId: item.productId } });
        await transaction.productVariant.deleteMany({ where: { productId: item.productId } });
        await transaction.priceTier.deleteMany({ where: { productId: item.productId } });

        if (item.before.translations.length) {
          await transaction.productTranslation.createMany({ data: item.before.translations.map((row) => ({ ...row, productId: item.productId })) });
        }
        if (item.before.variants.length) {
          await transaction.productVariant.createMany({ data: item.before.variants.map((row) => ({ ...row, productId: item.productId })) });
        }
        if (item.before.priceTiers.length) {
          await transaction.priceTier.createMany({ data: item.before.priceTiers.map((row) => ({ ...row, productId: item.productId })) });
        }
        restored += 1;
      }

      await transaction.importJob.update({
        where: { id },
        data: { status: 'ROLLED_BACK', rolledBackAt: new Date() },
      });
      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'PRODUCT_IMPORT_ROLLBACK',
          entityType: 'ImportJob',
          entityId: id,
          after: auditJson({ filename: job.filename, deleted, restored }),
          ip: request.headers.get('x-real-ip'),
        },
      });

      return { deleted, restored };
    }, { timeout: 120_000 });

    revalidatePath('/uz/catalog');
    revalidatePath('/ru/catalog');
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Import rollback failed:', error);
    return NextResponse.json({ error: 'Importni qaytarib bo‘lmadi' }, { status: 500 });
  }
}
