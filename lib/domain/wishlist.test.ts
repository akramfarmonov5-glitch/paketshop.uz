import { describe, expect, it } from 'vitest';
import type { Product } from '@/types';
import { dedupeWishlist, isSameWishlistProduct } from './wishlist';

function product(overrides: Partial<Product>): Product {
  return {
    id: 0,
    name: '',
    price: 0,
    formattedPrice: '',
    category: '',
    image: '/logo.png',
    shortDescription: '',
    specs: [],
    ...overrides,
  };
}

describe('wishlist identity', () => {
  it('matches Prisma and legacy copies by numeric legacy id', () => {
    const prismaProduct = product({
      id: 1,
      catalogId: 'catalog-1',
      sku: 'PS-01',
      name: { uz: 'Premium stakan', ru: 'Premium стакан' },
    });
    const legacyProduct = product({ id: 1, name: 'Premium stakan' });

    expect(isSameWishlistProduct(prismaProduct, legacyProduct)).toBe(true);
  });

  it('keeps distinct new products that both have id zero', () => {
    const first = product({ catalogId: 'catalog-1', sku: 'SKU-1', name: 'Birinchi' });
    const second = product({ catalogId: 'catalog-2', sku: 'SKU-2', name: 'Ikkinchi' });

    expect(isSameWishlistProduct(first, second)).toBe(false);
  });

  it('does not match stale legacy data to a different product with the same numeric id', () => {
    const currentProduct = product({
      id: 2,
      catalogId: 'catalog-2',
      sku: 'PS-02',
      name: 'Sous idishi',
    });
    const staleLegacyProduct = product({ id: 2, name: 'Premium stakan' });

    expect(isSameWishlistProduct(currentProduct, staleLegacyProduct)).toBe(false);
  });

  it('removes duplicate local and database copies', () => {
    const prismaProduct = product({
      id: 1,
      catalogId: 'catalog-1',
      sku: 'PS-01',
      name: { uz: 'Premium stakan', ru: 'Premium стакан' },
    });
    const legacyProduct = product({ id: 7, name: 'Premium stakan' });

    expect(dedupeWishlist([prismaProduct, legacyProduct])).toEqual([prismaProduct]);
  });
});
