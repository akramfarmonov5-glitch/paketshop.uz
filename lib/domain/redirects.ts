// 301 redirect yo'llarini normallashtirish (spec §27).

const LOCALES = ['uz', 'ru', 'en'] as const;

/** Yo'lni taqqoslash uchun kanonik ko'rinishga keltiradi: kichik harf, boshida /, oxirida / yo'q, query/hashsiz. */
export function normalizeRedirectPath(raw: unknown): string {
  let path = String(raw ?? '').trim();
  if (!path) return '';

  // To'liq URL kiritilsa faqat yo'l qismini olamiz
  try {
    if (/^https?:\/\//i.test(path)) path = new URL(path).pathname;
  } catch {
    return '';
  }

  path = path.split(/[?#]/)[0];
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/{2,}/g, '/');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return path.toLowerCase().slice(0, 500);
}

/** Yo'l boshidagi til prefiksini ajratadi: '/uz/product/x' -> { locale: 'uz', rest: '/product/x' } */
export function splitLocale(path: string): { locale: string | null; rest: string } {
  const match = /^\/([a-z]{2})(\/.*)?$/.exec(path);
  if (match && (LOCALES as readonly string[]).includes(match[1])) {
    return { locale: match[1], rest: match[2] || '/' };
  }
  return { locale: null, rest: path };
}

/** Redirect maqsad yo'liga so'ralgan tilni qaytaradi: toPath tilsiz bo'lsa, so'rov tili qo'shiladi. */
export function localizeTargetPath(toPath: string, requestLocale: string | null): string {
  const normalized = normalizeRedirectPath(toPath);
  if (!normalized) return '/';
  const { locale } = splitLocale(normalized);
  if (locale || !requestLocale) return normalized;
  return normalized === '/' ? `/${requestLocale}` : `/${requestLocale}${normalized}`;
}

/** Kiruvchi yo'l uchun qidiriladigan fromPath variantlari: aynan o'zi va til prefiksisiz varianti. */
export function redirectLookupCandidates(path: string): string[] {
  const normalized = normalizeRedirectPath(path);
  if (!normalized) return [];
  const { locale, rest } = splitLocale(normalized);
  const candidates = new Set<string>([normalized]);
  if (locale && rest !== '/') candidates.add(rest);
  return [...candidates];
}
