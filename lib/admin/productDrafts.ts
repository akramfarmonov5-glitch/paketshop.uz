/**
 * Admin variant/tier formasi uchun konvertatsiya.
 *
 * Baza qatorlari `id`, `productId` va `null` qiymatlarni o'z ichiga oladi, admin API
 * sxemasi esa `.strict()` — shu sababli tahrirlashda qatorlarni to'g'ridan-to'g'ri
 * qaytarib bo'lmaydi. Bu modul forma qoralamasi bilan payload o'rtasida tarjima qiladi.
 */

export const AVAILABILITY_STATUSES = [
  'IN_STOCK', 'LOW_STOCK', 'CHECK_AVAILABILITY', 'ON_ORDER', 'OUT_OF_STOCK', 'DISCONTINUED',
] as const;

export const SALE_UNITS = ['PIECE', 'PACK', 'CARTON', 'ROLL', 'KILOGRAM'] as const;

export interface VariantDraft {
  sku: string;
  color: string;
  size: string;
  volumeMl: string;
  thicknessMicron: string;
  unitsPerPack: string;
  price: string;
  availabilityStatus: string;
  active: boolean;
}

export interface TierDraft {
  minQuantity: string;
  maxQuantity: string;
  price: string;
  priceUnit: string;
}

const text = (value: unknown): string => (value === null || value === undefined ? '' : String(value));

export function emptyVariantDraft(availabilityStatus = 'CHECK_AVAILABILITY'): VariantDraft {
  return { sku: '', color: '', size: '', volumeMl: '', thicknessMicron: '', unitsPerPack: '', price: '', availabilityStatus, active: true };
}

export function emptyTierDraft(priceUnit = 'PACK'): TierDraft {
  return { minQuantity: '', maxQuantity: '', price: '', priceUnit };
}

export function variantRowToDraft(row: Record<string, unknown>): VariantDraft {
  return {
    sku: text(row.sku),
    color: text(row.color),
    size: text(row.size),
    volumeMl: text(row.volumeMl),
    thicknessMicron: text(row.thicknessMicron),
    unitsPerPack: text(row.unitsPerPack),
    price: text(row.price),
    availabilityStatus: text(row.availabilityStatus) || 'CHECK_AVAILABILITY',
    active: row.active !== false,
  };
}

export function tierRowToDraft(row: Record<string, unknown>): TierDraft {
  return {
    minQuantity: text(row.minQuantity),
    maxQuantity: text(row.maxQuantity),
    price: text(row.price),
    priceUnit: text(row.priceUnit) || 'PACK',
  };
}

/** Bo'sh maydonlarni tashlab, faqat sxema ruxsat bergan kalitlarni qaytaradi. */
export function draftToVariantPayload(draft: VariantDraft): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    sku: draft.sku.trim().toUpperCase(),
    availabilityStatus: draft.availabilityStatus,
    active: draft.active,
  };
  if (draft.color.trim()) payload.color = draft.color.trim();
  if (draft.size.trim()) payload.size = draft.size.trim();
  if (draft.volumeMl.trim()) payload.volumeMl = Number(draft.volumeMl);
  if (draft.thicknessMicron.trim()) payload.thicknessMicron = Number(draft.thicknessMicron);
  if (draft.unitsPerPack.trim()) payload.unitsPerPack = Number(draft.unitsPerPack);
  if (draft.price.trim()) payload.price = Number(draft.price);
  return payload;
}

export function draftToTierPayload(draft: TierDraft): Record<string, unknown> {
  return {
    minQuantity: Number(draft.minQuantity),
    price: Number(draft.price),
    priceUnit: draft.priceUnit,
    maxQuantity: draft.maxQuantity.trim() ? Number(draft.maxQuantity) : null,
  };
}

/**
 * Mavjud mahsulotning slug'lari hech qachon qayta yaratilmaydi.
 *
 * Slug — public URL. Uni nomdan qayta hisoblash tahrirlangan har bir mahsulotning
 * manzilini o'zgartirib, tashqi havolalar va indeksatsiyani buzadi (TZ §27).
 */
export function resolveProductSlugs(
  existing: { slugUz: string; slugRu: string } | null,
  nameUz: string,
  slugify: (value: string) => string,
): { slugUz: string; slugRu: string } {
  if (existing) return { slugUz: existing.slugUz, slugRu: existing.slugRu };
  const slugUz = slugify(nameUz);
  return { slugUz, slugRu: `${slugUz}-ru` };
}

/** Serverdagi qoidani takrorlaydi: mahsulot va variant SKU'lari takrorlanmasligi kerak. */
export function findDuplicateSkus(productSku: string, drafts: VariantDraft[]): string[] {
  const seen = new Map<string, number>();
  const all = [productSku, ...drafts.map((draft) => draft.sku)]
    .map((sku) => sku.trim().toUpperCase())
    .filter(Boolean);

  for (const sku of all) seen.set(sku, (seen.get(sku) || 0) + 1);
  return [...seen.entries()].filter(([, count]) => count > 1).map(([sku]) => sku);
}

/**
 * Serverdagi qoidani takrorlaydi: narx darajalari kesishmasligi kerak.
 * Kesishgan darajaning (0-dan boshlangan) indeksini qaytaradi, aks holda null.
 */
export function findTierOverlap(drafts: TierDraft[]): number | null {
  const parsed = drafts
    .map((draft, index) => ({
      index,
      min: Number(draft.minQuantity),
      max: draft.maxQuantity.trim() ? Number(draft.maxQuantity) : null,
    }))
    .filter((tier) => Number.isFinite(tier.min) && tier.min > 0)
    .sort((a, b) => a.min - b.min);

  for (let position = 1; position < parsed.length; position += 1) {
    const previous = parsed[position - 1];
    const current = parsed[position];
    if (previous.max == null || previous.max >= current.min) return current.index;
  }
  return null;
}

/** Formani yuborishdan oldingi tekshiruv: birinchi topilgan xatoni qaytaradi. */
export function validateDrafts(productSku: string, variants: VariantDraft[], tiers: TierDraft[]): string | null {
  if (variants.some((variant) => !variant.sku.trim())) return 'Har bir variantga SKU kerak';

  const duplicates = findDuplicateSkus(productSku, variants);
  if (duplicates.length) return `SKU takrorlanmasligi kerak: ${duplicates.join(', ')}`;

  for (const tier of tiers) {
    if (!tier.minQuantity.trim() || Number(tier.minQuantity) < 1) return 'Narx darajasida eng kam miqdor 1 dan kichik bo‘lmasligi kerak';
    if (!tier.price.trim()) return 'Har bir narx darajasiga narx kerak';
    if (tier.maxQuantity.trim() && Number(tier.maxQuantity) < Number(tier.minQuantity)) {
      return 'Narx darajasida eng ko‘p miqdor eng kam miqdordan kichik bo‘lmasligi kerak';
    }
  }

  const overlap = findTierOverlap(tiers);
  if (overlap !== null) return `${overlap + 1}-narx darajasi oldingisi bilan kesishadi`;

  return null;
}
