import { slugify } from '../slugify';

export const PRODUCT_IMPORT_HEADERS = [
  'sku', 'category', 'nameUz', 'nameRu', 'saleUnit', 'unitsPerPack', 'packsPerCarton', 'price', 'priceMode', 'minimumOrderQuantity', 'orderStep', 'availabilityStatus', 'originCountry', 'imageUrl',
] as const;

export interface RawImportRow {
  [key: string]: unknown;
}

export function normalizeHeader(value: unknown): string {
  return String(value ?? '').trim().replace(/[\s_-]+/g, '').toLowerCase();
}

export function normalizeImportRecord(row: RawImportRow): RawImportRow {
  const aliases: Record<string, string> = {
    sku: 'sku', kategoriya: 'category', category: 'category', uznom: 'nameUz', nameuz: 'nameUz', runom: 'nameRu', nameru: 'nameRu', sotuvbirligi: 'saleUnit', saleunit: 'saleUnit', qadoqdagidona: 'unitsPerPack', unitsperpack: 'unitsPerPack', korobkadagiqadoq: 'packsPerCarton', packspercarton: 'packsPerCarton', narx: 'price', price: 'price', pricemode: 'priceMode', minbuyurtma: 'minimumOrderQuantity', minimumorderquantity: 'minimumOrderQuantity', orderstep: 'orderStep', mavjudlik: 'availabilityStatus', availabilitystatus: 'availabilityStatus', mamlakat: 'originCountry', origincountry: 'originCountry', rasmurl: 'imageUrl', imageurl: 'imageUrl',
  };
  const result: RawImportRow = {};
  for (const [key, value] of Object.entries(row)) {
    const canonical = aliases[normalizeHeader(key)];
    if (canonical) result[canonical] = value;
  }
  return result;
}

function text(value: unknown): string {
  return String(value ?? '').trim();
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function toAdminProductImport(row: RawImportRow, categoryId: string) {
  const normalized = normalizeImportRecord(row);
  const sku = text(normalized.sku).toUpperCase();
  const nameUz = text(normalized.nameUz);
  const nameRu = text(normalized.nameRu) || nameUz;
  const unitsPerPack = positiveInteger(normalized.unitsPerPack, 1);
  const packsPerCarton = positiveInteger(normalized.packsPerCarton, 1);
  const price = Number(normalized.price || 0);
  const saleUnit = text(normalized.saleUnit).toUpperCase() || 'PACK';
  const priceMode = text(normalized.priceMode).toUpperCase() || (price > 0 ? 'PUBLIC_EXACT' : 'REQUEST_ONLY');

  return {
    sku,
    slugUz: slugify(nameUz || sku),
    slugRu: `${slugify(nameUz || sku)}-ru`,
    categoryId,
    status: 'ACTIVE',
    availabilityStatus: text(normalized.availabilityStatus).toUpperCase() || 'CHECK_AVAILABILITY',
    priceMode,
    baseUnit: 'PIECE',
    saleUnit,
    unitsPerPack,
    packsPerCarton,
    unitsPerCarton: unitsPerPack * packsPerCarton,
    minimumOrderQuantity: positiveInteger(normalized.minimumOrderQuantity, 1),
    orderStep: positiveInteger(normalized.orderStep, 1),
    publicPrice: price > 0 ? price : null,
    originCountry: text(normalized.originCountry) || null,
    name: { uz: nameUz, ru: nameRu },
    variants: [],
    priceTiers: [],
    imageUrl: text(normalized.imageUrl) || null,
  };
}
