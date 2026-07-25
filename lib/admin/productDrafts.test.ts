import { describe, expect, it } from 'vitest';
import {
  draftToTierPayload,
  draftToVariantPayload,
  emptyTierDraft,
  emptyVariantDraft,
  findDuplicateSkus,
  findTierOverlap,
  resolveProductSlugs,
  tierRowToDraft,
  validateDrafts,
  variantRowToDraft,
} from '@/lib/admin/productDrafts';

const slugify = (value: string) => value.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

describe('resolveProductSlugs', () => {
  it('keeps existing slugs so editing never changes a public URL', () => {
    const existing = { slugUz: 'premium-kraft-stakan-250ml', slugRu: 'kraft-stakan-250ml-ru' };
    expect(resolveProductSlugs(existing, 'Premium Kraft Stakanlari To‘plami (250ml)', slugify)).toEqual(existing);
  });

  it('generates slugs only for a new product', () => {
    expect(resolveProductSlugs(null, 'Kraft stakan 250 ml', slugify)).toEqual({
      slugUz: 'kraft-stakan-250-ml',
      slugRu: 'kraft-stakan-250-ml-ru',
    });
  });
});

describe('variant draft conversion', () => {
  it('maps a database row to a draft, turning nulls into empty strings', () => {
    const draft = variantRowToDraft({
      id: 'variant_1',
      productId: 'product_1',
      sku: 'ST-250-KR',
      color: null,
      size: null,
      volumeMl: 250,
      thicknessMicron: null,
      unitsPerPack: 50,
      price: '47500',
      availabilityStatus: 'IN_STOCK',
      active: true,
    });

    expect(draft).toEqual({
      sku: 'ST-250-KR',
      color: '',
      size: '',
      volumeMl: '250',
      thicknessMicron: '',
      unitsPerPack: '50',
      price: '47500',
      availabilityStatus: 'IN_STOCK',
      active: true,
    });
  });

  it('drops empty fields and never emits id/productId (strict schema)', () => {
    const payload = draftToVariantPayload({
      ...emptyVariantDraft('IN_STOCK'),
      sku: 'st-250-kr',
      volumeMl: '250',
      price: '47500',
    });

    expect(payload).toEqual({ sku: 'ST-250-KR', availabilityStatus: 'IN_STOCK', active: true, volumeMl: 250, price: 47500 });
    expect(payload).not.toHaveProperty('id');
    expect(payload).not.toHaveProperty('productId');
    expect(payload).not.toHaveProperty('color');
  });

  it('round-trips a row through draft back to a payload', () => {
    const row = { id: 'v1', productId: 'p1', sku: 'A-1', color: 'oq', size: null, volumeMl: null, thicknessMicron: null, unitsPerPack: 20, price: null, availabilityStatus: 'LOW_STOCK', active: false };
    const payload = draftToVariantPayload(variantRowToDraft(row));

    expect(payload).toEqual({ sku: 'A-1', availabilityStatus: 'LOW_STOCK', active: false, color: 'oq', unitsPerPack: 20 });
  });
});

describe('tier draft conversion', () => {
  it('maps a row to a draft and back, keeping open-ended tiers null', () => {
    const draft = tierRowToDraft({ id: 't1', productId: 'p1', minQuantity: 10, maxQuantity: null, price: '44000', priceUnit: 'PACK' });
    expect(draft).toEqual({ minQuantity: '10', maxQuantity: '', price: '44000', priceUnit: 'PACK' });

    expect(draftToTierPayload(draft)).toEqual({ minQuantity: 10, maxQuantity: null, price: 44000, priceUnit: 'PACK' });
  });
});

describe('findDuplicateSkus', () => {
  it('detects a variant colliding with the product SKU, case-insensitively', () => {
    const variants = [{ ...emptyVariantDraft(), sku: 'ps-28' }];
    expect(findDuplicateSkus('PS-28', variants)).toEqual(['PS-28']);
  });

  it('detects two variants sharing a SKU', () => {
    const variants = [{ ...emptyVariantDraft(), sku: 'A-1' }, { ...emptyVariantDraft(), sku: 'A-1' }];
    expect(findDuplicateSkus('PS-1', variants)).toEqual(['A-1']);
  });

  it('returns nothing when all SKUs are distinct', () => {
    const variants = [{ ...emptyVariantDraft(), sku: 'A-1' }, { ...emptyVariantDraft(), sku: 'A-2' }];
    expect(findDuplicateSkus('PS-1', variants)).toEqual([]);
  });
});

describe('findTierOverlap', () => {
  const tier = (min: string, max: string) => ({ ...emptyTierDraft(), minQuantity: min, maxQuantity: max, price: '1000' });

  it('accepts adjacent non-overlapping ranges', () => {
    expect(findTierOverlap([tier('1', '4'), tier('5', '9'), tier('10', '')])).toBeNull();
  });

  it('flags an overlapping range', () => {
    expect(findTierOverlap([tier('1', '5'), tier('5', '9')])).toBe(1);
  });

  it('flags a range that follows an open-ended tier', () => {
    expect(findTierOverlap([tier('1', ''), tier('10', '20')])).toBe(1);
  });

  it('ignores incomplete rows still being typed', () => {
    expect(findTierOverlap([tier('', ''), tier('5', '9')])).toBeNull();
  });
});

describe('validateDrafts', () => {
  it('passes for a valid variant and tier set', () => {
    const variants = [{ ...emptyVariantDraft(), sku: 'A-1' }];
    const tiers = [{ ...emptyTierDraft(), minQuantity: '1', maxQuantity: '9', price: '50000' }];
    expect(validateDrafts('PS-1', variants, tiers)).toBeNull();
  });

  it('requires a SKU on every variant', () => {
    expect(validateDrafts('PS-1', [emptyVariantDraft()], [])).toMatch(/SKU kerak/);
  });

  it('rejects duplicate SKUs', () => {
    const variants = [{ ...emptyVariantDraft(), sku: 'PS-1' }];
    expect(validateDrafts('PS-1', variants, [])).toMatch(/takrorlanmasligi/);
  });

  it('rejects a tier without a price', () => {
    const tiers = [{ ...emptyTierDraft(), minQuantity: '1' }];
    expect(validateDrafts('PS-1', [], tiers)).toMatch(/narx kerak/);
  });

  it('rejects maxQuantity below minQuantity', () => {
    const tiers = [{ ...emptyTierDraft(), minQuantity: '10', maxQuantity: '5', price: '100' }];
    expect(validateDrafts('PS-1', [], tiers)).toMatch(/kichik bo/);
  });

  it('rejects overlapping tiers', () => {
    const tiers = [
      { ...emptyTierDraft(), minQuantity: '1', maxQuantity: '9', price: '100' },
      { ...emptyTierDraft(), minQuantity: '5', maxQuantity: '20', price: '90' },
    ];
    expect(validateDrafts('PS-1', [], tiers)).toMatch(/kesishadi/);
  });
});
