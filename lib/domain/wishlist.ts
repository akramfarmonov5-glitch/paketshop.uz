import type { Product } from '@/types';

function normalizedNames(product: Product): string[] {
  const values = typeof product.name === 'string'
    ? [product.name]
    : [product.name.uz, product.name.ru];

  return values
    .map((value) => value.trim().toLocaleLowerCase('uz'))
    .filter(Boolean);
}

export function isSameWishlistProduct(first: Product, second: Product): boolean {
  if (first.catalogId && second.catalogId) return first.catalogId === second.catalogId;
  if (first.sku && second.sku) return first.sku === second.sku;
  if (first.legacySku && second.legacySku) return first.legacySku === second.legacySku;

  const secondNames = new Set(normalizedNames(second));
  return normalizedNames(first).some((name) => secondNames.has(name));
}

export function dedupeWishlist(products: Product[]): Product[] {
  return products.filter((product, index, items) => (
    items.findIndex((item) => isSameWishlistProduct(item, product)) === index
  ));
}
