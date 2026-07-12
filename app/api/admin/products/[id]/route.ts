import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/server/db';
import { auditJson, productPriceTiers, productScalarData, productTranslations, productVariants } from '@/lib/server/adminCatalogService';
import { getAdminSession } from '@/lib/server/rbac';
import { adminProductSchema } from '@/lib/validation/adminCatalog';

const writeRoles = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'] as const;
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession([...writeRoles, 'SALES_MANAGER', 'WAREHOUSE_VIEWER']);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { translations: true, variants: true, priceTiers: true, media: { include: { media: true } }, attributeValues: { include: { attributeValue: { include: { attribute: true } } } }, category: { include: { translations: true } }, brand: true, supplier: true },
  });
  return product ? NextResponse.json({ product }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession([...writeRoles]);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const parsed = adminProductSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const input = parsed.data;

  try {
    const product = await db.$transaction(async (transaction) => {
      const before = await transaction.product.findUniqueOrThrow({ where: { id }, include: { translations: true, variants: true, priceTiers: true } });
      await transaction.product.update({ where: { id }, data: productScalarData(input) });
      await transaction.productTranslation.deleteMany({ where: { productId: id } });
      await transaction.productVariant.deleteMany({ where: { productId: id } });
      await transaction.priceTier.deleteMany({ where: { productId: id } });
      await transaction.productTranslation.createMany({ data: productTranslations(input, id) });
      if (input.variants.length) await transaction.productVariant.createMany({ data: productVariants(input, id) });
      if (input.priceTiers.length) await transaction.priceTier.createMany({ data: productPriceTiers(input, id) });
      await transaction.auditLog.create({ data: { actorId: session.user.id, action: 'PRODUCT_UPDATE', entityType: 'Product', entityId: id, before: auditJson(before), after: auditJson(input), ip: request.headers.get('x-real-ip') } });
      return transaction.product.findUniqueOrThrow({ where: { id }, include: { translations: true, variants: true, priceTiers: true } });
    });
    revalidatePath('/uz/catalog'); revalidatePath('/ru/catalog');
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Admin product update failed:', error);
    return NextResponse.json({ error: 'Product could not be updated' }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession(['SUPER_ADMIN', 'ADMIN']);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  try {
    await db.$transaction(async (transaction) => {
      const before = await transaction.product.findUniqueOrThrow({ where: { id } });
      await transaction.product.update({ where: { id }, data: { status: 'ARCHIVED', availabilityStatus: 'DISCONTINUED' } });
      await transaction.auditLog.create({ data: { actorId: session.user.id, action: 'PRODUCT_ARCHIVE', entityType: 'Product', entityId: id, before: auditJson(before), after: { status: 'ARCHIVED', availabilityStatus: 'DISCONTINUED' }, ip: request.headers.get('x-real-ip') } });
    });
    revalidatePath('/uz/catalog'); revalidatePath('/ru/catalog');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin product archive failed:', error);
    return NextResponse.json({ error: 'Product could not be archived' }, { status: 404 });
  }
}
