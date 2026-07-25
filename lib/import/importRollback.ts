/**
 * Import rollback snapshot'lari (TZ §24.3).
 *
 * Import har bir SKU uchun "oldingi holat"ni yozib qo'yadi: mahsulot yangi yaratilganmi,
 * yoki yangilangan bo'lsa — oldingi skalyar maydonlari, tarjimalari, variantlari va
 * narx darajalari. Rollback shu snapshot'ni qaytarib qo'yadi.
 */

export interface ProductSnapshot {
  scalars: Record<string, unknown>;
  translations: Array<Record<string, unknown>>;
  variants: Array<Record<string, unknown>>;
  priceTiers: Array<Record<string, unknown>>;
}

export interface RollbackEntry {
  sku: string;
  productId: string;
  /** true bo'lsa mahsulot import tomonidan yaratilgan — rollback uni o'chiradi. */
  created: boolean;
  before?: ProductSnapshot;
}

export interface RollbackPlan {
  /** O'chirilishi kerak bo'lgan (import yaratgan) mahsulot id'lari. */
  deleteProductIds: string[];
  /** Oldingi holatga qaytarilishi kerak bo'lgan yozuvlar. */
  restore: Array<{ productId: string; sku: string; before: ProductSnapshot }>;
}

/** Prisma qatorlaridan JSON'ga yoziladigan snapshot yasaydi (Decimal/Date → string). */
export function buildProductSnapshot(product: {
  translations: Array<Record<string, unknown>>;
  variants: Array<Record<string, unknown>>;
  priceTiers: Array<Record<string, unknown>>;
} & Record<string, unknown>): ProductSnapshot {
  const { translations, variants, priceTiers, ...scalars } = product;
  return {
    scalars: serializable(scalars) as Record<string, unknown>,
    translations: (translations || []).map((row) => serializable(stripKeys(row, ['id', 'productId'])) as Record<string, unknown>),
    variants: (variants || []).map((row) => serializable(stripKeys(row, ['id', 'productId'])) as Record<string, unknown>),
    priceTiers: (priceTiers || []).map((row) => serializable(stripKeys(row, ['id', 'productId'])) as Record<string, unknown>),
  };
}

function stripKeys(row: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).filter(([key]) => !keys.includes(key)));
}

/** Decimal, Date va boshqa obyektlarni JSON'ga xavfsiz turlarga aylantiradi. */
function serializable(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializable);
  if (typeof value === 'object') {
    // Prisma Decimal — toString() bilan aniqlikni saqlaydi
    if (typeof (value as { toFixed?: unknown }).toFixed === 'function') return String(value);
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, serializable(entry)]));
  }
  return value;
}

/** Saqlangan snapshot ro'yxatidan rollback rejasini tuzadi. */
export function buildRollbackPlan(entries: unknown): RollbackPlan {
  const list = Array.isArray(entries) ? (entries as RollbackEntry[]) : [];
  const plan: RollbackPlan = { deleteProductIds: [], restore: [] };

  for (const entry of list) {
    if (!entry?.productId) continue;
    if (entry.created) {
      plan.deleteProductIds.push(entry.productId);
    } else if (entry.before) {
      plan.restore.push({ productId: entry.productId, sku: entry.sku, before: entry.before });
    }
  }
  return plan;
}

/** Snapshot skalyarlarini Prisma `update` uchun tayyorlaydi (o'zgarmas maydonlarni tashlaydi). */
export function snapshotToUpdateData(snapshot: ProductSnapshot): Record<string, unknown> {
  return stripKeys(snapshot.scalars, ['id', 'createdAt', 'updatedAt']);
}

export function rollbackSummary(plan: RollbackPlan): string {
  return `${plan.deleteProductIds.length} ta yaratilgan mahsulot o‘chiriladi, ${plan.restore.length} ta mahsulot oldingi holatiga qaytariladi`;
}
