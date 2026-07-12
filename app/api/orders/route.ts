import crypto from 'node:crypto';
import { CustomerType, OrderStatus, Prisma, SaleUnit } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { buildTelegramOrderMessage, isValidOrderQuantity, normalizeUzbekPhone, selectTierPrice, summarizeAttribution } from '@/lib/domain/commerce';
import { getLocalizedText } from '@/lib/i18nUtils';
import { checkRateLimit } from '@/lib/rateLimit';
import { db } from '@/lib/server/db';
import { sendTelegramHtml } from '@/lib/server/telegram';
import { hasAdminCredentials, supabaseAdmin } from '@/lib/supabaseAdmin';
import { orderRequestSchema, type OrderRequestInput } from '@/lib/validation/orderRequest';

type RequestedItem = OrderRequestInput['items'][number];
type ResolvedItem = {
  productId: string | null;
  variantId: string | null;
  sku: string;
  nameUz: string;
  nameRu: string;
  slug: string;
  quantity: number;
  saleUnit: SaleUnit;
  unitPrice: number | null;
  lineTotal: number | null;
};

function requestIp(request: NextRequest): string {
  return request.headers.get('x-real-ip') || request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function orderNumber(): string {
  return `PS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

const paymentLabels: Record<string, string> = { cash: 'Naqd', card_transfer: 'Karta o‘tkazmasi', bank: 'Bank hisob raqami', terminal: 'Terminal', other: 'Kelishiladi' };
const customerTypeLabels: Record<string, string> = { individual: 'Jismoniy shaxs', entrepreneur: 'Biznes / YTT', organization: 'Tashkilot', reseller: 'Qayta sotuvchi' };

function customerType(type: OrderRequestInput['customerType']): CustomerType {
  return type.toUpperCase() as CustomerType;
}

function relevantTier(tier: { customerGroup: { code: string } | null }, type: OrderRequestInput['customerType']): boolean {
  if (!tier.customerGroup) return true;
  return tier.customerGroup.code.toLowerCase() === type;
}

async function resolvePrismaItems(requested: RequestedItem[], type: OrderRequestInput['customerType']): Promise<{ resolved: ResolvedItem[]; missing: RequestedItem[] }> {
  const references = requested.map((item) => item.productId);
  const legacySkus = references.filter((reference) => /^\d+$/.test(reference)).map((reference) => `PS-${reference}`);
  const products = await db.product.findMany({
    where: { OR: [{ id: { in: references } }, { sku: { in: references } }, { legacySku: { in: [...references, ...legacySkus] } }] },
    include: { translations: true, variants: true, priceTiers: { include: { customerGroup: true } } },
  });

  const resolved: ResolvedItem[] = [];
  const missing: RequestedItem[] = [];
  const now = Date.now();
  for (const item of requested) {
    const product = products.find((candidate) => candidate.id === item.productId || candidate.sku === item.productId || candidate.legacySku === item.productId || candidate.legacySku === `PS-${item.productId}`);
    if (!product) { missing.push(item); continue; }
    if (product.status !== 'ACTIVE' || product.availabilityStatus === 'OUT_OF_STOCK' || product.availabilityStatus === 'DISCONTINUED') throw new Error(`UNAVAILABLE:${product.sku}`);
    if (item.saleUnit && item.saleUnit !== product.saleUnit) throw new Error(`SALE_UNIT:${product.sku}`);
    if (!isValidOrderQuantity(item.quantity, product.minimumOrderQuantity, product.orderStep)) throw new Error(`QUANTITY:${product.sku}:${product.minimumOrderQuantity}:${product.orderStep}`);

    const variant = item.variantId ? product.variants.find((candidate) => candidate.id === item.variantId && candidate.active) : null;
    if (item.variantId && !variant) throw new Error(`VARIANT:${product.sku}`);
    const uz = product.translations.find((translation) => translation.locale === 'uz') || product.translations[0];
    const ru = product.translations.find((translation) => translation.locale === 'ru') || uz;
    const customerPrice = type === 'organization' ? product.organizationPrice : type === 'reseller' ? product.resellerPrice : null;
    const basePrice = variant?.price ?? customerPrice ?? product.publicPrice;
    const priceUnavailable = product.priceMode === 'REQUEST_ONLY' || product.priceMode === 'LOGIN_REQUIRED' || basePrice == null;
    const activeTiers = product.priceTiers.filter((tier) => relevantTier(tier, type) && tier.priceUnit === product.saleUnit && (!tier.startsAt || tier.startsAt.getTime() <= now) && (!tier.endsAt || tier.endsAt.getTime() >= now));
    const unitPrice = priceUnavailable ? null : selectTierPrice(Number(basePrice), item.quantity, activeTiers.map((tier) => ({ minQuantity: tier.minQuantity, maxQuantity: tier.maxQuantity, price: Number(tier.price) })));
    resolved.push({ productId: product.id, variantId: variant?.id || null, sku: variant?.sku || product.sku, nameUz: uz?.name || product.sku, nameRu: ru?.name || uz?.name || product.sku, slug: product.slugUz, quantity: item.quantity, saleUnit: product.saleUnit, unitPrice, lineTotal: unitPrice == null ? null : unitPrice * item.quantity });
  }
  return { resolved, missing };
}

async function resolveLegacyItems(requested: RequestedItem[]): Promise<ResolvedItem[]> {
  if (!requested.length) return [];
  if (!hasAdminCredentials || requested.some((item) => !/^\d+$/.test(item.productId))) throw new Error('PRODUCT_NOT_FOUND');
  const ids = requested.map((item) => Number(item.productId));
  const { data, error } = await supabaseAdmin.from('products').select('id,name,slug,price,stock,itemsPerPackage').in('id', ids);
  if (error || !data || data.length !== ids.length) throw new Error('PRODUCT_NOT_FOUND');
  return requested.map((item) => {
    const product = data.find((candidate) => Number(candidate.id) === Number(item.productId));
    if (!product) throw new Error('PRODUCT_NOT_FOUND');
    const unitsPerPack = Math.max(1, Number(product.itemsPerPackage || 1));
    const saleUnit = (item.saleUnit || 'PACK') as SaleUnit;
    const unitPrice = Number(product.price || 0) * (saleUnit === 'PACK' ? unitsPerPack : 1);
    return { productId: null, variantId: null, sku: `PS-${product.id}`, nameUz: getLocalizedText(product.name, 'uz'), nameRu: getLocalizedText(product.name, 'ru'), slug: getLocalizedText(product.slug, 'uz') || String(product.id), quantity: item.quantity, saleUnit, unitPrice, lineTotal: unitPrice * item.quantity };
  });
}

function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (message.startsWith('UNAVAILABLE:')) return { error: `Mahsulot mavjud emas: ${message.split(':')[1]}`, status: 400 };
  if (message.startsWith('SALE_UNIT:')) return { error: `Sotuv birligi noto‘g‘ri: ${message.split(':')[1]}`, status: 400 };
  if (message.startsWith('QUANTITY:')) { const [, sku, minimum, step] = message.split(':'); return { error: `${sku}: eng kam miqdor ${minimum}, qadam ${step}`, status: 400 }; }
  if (message.startsWith('VARIANT:')) return { error: `Variant topilmadi: ${message.split(':')[1]}`, status: 400 };
  if (message === 'PRODUCT_NOT_FOUND') return { error: 'Bir yoki bir nechta mahsulot topilmadi', status: 400 };
  return { error: 'Buyurtma so‘rovini saqlab bo‘lmadi', status: 500 };
}

export async function POST(request: NextRequest) {
  if (!checkRateLimit(`order-create:${requestIp(request)}`, 8, 10 * 60 * 1000).allowed) return NextResponse.json({ error: 'Juda ko‘p so‘rov yuborildi' }, { status: 429 });
  const parsed = orderRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Ma’lumotlar noto‘g‘ri', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const input = parsed.data;
  if (input.website || (input.startedAt && Date.now() - input.startedAt < 700)) return NextResponse.json({ error: 'Spam rejected' }, { status: 400 });
  const phone = normalizeUzbekPhone(input.phone);
  if (!phone) return NextResponse.json({ error: 'Telefon raqami noto‘g‘ri' }, { status: 400 });

  try {
    const prismaResolution = await resolvePrismaItems(input.items, input.customerType);
    const items = [...prismaResolution.resolved, ...await resolveLegacyItems(prismaResolution.missing)];
    if (items.length !== input.items.length) throw new Error('PRODUCT_NOT_FOUND');
    const subtotal = items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
    const number = orderNumber();
    const type = customerType(input.customerType);
    const source = summarizeAttribution(input.attribution);

    const order = await db.$transaction(async (transaction) => {
      const customer = await transaction.customer.upsert({
        where: { phone },
        create: { type, name: input.customerName, phone, telegram: input.telegram },
        update: { type, name: input.customerName, telegram: input.telegram },
      });
      return transaction.order.create({
        data: {
          number, customerId: customer.id, customerType: type, customerName: input.customerName, phone, telegram: input.telegram,
          region: input.region, address: input.address, deliveryMethod: input.deliveryMethod, preferredPaymentMethod: input.paymentMethod,
          note: input.note, status: OrderStatus.NEW, subtotal, total: subtotal, source,
          firstTouch: input.attribution?.first as Prisma.InputJsonValue | undefined,
          lastTouch: (input.attribution?.last || input.attribution) as Prisma.InputJsonValue | undefined,
          items: { create: items.map((item) => ({ productId: item.productId, variantId: item.variantId, skuSnapshot: item.sku, nameSnapshotUz: item.nameUz, nameSnapshotRu: item.nameRu, quantity: item.quantity, saleUnit: item.saleUnit, unitPrice: item.unitPrice, lineTotal: item.lineTotal })) },
          history: { create: { status: OrderStatus.NEW, note: 'Sayt orqali buyurtma so‘rovi yaratildi' } },
        }, include: { items: true },
      });
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paketshop.uz';
    const message = buildTelegramOrderMessage({ orderNumber: number, customerName: input.customerName, phone, customerType: customerTypeLabels[input.customerType], telegram: input.telegram, region: input.region, address: input.address, paymentMethod: paymentLabels[input.paymentMethod] || input.paymentMethod, note: input.note, source, items: items.map((item) => ({ sku: item.sku, name: input.locale === 'ru' ? item.nameRu : item.nameUz, quantity: item.quantity, saleUnit: item.saleUnit.toLowerCase(), url: `${siteUrl}/${input.locale}/product/${item.slug}` })) });
    try { await sendTelegramHtml(message); } catch (notificationError) { console.error('Order created but Telegram notification failed:', notificationError); }

    return NextResponse.json({ success: true, orderNumber: order.number, subtotal, discount: 0, deliveryAmount: null, total: subtotal, requiresManagerConfirmation: true, hasRequestOnlyItems: items.some((item) => item.unitPrice == null) }, { status: 201 });
  } catch (error) {
    console.error('Order request failed:', error);
    const response = apiError(error);
    return NextResponse.json({ error: response.error }, { status: response.status });
  }
}
