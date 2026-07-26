import 'server-only';
import type { AdminProductInput } from '@/lib/validation/adminCatalog';

type ExistingProtectedProductFields = {
  brandId?: string | null;
  supplierId?: string | null;
  purchasePrice?: number | string | { toString(): string } | null;
  minimumAllowedPrice?: number | string | { toString(): string } | null;
  resellerPrice?: number | string | { toString(): string } | null;
  organizationPrice?: number | string | { toString(): string } | null;
};

function decimalNumber(value: ExistingProtectedProductFields['purchasePrice']) {
  if (value == null) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

/**
 * The compact admin editor does not expose procurement/supplier fields yet.
 * Preserve those persisted values when a full-form PATCH omits them, while still
 * allowing an explicit null to clear a field from a future editor.
 */
export function preserveUnsubmittedProductFields(
  input: AdminProductInput,
  existing: ExistingProtectedProductFields,
): AdminProductInput {
  return {
    ...input,
    brandId: input.brandId === undefined ? existing.brandId ?? null : input.brandId,
    supplierId: input.supplierId === undefined ? existing.supplierId ?? null : input.supplierId,
    purchasePrice: input.purchasePrice === undefined ? decimalNumber(existing.purchasePrice) : input.purchasePrice,
    minimumAllowedPrice: input.minimumAllowedPrice === undefined
      ? decimalNumber(existing.minimumAllowedPrice)
      : input.minimumAllowedPrice,
    resellerPrice: input.resellerPrice === undefined ? decimalNumber(existing.resellerPrice) : input.resellerPrice,
    organizationPrice: input.organizationPrice === undefined
      ? decimalNumber(existing.organizationPrice)
      : input.organizationPrice,
  };
}

export function productScalarData(input: AdminProductInput) {
  return {
    sku: input.sku.toUpperCase(),
    legacySku: input.legacySku || null,
    slugUz: input.slugUz,
    slugRu: input.slugRu,
    categoryId: input.categoryId,
    brandId: input.brandId || null,
    supplierId: input.supplierId || null,
    status: input.status,
    availabilityStatus: input.availabilityStatus,
    priceMode: input.priceMode,
    baseUnit: input.baseUnit,
    saleUnit: input.saleUnit,
    unitsPerPack: input.unitsPerPack,
    packsPerCarton: input.packsPerCarton,
    unitsPerCarton: input.unitsPerCarton,
    minimumOrderQuantity: input.minimumOrderQuantity,
    orderStep: input.orderStep,
    publicPrice: input.publicPrice ?? null,
    purchasePrice: input.purchasePrice ?? null,
    minimumAllowedPrice: input.minimumAllowedPrice ?? null,
    resellerPrice: input.resellerPrice ?? null,
    organizationPrice: input.organizationPrice ?? null,
    originCountry: input.originCountry || null,
    isFeatured: input.isFeatured,
    isNew: input.isNew,
    isBestSeller: input.isBestSeller,
    isSeasonal: input.isSeasonal,
  };
}

export function productTranslations(input: AdminProductInput, productId: string) {
  return (['uz', 'ru'] as const).map((locale) => ({
    productId,
    locale,
    name: input.name[locale],
    shortDescription: input.shortDescription?.[locale] || null,
    description: input.description?.[locale] || null,
    searchText: `${input.sku} ${input.name[locale]} ${input.shortDescription?.[locale] || ''}`.trim(),
  }));
}

export function productVariants(input: AdminProductInput, productId: string) {
  return input.variants.map((variant) => ({
    productId,
    sku: variant.sku.toUpperCase(),
    color: variant.color || null,
    size: variant.size || null,
    volumeMl: variant.volumeMl || null,
    thicknessMicron: variant.thicknessMicron || null,
    unitsPerPack: variant.unitsPerPack || null,
    price: variant.price ?? null,
    availabilityStatus: variant.availabilityStatus,
    active: variant.active,
  }));
}

export function productPriceTiers(input: AdminProductInput, productId: string) {
  return input.priceTiers.map((tier) => ({
    productId,
    customerGroupId: tier.customerGroupId || null,
    minQuantity: tier.minQuantity,
    maxQuantity: tier.maxQuantity ?? null,
    price: tier.price,
    priceUnit: tier.priceUnit,
    startsAt: tier.startsAt || null,
    endsAt: tier.endsAt || null,
  }));
}

/**
 * Mahsulot rasmlarini berilgan tartibda bog'laydi; ro'yxatdagi birinchisi asosiy bo'ladi.
 * Ro'yxat berilmasa (undefined) mavjud rasmlarga tegilmaydi.
 */
export function productMediaRows(mediaIds: string[] | undefined, productId: string) {
  if (!mediaIds) return null;
  return mediaIds.map((mediaId, index) => ({
    productId,
    mediaId,
    sortOrder: index,
    primary: index === 0,
  }));
}

export function auditJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}
