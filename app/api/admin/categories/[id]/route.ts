import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/server/db';
import { auditJson } from '@/lib/server/adminCatalogService';
import { getAdminSession } from '@/lib/server/rbac';
import { adminCategorySchema } from '@/lib/validation/adminCatalog';

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;
type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const parsed = adminCategorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const input = parsed.data;

  try {
    const category = await db.$transaction(async (transaction) => {
      const before = await transaction.category.findUniqueOrThrow({ where: { id }, include: { translations: true } });
      await transaction.category.update({ where: { id }, data: { parentId: input.parentId || null, slugUz: input.slugUz, slugRu: input.slugRu, sortOrder: input.sortOrder, active: input.active } });
      for (const locale of ['uz', 'ru'] as const) {
        await transaction.categoryTranslation.upsert({
          where: { categoryId_locale: { categoryId: id, locale } },
          update: { name: input.name[locale], description: input.description?.[locale] || null },
          create: { categoryId: id, locale, name: input.name[locale], description: input.description?.[locale] || null },
        });
      }
      await transaction.auditLog.create({ data: { actorId: session.user.id, action: 'CATEGORY_UPDATE', entityType: 'Category', entityId: id, before: auditJson(before), after: input, ip: request.headers.get('x-real-ip') } });
      return transaction.category.findUniqueOrThrow({ where: { id }, include: { translations: true } });
    });
    revalidatePath('/uz/catalog'); revalidatePath('/ru/catalog');
    return NextResponse.json({ category });
  } catch (error) {
    console.error('Admin category update failed:', error);
    return NextResponse.json({ error: 'Category could not be updated' }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession(['SUPER_ADMIN', 'ADMIN']);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  try {
    await db.$transaction(async (transaction) => {
      const before = await transaction.category.findUniqueOrThrow({ where: { id } });
      await transaction.category.update({ where: { id }, data: { active: false } });
      await transaction.auditLog.create({ data: { actorId: session.user.id, action: 'CATEGORY_ARCHIVE', entityType: 'Category', entityId: id, before: auditJson(before), after: { active: false }, ip: request.headers.get('x-real-ip') } });
    });
    revalidatePath('/uz/catalog'); revalidatePath('/ru/catalog');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin category archive failed:', error);
    return NextResponse.json({ error: 'Category could not be archived' }, { status: 404 });
  }
}
