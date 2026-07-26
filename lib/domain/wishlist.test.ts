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
    const prismaProduct = product({ id: 1, catalogId: 'catalog-1', sku: 'PS-01' });
    const legacyProduct = product({ id: 1 });

    expect(isSameWishlistProduct(prismaProduct, legacyProduct)).toBe(true);
  });

  it('keeps distinct new products that both have id zero', () => {
    const first = product({ catalogId: 'catalog-1', sku: 'SKU-1' });
    const second = product({ catalogId: 'catalog-2', sku: 'SKU-2' });

    expect(isSameWishlistProduct(first, second)).toBe(false);
  });

  it('removes duplicate local and database copies', () => {
    const prismaProduct = product({ id: 1, catalogId: 'catalog-1', sku: 'PS-01' });
    const legacyProduct = product({ id: 1 });

    expect(dedupeWishlist([prismaProduct, legacyProduct])).toEqual([prismaProduct]);
  });
});
