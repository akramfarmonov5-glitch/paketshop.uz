export interface LocalizedPair {
  uz: string;
  ru: string;
}

export interface CatalogCardInput {
  catalogId: string;
  sku: string;
  legacySku?: string | null;
  slugUz: string;
  slugRu: string;
  publicPrice?: number | string | null;
  priceMode: string;
  availabilityStatus: string;
  saleUnit: string;
  unitsPerPack: number;
  packsPerCarton: number;
  unitsPerCarton: number;
  minimumOrderQuantity: number;
  orderStep: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  categorySlug: string;
  imageUrl?: string | null;
  name: LocalizedPair;
  shortDescription?: Partial<LocalizedPair> | null;
}

export const SALE_UNIT_LABELS: Record<string, LocalizedPair> = {
  PIECE: { uz: 'dona', ru: 'шт.' },
  PACK: { uz: 'qadoq', ru: 'упаковка' },
  CARTON: { uz: 'korobka', ru: 'коробка' },
  ROLL: { uz: 'rulon', ru: 'рулон' },
  KILOGRAM: { uz: 'kg', ru: 'кг' },
};

export function saleUnitLabel(saleUnit: string, locale: 'uz' | 'ru'): string {
  return SALE_UNIT_LABELS[saleUnit]?.[locale] || SALE_UNIT_LABELS.PACK[locale];
}

export function legacyIdFromSku(legacySku?: string | null): number | null {
  const match = /^PS-(\d+)$/.exec(legacySku || '');
  return match ? Number(match[1]) : null;
}

export function toPriceNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function formatUzsPrice(value: number, locale: 'uz' | 'ru' = 'uz'): string {
  const amount = new Intl.NumberFormat('uz-UZ').format(Math.round(value)).replace(/[\u00A0\u202F]/g, ' ');
  return locale === 'ru' ? `${amount} сум` : `${amount} so'm`;
}

export function formatCardPrice(input: { publicPrice?: number | string | null; priceMode: string }): string {
  const price = toPriceNumber(input.publicPrice);
  if (input.priceMode === 'REQUEST_ONLY' || input.priceMode === 'LOGIN_REQUIRED' || !price) return '';
  const formatted = formatUzsPrice(price);
  return input.priceMode === 'FROM_PRICE' ? `${formatted}dan` : formatted;
}

export function approximatePiecePrice(publicPrice: number | string | null | undefined, unitsPerPack: number): number | null {
  const price = toPriceNumber(publicPrice);
  if (!price || !Number.isInteger(unitsPerPack) || unitsPerPack < 2) return null;
  return Math.round(price / unitsPerPack);
}

export interface CatalogCard {
  id: number;
  catalogId: string;
  sku: string;
  legacySku?: string;
  name: LocalizedPair;
  slug: LocalizedPair;
  price: number;
  formattedPrice: string;
  category: string;
  image: string;
  shortDescription: LocalizedPair;
  specs: never[];
  itemsPerPackage: number;
  packsPerCarton: number;
  unitsPerCarton: number;
  minimumOrderQuantity: number;
  orderStep: number;
  saleUnit: string;
  priceMode: string;
  availabilityStatus: string;
  isBestSeller: boolean;
  isNew: boolean;
}

export function mapCatalogCard(input: CatalogCardInput): CatalogCard {
  const price = toPriceNumber(input.publicPrice);
  return {
    id: legacyIdFromSku(input.legacySku) ?? 0,
    catalogId: input.catalogId,
    sku: input.sku,
    legacySku: input.legacySku || undefined,
    name: input.name,
    slug: { uz: input.slugUz, ru: input.slugRu },
    price,
    formattedPrice: formatCardPrice(input),
    category: input.categorySlug,
    image: input.imageUrl || '/logo.png',
    shortDescription: {
      uz: input.shortDescription?.uz || '',
      ru: input.shortDescription?.ru || input.shortDescription?.uz || '',
    },
    specs: [],
    itemsPerPackage: input.unitsPerPack,
    packsPerCarton: input.packsPerCarton,
    unitsPerCarton: input.unitsPerCarton,
    minimumOrderQuantity: input.minimumOrderQuantity,
    orderStep: input.orderStep,
    saleUnit: input.saleUnit,
    priceMode: input.priceMode,
    availabilityStatus: input.availabilityStatus,
    isBestSeller: Boolean(input.isBestSeller),
    isNew: Boolean(input.isNew),
  };
}

export function buildProductTelegramMessage(input: {
  locale: 'uz' | 'ru';
  sku: string;
  name: string;
  quantity: number;
  saleUnit: string;
  url: string;
}): string {
  const unit = saleUnitLabel(input.saleUnit, input.locale);
  if (input.locale === 'ru') {
    return `Здравствуйте. Нужен товар ${input.sku} — ${input.name} с сайта PaketShop.uz, ${input.quantity} ${unit}. Отправьте сегодняшнюю цену и наличие. Страница: ${input.url}`;
  }
  return `Assalomu alaykum. PaketShop.uz saytidagi ${input.sku} — ${input.name} mahsulotidan ${input.quantity} ${unit} kerak. Bugungi narxi va qoldig‘ini yuboring. Sahifa: ${input.url}`;
}
