import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { AdminProductInput } from '@/lib/validation/adminCatalog';

vi.mock('server-only', () => ({}));

let preserveUnsubmittedProductFields: typeof import('./adminCatalogService').preserveUnsubmittedProductFields;

const input: AdminProductInput = {
  sku: 'TEST-1',
  legacySku: null,
  slugUz: 'test-1',
  slugRu: 'test-1-ru',
  categoryId: 'cm00000000000000000000001',
  status: 'ACTIVE',
  availabilityStatus: 'IN_STOCK',
  priceMode: 'PUBLIC_EXACT',
  baseUnit: 'PIECE',
  saleUnit: 'PACK',
  unitsPerPack: 10,
  packsPerCarton: 20,
  unitsPerCarton: 200,
  minimumOrderQuantity: 1,
  orderStep: 1,
  publicPrice: 50_000,
  originCountry: null,
  name: { uz: 'Sinov mahsulot', ru: 'Тестовый товар' },
  isFeatured: false,
  isNew: false,
  isBestSeller: false,
  isSeasonal: false,
  variants: [],
  priceTiers: [],
};

beforeAll(async () => {
  ({ preserveUnsubmittedProductFields } = await import('./adminCatalogService'));
});

describe('preserveUnsubmittedProductFields', () => {
  it('keeps supplier and internal prices omitted by the compact editor', () => {
    const result = preserveUnsubmittedProductFields(input, {
      brandId: 'cm00000000000000000000002',
      supplierId: 'cm00000000000000000000003',
      purchasePrice: { toString: () => '31000.50' },
      minimumAllowedPrice: '35000',
      resellerPrice: 40_000,
      organizationPrice: null,
    });

    expect(result).toMatchObject({
      brandId: 'cm00000000000000000000002',
      supplierId: 'cm00000000000000000000003',
      purchasePrice: 31_000.5,
      minimumAllowedPrice: 35_000,
      resellerPrice: 40_000,
      organizationPrice: null,
    });
  });

  it('honors explicit null values from a future full editor', () => {
    const result = preserveUnsubmittedProductFields(
      { ...input, brandId: null, purchasePrice: null },
      { brandId: 'cm00000000000000000000002', purchasePrice: 31_000 },
    );

    expect(result.brandId).toBeNull();
    expect(result.purchasePrice).toBeNull();
  });
});
