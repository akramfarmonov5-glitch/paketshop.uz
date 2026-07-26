import type { Product } from '@/types';
import { parseLocalizedObject } from '@/lib/i18nUtils';

function normalizedNames(product: Product): string[] {
  const name = parseLocalizedObject(product.name);

  return [name.uz, name.ru]
    .map((value) => value
      .normalize('NFKC')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[\u2010-\u2015\u2212]/g, '-')
      .replace(/[ʻʼ’‘`´]/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleLowerCase('uz'))
    .filter(Boolean);
}

export function isSameWishlistProduct(first: Product, second: Product): boolean {
  // A catalog record may be re-imported and receive a new database id. Matching
  // ids are definitive, but different ids must still fall through to the stable
  // SKU/name checks so an old saved copy does not appear beside the current one.
  if (first.catalogId && second.catalogId && first.catalogId === second.catalogId) {
    return true;
  }

  const firstNames = normalizedNames(first);
  const secondNames = new Set(normalizedNames(second));
  const namesMatch = firstNames.some((name) => secondNames.has(name));
  const bothHaveNames = firstNames.length > 0 && secondNames.size > 0;

  if (first.sku && second.sku) {
    return first.sku === second.sku && (!bothHaveNames || namesMatch);
  }
  if (first.legacySku && second.legacySku) {
    return first.legacySku === second.legacySku && (!bothHaveNames || namesMatch);
  }

  return namesMatch;
}

export function dedupeWishlist(products: Product[]): Product[] {
  return products.filter((product, index, items) => (
    items.findIndex((item) => isSameWishlistProduct(item, product)) === index
  ));
}
