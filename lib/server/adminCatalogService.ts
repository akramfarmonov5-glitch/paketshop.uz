import 'server-only';
import type { AdminProductInput } from '@/lib/validation/adminCatalog';

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

export function auditJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}
