import { describe, expect, it } from 'vitest';
import { mapAssistantProduct, type AssistantProductRow } from '@/lib/domain/assistantCatalog';

const NOW = new Date('2026-10-01T08:00:00.000Z');
const BASE = 'https://www.paketshop.uz';

function row(overrides: Partial<AssistantProductRow> = {}): AssistantProductRow {
  return {
    sku: 'PS-KRAFT-20X30',
    legacySku: 'PS-12',
    slugUz: 'kraft-paket-20x30',
    slugRu: 'kraft-paket-20x30-ru',
    availabilityStatus: 'IN_STOCK',
    priceMode: 'PUBLIC_EXACT',
    baseUnit: 'PIECE',
    saleUnit: 'PACK',
    unitsPerPack: 100,
    packsPerCarton: 10,
    unitsPerCarton: 1000,
    minimumOrderQuantity: 1,
    orderStep: 1,
    publicPrice: '85000.00',
    lengthCm: '30.00',
    widthCm: '20',
    heightCm: null,
    volumeMl: 0,
    diameterMm: null,
    thicknessMicron: 40,
    isNew: false,
    isBestSeller: true,
    updatedAt: new Date('2026-09-30T10:00:00.000Z'),
    category: {
      slugUz: 'kraft-paketlar',
      translations: [
        { locale: 'uz', name: 'Kraft paketlar' },
        { locale: 'ru', name: 'Крафт пакеты' },
      ],
    },
    translations: [
      { locale: 'uz', name: 'Kraft paket 20x30', shortDescription: 'Qisqa', description: '<p>Mustahkam &amp; qulay</p><p>Qadoq: 100 dona</p>' },
      { locale: 'ru', name: 'Крафт пакет 20x30', shortDescription: null, description: null },
    ],
    media: [1, 2, 3, 4, 5, 6].map((n) => ({ media: { url: `https://cdn.example/${n}.jpg` } })),
    variants: [
      { sku: 'PS-KRAFT-20X30-BR', color: 'Jigarrang', size: null, volumeMl: null, thicknessMicron: null, unitsPerPack: 100, price: '90000', availabilityStatus: 'IN_STOCK' },
      { sku: 'PS-KRAFT-20X30-WH', color: 'Oq', size: null, volumeMl: null, thicknessMicron: null, unitsPerPack: null, price: null, availabilityStatus: 'LOW_STOCK' },
    ],
    priceTiers: [
      { customerGroupId: null, minQuantity: 50, maxQuantity: 99, price: '80000', priceUnit: 'PACK', startsAt: null, endsAt: null },
      { customerGroupId: null, minQuantity: 10, maxQuantity: 49, price: '83000', priceUnit: 'PACK', startsAt: null, endsAt: null },
    ],
    ...overrides,
  };
}

describe('mapAssistantProduct', () => {
  it('maps the public catalogue fields', () => {
    const product = mapAssistantProduct(row(), { baseUrl: BASE, now: NOW });

    expect(product.sku).toBe('PS-KRAFT-20X30');
    expect(product.url).toEqual({
      uz: `${BASE}/uz/product/kraft-paket-20x30-12`,
      ru: `${BASE}/ru/product/kraft-paket-20x30-ru-12`,
    });
    expect(product.name).toEqual({ uz: 'Kraft paket 20x30', ru: 'Крафт пакет 20x30' });
    expect(product.category).toEqual({ slug: 'kraft-paketlar', name: { uz: 'Kraft paketlar', ru: 'Крафт пакеты' } });
    expect(product.publicPrice).toBe(85000);
    expect(product.approxPiecePrice).toBe(850);
    expect(product.unitsPerPack).toBe(100);
    expect(product.availabilityStatus).toBe('IN_STOCK');
    expect(product.isBestSeller).toBe(true);
    expect(product.updatedAt).toBe('2026-09-30T10:00:00.000Z');
    expect(product.variants).toHaveLength(2);
    expect(product.variants[0]).toMatchObject({ color: 'Jigarrang', price: 90000 });
    expect(product.variants[1].price).toBeNull();
  });

  it('keeps only measured dimensions, at most four images and plain-text descriptions', () => {
    const product = mapAssistantProduct(row(), { baseUrl: BASE, now: NOW });

    expect(product.dimensions).toEqual({ lengthCm: 30, widthCm: 20, thicknessMicron: 40 });
    expect(product.images).toEqual([1, 2, 3, 4].map((n) => `https://cdn.example/${n}.jpg`));
    expect(product.description.uz).toBe('Mustahkam & qulay\nQadoq: 100 dona');
    expect(product.shortDescription.uz).toBe('Qisqa');
  });

  it('does not copy a description from the other language, but names may fall back', () => {
    const product = mapAssistantProduct(
      row({ translations: [{ locale: 'uz', name: 'Faqat uzbekcha', shortDescription: 'Qisqa', description: 'Uzun' }] }),
      { baseUrl: BASE, now: NOW },
    );

    expect(product.name.ru).toBe('Faqat uzbekcha');
    expect(product.description).toEqual({ uz: 'Uzun', ru: '' });
    expect(product.shortDescription).toEqual({ uz: 'Qisqa', ru: '' });
  });

  it('uses the plain slug when the product has no legacy id', () => {
    const product = mapAssistantProduct(row({ legacySku: null }), { baseUrl: `${BASE}/`, now: NOW });

    expect(product.url.uz).toBe(`${BASE}/uz/product/kraft-paket-20x30`);
    expect(product.url.ru).toBe(`${BASE}/ru/product/kraft-paket-20x30-ru`);
  });

  it('exposes only active public price tiers, sorted by quantity', () => {
    const product = mapAssistantProduct(
      row({
        priceTiers: [
          { customerGroupId: null, minQuantity: 100, maxQuantity: null, price: '78000', priceUnit: 'PACK', startsAt: null, endsAt: null },
          { customerGroupId: 'reseller', minQuantity: 10, maxQuantity: null, price: '60000', priceUnit: 'PACK', startsAt: null, endsAt: null },
          { customerGroupId: null, minQuantity: 10, maxQuantity: 99, price: '82000', priceUnit: 'PACK', startsAt: new Date('2026-09-01T00:00:00Z'), endsAt: new Date('2026-12-31T00:00:00Z') },
          { customerGroupId: null, minQuantity: 5, maxQuantity: 9, price: '84000', priceUnit: 'PACK', startsAt: new Date('2026-11-01T00:00:00Z'), endsAt: null },
          { customerGroupId: null, minQuantity: 2, maxQuantity: 4, price: '86000', priceUnit: 'PACK', startsAt: null, endsAt: new Date('2026-09-15T00:00:00Z') },
          { customerGroupId: null, minQuantity: 3, maxQuantity: 4, price: '0', priceUnit: 'PACK', startsAt: null, endsAt: null },
        ],
      }),
      { baseUrl: BASE, now: NOW },
    );

    expect(product.priceTiers).toEqual([
      { minQuantity: 10, maxQuantity: 99, price: 82000, priceUnit: 'PACK' },
      { minQuantity: 100, maxQuantity: null, price: 78000, priceUnit: 'PACK' },
    ]);
  });

  it.each(['REQUEST_ONLY', 'LOGIN_REQUIRED'])('hides every price for %s products', (priceMode) => {
    const product = mapAssistantProduct(row({ priceMode }), { baseUrl: BASE, now: NOW });

    expect(product.priceMode).toBe(priceMode);
    expect(product.publicPrice).toBeNull();
    expect(product.approxPiecePrice).toBeNull();
    expect(product.priceTiers).toEqual([]);
    expect(product.variants.every((variant) => variant.price === null)).toBe(true);
  });

  it('keeps FROM_PRICE products priced so the assistant can say "from"', () => {
    const product = mapAssistantProduct(row({ priceMode: 'FROM_PRICE' }), { baseUrl: BASE, now: NOW });

    expect(product.priceMode).toBe('FROM_PRICE');
    expect(product.publicPrice).toBe(85000);
  });

  it('never carries internal prices or supplier data, even if the row has them', () => {
    const leaky = {
      ...row(),
      purchasePrice: '41111.11',
      minimumAllowedPrice: '52222.22',
      resellerPrice: '63333.33',
      organizationPrice: '74444.44',
      supplier: { name: 'Secret Supplier LLC', phone: '+998901112233', internalNote: 'cost+30%' },
      supplierId: 'supplier-1',
    } as AssistantProductRow;

    const json = JSON.stringify(mapAssistantProduct(leaky, { baseUrl: BASE, now: NOW }));

    for (const secret of ['41111', '52222', '63333', '74444', 'Secret Supplier', '901112233', 'cost+30', 'purchase', 'supplier']) {
      expect(json).not.toContain(secret);
    }
  });
});
