import { describe, expect, it } from 'vitest';
import { normalizeImportRecord, toAdminProductImport } from './productImport';

describe('product import normalization', () => {
  it('accepts Uzbek and English column names', () => {
    expect(normalizeImportRecord({ SKU: 'A-1', Kategoriya: 'paketlar', 'Qadoqdagi dona': 50 })).toMatchObject({ sku: 'A-1', category: 'paketlar', unitsPerPack: 50 });
  });

  it('calculates units per carton and default price mode', () => {
    const product = toAdminProductImport({ SKU: 'A-1', nameUz: 'Kraft paket', nameRu: 'Крафт пакет', unitsPerPack: 50, packsPerCarton: 20, price: 1000 }, 'cm12345678901234567890123');
    expect(product.unitsPerCarton).toBe(1000);
    expect(product.priceMode).toBe('PUBLIC_EXACT');
  });
});
