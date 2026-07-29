import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/server/db';
import { auditJson, productMediaRows, productPriceTiers, productScalarData, productTranslations, productVariants } from '@/lib/server/adminCatalogService';
import { getAdminSession } from '@/lib/server/rbac';
import { adminProductSchema } from '@/lib/validation/adminCatalog';

const writeRoles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;
const readRoles = [...writeRoles, 'SALES_MANAGER', 'WAREHOUSE_VIEWER'] as const;

export async function GET(request: NextRequest) {
  const session = await getAdminSession([...readRoles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 50)));
  const query = (searchParams.get('q') || '').trim().slice(0, 100);
  const includeArchived = searchParams.get('includeArchived') === 'true';
  const searchWhere = query ? {
    OR: [
      { sku: { contains: query, mode: 'insensitive' as const } },
      { translations: { some: { name: { contains: query, mode: 'insensitive' as const } } } },
    ],
  } : {};
  const where = {
    ...searchWhere,
    ...(includeArchived ? {} : { status: { not: 'ARCHIVED' as const } }),
  };

  const [products, total, archivedTotal] = await db.$transaction([
    db.product.findMany({
      where,
      include: { translations: true, variants: true, priceTiers: true, media: { include: { media: true }, orderBy: [{ primary: 'desc' }, { sortOrder: 'asc' }] }, category: { include: { translations: true } }, brand: true },
      orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize,
    }),
    db.product.count({ where }),
    db.product.count({ where: { ...searchWhere, status: 'ARCHIVED' } }),
  ]);
  return NextResponse.json({
    products,
    total,
    archivedTotal,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession([...writeRoles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = adminProductSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const input = parsed.data;

  try {
    const product = await db.$transaction(async (transaction: any) => {
      const created = await transaction.product.create({ data: productScalarData(input) });
      await transaction.productTranslation.createMany({ data: productTranslations(input, created.id) });
      if (input.variants.length) await transaction.productVariant.createMany({ data: productVariants(input, created.id) });
      if (input.priceTiers.length) await transaction.priceTier.createMany({ data: productPriceTiers(input, created.id) });
      const mediaRows = productMediaRows(input.mediaIds, created.id);
      if (mediaRows?.length) await transaction.productMedia.createMany({ data: mediaRows, skipDuplicates: true });
      await transaction.auditLog.create({ data: { actorId: session.user.id, action: 'PRODUCT_CREATE', entityType: 'Product', entityId: created.id, after: auditJson(input), ip: request.headers.get('x-real-ip') } });
      return transaction.product.findUniqueOrThrow({ where: { id: created.id }, include: { translations: true, variants: true, priceTiers: true } });
    });
    revalidatePath('/uz'); revalidatePath('/ru');
    revalidatePath('/uz/catalog'); revalidatePath('/ru/catalog');
    revalidatePath('/sitemap.xml'); revalidatePath('/api/catalog');
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Admin product create failed:', error);
    return NextResponse.json({ error: 'Product could not be created; check unique SKU and slugs' }, { status: 409 });
  }
}
