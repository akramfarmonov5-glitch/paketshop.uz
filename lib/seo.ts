import type { Metadata } from 'next';
import { localizedOgImageUrl, SITE_NAME, SITE_URL } from './site';

type Locale = 'uz' | 'ru';
type LocalizedText = Record<Locale, string>;

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
      siteName: SITE_NAME,
      locale: locale === 'ru' ? 'ru_RU' : 'uz_UZ',
      title: title[locale],
      description: description[locale],
      images: [
        {
          url: localizedOgImageUrl(locale),
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${title[locale]}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title[locale],
      description: description[locale],
      images: [localizedOgImageUrl(locale)],
    },
  };
}

export const privatePageMetadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};
