import type { Product } from '@/types';

export function isSameWishlistProduct(first: Product, second: Product): boolean {
  if (first.catalogId && second.catalogId && first.catalogId === second.catalogId) return true;
  if (first.sku && second.sku && first.sku === second.sku) return true;
  if (first.legacySku && second.legacySku && first.legacySku === second.legacySku) return true;
  return first.id > 0 && second.id > 0 && first.id === second.id;
}

export function dedupeWishlist(products: Product[]): Product[] {
  return products.filter((product, index, items) => (
    items.findIndex((item) => isSameWishlistProduct(item, product)) === index
  ));
}
