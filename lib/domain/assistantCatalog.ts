import {
  approximatePiecePrice,
  isPriceOnRequest,
  legacyIdFromSku,
  toPriceNumber,
  type LocalizedPair,
} from '@/lib/domain/catalogMapping';

// What the AI assistant may know about a product. Only data that is already public on paketshop.uz goes through here;
// purchase / minimum / reseller / organization prices and supplier details are never selected or mapped.

type Money = { toString(): string } | number | string | null | undefined;

export interface AssistantProductRow {
  sku: string;
  legacySku: string | null;
  slugUz: string;
  slugRu: string;
  availabilityStatus: string;
  priceMode: string;
  baseUnit: string;
  saleUnit: string;
  unitsPerPack: number;
  packsPerCarton: number;
  unitsPerCarton: number;
  minimumOrderQuantity: number;
  orderStep: number;
  publicPrice: Money;
  lengthCm: Money;
  widthCm: Money;
  heightCm: Money;
  volumeMl: number | null;
  diameterMm: number | null;
  thicknessMicron: number | null;
  isNew: boolean;
  isBestSeller: boolean;
  updatedAt: Date;
  category: { slugUz: string; translations: Array<{ locale: string; name: string }> };
  translations: Array<{
    locale: string;
    name: string;
    shortDescription: string | null;
    description: string | null;
  }>;
  media: Array<{ media: { url: string } }>;
  variants: Array<{
    sku: string;
    color: string | null;
    size: string | null;
    volumeMl: number | null;
    thicknessMicron: number | null;
    unitsPerPack: number | null;
    price: Money;
    availabilityStatus: string;
  }>;
  priceTiers: Array<{
    customerGroupId: string | null;
    minQuantity: number;
    maxQuantity: number | null;
    price: Money;
    priceUnit: string;
    startsAt: Date | null;
    endsAt: Date | null;
  }>;
}

export interface AssistantProduct {
  sku: string;
  legacySku: string | null;
  url: LocalizedPair;
  name: LocalizedPair;
  shortDescription: LocalizedPair;
  description: LocalizedPair;
  category: { slug: string; name: LocalizedPair };
  priceMode: string;
  /** Price per sale unit; null when the site shows "price on request". */
  publicPrice: number | null;
  approxPiecePrice: number | null;
  availabilityStatus: string;
  baseUnit: string;
  saleUnit: string;
  unitsPerPack: number;
  packsPerCarton: number;
  unitsPerCarton: number;
  minimumOrderQuantity: number;
  orderStep: number;
  dimensions: Partial<Record<'lengthCm' | 'widthCm' | 'heightCm' | 'volumeMl' | 'diameterMm' | 'thicknessMicron', number>>;
  images: string[];
  variants: Array<{
    sku: string;
    color: string | null;
    size: string | null;
    volumeMl: number | null;
    thicknessMicron: number | null;
    unitsPerPack: number | null;
    price: number | null;
    availabilityStatus: string;
  }>;
  priceTiers: Array<{ minQuantity: number; maxQuantity: number | null; price: number; priceUnit: string }>;
  isNew: boolean;
  isBestSeller: boolean;
  updatedAt: string;
}

export const ASSISTANT_IMAGE_LIMIT = 4;
const DESCRIPTION_LIMIT = 3000;

function moneyText(value: Money): string | number | null {
  if (value == null) return null;
  return typeof value === 'object' ? value.toString() : value;
}

function amount(value: Money): number {
  return toPriceNumber(moneyText(value));
}

function measure(value: Money): number | null {
  const raw = moneyText(value);
  if (raw == null) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function plainText(value: string | null | undefined): string {
  return (value || '')
    .replace(/<\s*br\s*\/?>|<\/\s*(?:p|div|li|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
    .slice(0, DESCRIPTION_LIMIT);
}

function localized<T extends { locale: string }>(items: T[], pick: (item: T) => string | null | undefined): LocalizedPair {
  const find = (locale: string) => {
    const item = items.find((entry) => entry.locale === locale);
    return item ? pick(item) || '' : '';
  };
  return { uz: find('uz'), ru: find('ru') };
}

// Names and category titles may fall back to the other language; descriptions must not (a Russian answer built from
// an Uzbek description would mix the two languages).
function withFallback(pair: LocalizedPair, last = ''): LocalizedPair {
  return { uz: pair.uz || pair.ru || last, ru: pair.ru || pair.uz || last };
}

// Same rule the storefront uses for product links: `<slug>-<legacy id>` for products migrated from the old catalogue.
function productUrl(baseUrl: string, locale: 'uz' | 'ru', slug: string, legacySku: string | null): string {
  const legacyId = legacyIdFromSku(legacySku);
  return `${baseUrl}/${locale}/product/${legacyId ? `${slug}-${legacyId}` : slug}`;
}

export function mapAssistantProduct(
  row: AssistantProductRow,
  options: { baseUrl: string; now?: Date },
): AssistantProduct {
  const now = options.now ?? new Date();
  const baseUrl = options.baseUrl.replace(/\/+$/, '');
  const hidePrice = isPriceOnRequest(row.priceMode);
  const publicPrice = hidePrice ? 0 : amount(row.publicPrice);

  const shortDescription = localized(row.translations, (translation) => translation.shortDescription);
  const description = localized(row.translations, (translation) => translation.description);
  const dimensionValues = {
    lengthCm: measure(row.lengthCm),
    widthCm: measure(row.widthCm),
    heightCm: measure(row.heightCm),
    volumeMl: measure(row.volumeMl),
    diameterMm: measure(row.diameterMm),
    thicknessMicron: measure(row.thicknessMicron),
  };

  const tiers = hidePrice
    ? []
    : row.priceTiers
      .filter((tier) => tier.customerGroupId == null)
      .filter((tier) => (!tier.startsAt || tier.startsAt <= now) && (!tier.endsAt || tier.endsAt >= now))
      .map((tier) => ({
        minQuantity: tier.minQuantity,
        maxQuantity: tier.maxQuantity,
        price: amount(tier.price),
        priceUnit: tier.priceUnit,
      }))
      .filter((tier) => tier.price > 0)
      .sort((a, b) => a.minQuantity - b.minQuantity);

  return {
    sku: row.sku,
    legacySku: row.legacySku,
    url: {
      uz: productUrl(baseUrl, 'uz', row.slugUz, row.legacySku),
      ru: productUrl(baseUrl, 'ru', row.slugRu || row.slugUz, row.legacySku),
    },
    name: withFallback(localized(row.translations, (translation) => translation.name), row.sku),
    shortDescription: { uz: plainText(shortDescription.uz), ru: plainText(shortDescription.ru) },
    description: { uz: plainText(description.uz), ru: plainText(description.ru) },
    category: {
      slug: row.category.slugUz,
      name: withFallback(localized(row.category.translations, (translation) => translation.name), row.category.slugUz),
    },
    priceMode: row.priceMode,
    publicPrice: publicPrice > 0 ? publicPrice : null,
    approxPiecePrice: publicPrice > 0 ? approximatePiecePrice(publicPrice, row.unitsPerPack) : null,
    availabilityStatus: row.availabilityStatus,
    baseUnit: row.baseUnit,
    saleUnit: row.saleUnit,
    unitsPerPack: row.unitsPerPack,
    packsPerCarton: row.packsPerCarton,
    unitsPerCarton: row.unitsPerCarton,
    minimumOrderQuantity: row.minimumOrderQuantity,
    orderStep: row.orderStep,
    dimensions: Object.fromEntries(
      Object.entries(dimensionValues).filter((entry): entry is [string, number] => entry[1] !== null),
    ),
    images: row.media.map((entry) => entry.media.url).filter(Boolean).slice(0, ASSISTANT_IMAGE_LIMIT),
    variants: row.variants.map((variant) => {
      const price = hidePrice ? 0 : amount(variant.price);
      return {
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        volumeMl: variant.volumeMl,
        thicknessMicron: variant.thicknessMicron,
        unitsPerPack: variant.unitsPerPack,
        price: price > 0 ? price : null,
        availabilityStatus: variant.availabilityStatus,
      };
    }),
    priceTiers: tiers,
    isNew: row.isNew,
    isBestSeller: row.isBestSeller,
    updatedAt: row.updatedAt.toISOString(),
  };
}
