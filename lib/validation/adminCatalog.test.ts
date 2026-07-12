import { describe, expect, it } from 'vitest';
import { adminProductSchema } from './adminCatalog';

const product = {
  sku: 'ST-250-KR', slugUz: 'kraft-stakan-250', slugRu: 'kraft-stakan-250-ru', categoryId: 'cm12345678901234567890123', status: 'ACTIVE', availabilityStatus: 'IN_STOCK', priceMode: 'PUBLIC_EXACT', baseUnit: 'PIECE', saleUnit: 'PACK', unitsPerPack: 50, packsPerCarton: 20, unitsPerCarton: 1000, minimumOrderQuantity: 1, orderStep: 1, publicPrice: 47500, name: { uz: 'Kraft stakan 250 ml', ru: 'Крафт стакан 250 мл' }, variants: [], priceTiers: [],
};

describe('admin product validation', () => {
  it('accepts valid packaging data', () => {
    expect(adminProductSchema.safeParse(product).success).toBe(true);
  });

  it('requires a public price for an exact price product', () => {
    expect(adminProductSchema.safeParse({ ...product, publicPrice: null }).success).toBe(false);
  });

  it('rejects duplicate product/variant SKUs', () => {
    expect(adminProductSchema.safeParse({ ...product, variants: [{ sku: 'ST-250-KR', availabilityStatus: 'IN_STOCK' }] }).success).toBe(false);
  });

  it('rejects overlapping price tiers', () => {
    const priceTiers = [
      { minQuantity: 1, maxQuantity: 10, price: 47000, priceUnit: 'PACK' },
      { minQuantity: 10, maxQuantity: 20, price: 45000, priceUnit: 'PACK' },
    ];
    expect(adminProductSchema.safeParse({ ...product, priceTiers }).success).toBe(false);
  });
});
