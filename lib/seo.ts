import type { Metadata } from 'next';

type Locale = 'uz' | 'ru';
type LocalizedText = Record<Locale, string>;

const SITE_URL = 'https://paketshop.uz';

export function localizedPageMetadata({
  lang,
  path,
  title,
  description,
}: {
  lang: string;
  path: string;
  title: LocalizedText;
  description: LocalizedText;
}): Metadata {
  const locale: Locale = lang === 'ru' ? 'ru' : 'uz';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const localizedPath = `/${locale}${normalizedPath}`;

  return {
    title: title[locale],
    description: description[locale],
    alternates: {
      canonical: localizedPath,
      languages: {
        uz: `/uz${normalizedPath}`,
        ru: `/ru${normalizedPath}`,
        'x-default': `/uz${normalizedPath}`,
      },
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${localizedPath}`,
      siteName: 'PaketShop.uz',
      locale: locale === 'ru' ? 'ru_RU' : 'uz_UZ',
      title: title[locale],
      description: description[locale],
    },
  };
}

export const privatePageMetadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};
