import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/server/db';
import { getAdminSession } from '@/lib/server/rbac';
import { adminCategorySchema } from '@/lib/validation/adminCatalog';

const roles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;

export async function GET() {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const categories = await db.category.findMany({
    include: { translations: true, _count: { select: { products: true, children: true } } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession([...roles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = adminCategorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const input = parsed.data;

  try {
    const category = await db.$transaction(async (transaction: any) => {
      const created = await transaction.category.create({
        data: { parentId: input.parentId || null, slugUz: input.slugUz, slugRu: input.slugRu, sortOrder: input.sortOrder, active: input.active },
      });
      await transaction.categoryTranslation.createMany({ data: (['uz', 'ru'] as const).map((locale) => ({ categoryId: created.id, locale, name: input.name[locale], description: input.description?.[locale] || null })) });
      await transaction.auditLog.create({ data: { actorId: session.user.id, action: 'CATEGORY_CREATE', entityType: 'Category', entityId: created.id, after: input, ip: request.headers.get('x-real-ip') } });
      return transaction.category.findUniqueOrThrow({ where: { id: created.id }, include: { translations: true } });
    });
    revalidatePath('/uz/catalog'); revalidatePath('/ru/catalog');
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Admin category create failed:', error);
    return NextResponse.json({ error: 'Category could not be created' }, { status: 409 });
  }
}
