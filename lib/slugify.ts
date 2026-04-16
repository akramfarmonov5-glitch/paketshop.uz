/**
 * SEO-friendly slug yaratish
 * "Midnight Chronograph" → "midnight-chronograph"
 * "Ko'zoynaklar" → "kozoynaklar"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['`']/g, '') // O'zbek apostrof
    .replace(/[^\w\s-]/g, '') // Maxsus belgilar
    .replace(/[\s_]+/g, '-') // Bo'shliqlar → tire
    .replace(/-+/g, '-') // Bir nechta tire → bitta
    .replace(/^-+|-+$/g, ''); // Boshi/oxiridagi tire
}

/**
 * Mahsulot uchun unique slug yaratish (id bilan)
 */
export function productSlug(product: { id: number; name: string }): string {
  return `${slugify(product.name)}-${product.id}`;
}

/**
 * Slug dan mahsulot ID olish
 * "midnight-chronograph-1" → 1
 */
export function getIdFromSlug(slug: string): number | null {
  const parts = slug.split('-');
  const id = parseInt(parts[parts.length - 1], 10);
  return isNaN(id) ? null : id;
}

/**
 * Blog post uchun slug yaratish
 */
export function blogSlug(post: { id: string; title: string }): string {
  return `${slugify(post.title)}-${post.id}`;
}

/**
 * Blog slug dan ID olish
 */
export function getBlogIdFromSlug(slug: string): string | null {
  const parts = slug.split('-');
  return parts.length > 0 ? parts[parts.length - 1] : null;
}
