export const SITE_NAME = 'PaketShop.uz';
export const SITE_URL = 'https://www.paketshop.uz';

export function absoluteSiteUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function localizedOgImageUrl(lang: string): string {
  const locale = lang === 'ru' ? 'ru' : 'uz';
  return `${SITE_URL}/${locale}/opengraph-image`;
}
