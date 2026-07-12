import { describe, expect, it } from 'vitest';
import {
  approximatePiecePrice,
  buildProductTelegramMessage,
  formatCardPrice,
  formatUzsPrice,
  legacyIdFromSku,
  mapCatalogCard,
} from '@/lib/domain/catalogMapping';

describe('catalog mapping', () => {
  it('extracts legacy numeric ids from PS- SKUs only', () => {
    expect(legacyIdFromSku('PS-28')).toBe(28);
    expect(legacyIdFromSku('ST-250-KR')).toBeNull();
    expect(legacyIdFromSku(null)).toBeNull();
  });

  it('formats UZS prices per locale', () => {
    expect(formatUzsPrice(55000)).toBe("55 000 so'm");
    expect(formatUzsPrice(55000, 'ru')).toBe('55 000 сум');
  });

  it('formats card prices per price mode', () => {
    expect(formatCardPrice({ publicPrice: '55000', priceMode: 'PUBLIC_EXACT' })).toBe("55 000 so'm");
    expect(formatCardPrice({ publicPrice: 55000, priceMode: 'FROM_PRICE' })).toBe("55 000 so'mdan");
    expect(formatCardPrice({ publicPrice: 55000, priceMode: 'REQUEST_ONLY' })).toBe('');
    expect(formatCardPrice({ publicPrice: null, priceMode: 'PUBLIC_EXACT' })).toBe('');
  });

  it('derives an approximate piece price from the pack total', () => {
    expect(approximatePiecePrice(55000, 220)).toBe(250);
    expect(approximatePiecePrice(55000, 1)).toBeNull();
    expect(approximatePiecePrice(null, 220)).toBeNull();
  });

  it('maps a Prisma product to a legacy-compatible catalog card', () => {
    const card = mapCatalogCard({
      catalogId: 'product_28',
      sku: 'PS-28',
      legacySku: 'PS-28',
      slugUz: 'sous-idishi',
      slugRu: 'sousnik',
      publicPrice: '55000',
      priceMode: 'PUBLIC_EXACT',
      availabilityStatus: 'IN_STOCK',
      saleUnit: 'PACK',
      unitsPerPack: 220,
      packsPerCarton: 1,
      unitsPerCarton: 220,
      minimumOrderQuantity: 1,
      orderStep: 1,
      isBestSeller: true,
      categorySlug: 'bir-martalik-idishlar',
      imageUrl: 'https://example.com/x.png',
      name: { uz: 'Sous idishi', ru: 'Соусник' },
      shortDescription: { uz: 'Qisqa' },
    });

    expect(card.id).toBe(28);
    expect(card.catalogId).toBe('product_28');
    expect(card.formattedPrice).toBe("55 000 so'm");
    expect(card.itemsPerPackage).toBe(220);
    expect(card.category).toBe('bir-martalik-idishlar');
    expect(card.shortDescription.ru).toBe('Qisqa');
    expect(card.isBestSeller).toBe(true);
  });

  it('builds spec-compliant Telegram order messages', () => {
    const uz = buildProductTelegramMessage({
      locale: 'uz', sku: 'PS-28', name: 'Sous idishi', quantity: 5, saleUnit: 'PACK', url: 'https://paketshop.uz/uz/product/sous-idishi-28',
    });
    expect(uz).toContain('PS-28 — Sous idishi');
    expect(uz).toContain('5 qadoq');
    expect(uz).toContain('https://paketshop.uz/uz/product/sous-idishi-28');

    const ru = buildProductTelegramMessage({
      locale: 'ru', sku: 'PS-28', name: 'Соусник', quantity: 5, saleUnit: 'PACK', url: 'https://paketshop.uz/ru/product/sousnik-28',
    });
    expect(ru).toContain('5 упаковка');
    expect(ru).toContain('Здравствуйте');
  });
});
