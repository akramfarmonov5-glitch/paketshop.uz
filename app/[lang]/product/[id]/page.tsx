import { cache } from 'react';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import B2BProductView from './B2BProductView';
import {
  catalogCardUrlSlug,
  getPrismaProductDetail,
} from '../../../../lib/server/prismaCatalog';
import { legacyIdFromSku } from '../../../../lib/domain/catalogMapping';
import { findActiveRedirect } from '../../../../lib/server/redirects';
import { db } from '../../../../lib/server/db';
import { localizedOgImageUrl, SITE_NAME, SITE_URL } from '../../../../lib/site';

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await db.product.findMany({
    where: { status: 'ACTIVE' },
    select: { slugUz: true, slugRu: true, legacySku: true },
    orderBy: { updatedAt: 'desc' },
    take: 5000,
  });

  return products.flatMap((product) => {
    const legacyId = legacyIdFromSku(product.legacySku);
    return (['uz', 'ru'] as const).map((lang) => {
      const slug = lang === 'ru' ? product.slugRu || product.slugUz : product.slugUz;
      return { lang, id: legacyId ? `${slug}-${legacyId}` : slug };
    });
  });
}

const resolveProductDetail = cache(async function resolveProductDetail(id: string, lang: string) {
  const locale = lang === 'ru' ? 'ru' as const : 'uz' as const;
  return getPrismaProductDetail(id, locale);
});

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; lang: string }>;
}) {
  const { id, lang } = await params;
  const detail = await resolveProductDetail(id, lang);

  if (!detail) {
    return {
      title: 'Mahsulot topilmadi',
      robots: { index: false, follow: false },
    };
  }

  const { locale } = detail;
  const title = `${detail.name} | PaketShop.uz`;
  const description = (detail.shortDescription || detail.description || detail.name).slice(0, 160);
  const canonicalPath = `/${locale}/product/${catalogCardUrlSlug(detail.card, locale)}`;
  const image = detail.images.find((candidate) => candidate && !candidate.endsWith('/logo.png'))
    || localizedOgImageUrl(locale);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        uz: `/uz/product/${catalogCardUrlSlug(detail.card, 'uz')}`,
        ru: `/ru/product/${catalogCardUrlSlug(detail.card, 'ru')}`,
        'x-default': `/uz/product/${catalogCardUrlSlug(detail.card, 'uz')}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      siteName: SITE_NAME,
      locale: locale === 'ru' ? 'ru_RU' : 'uz_UZ',
      images: [{ url: image, alt: detail.name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string; lang: string }>;
}) {
  const { id, lang } = await params;
  const activeLang = lang === 'ru' ? 'ru' : 'uz';
  const detail = await resolveProductDetail(id, activeLang);

  if (!detail) {
    const path = `/${activeLang}/product/${decodeURIComponent(id)}`;
    const resolved = await findActiveRedirect(path).catch(() => null);

    if (resolved && resolved.statusCode !== 410) {
      if (resolved.statusCode === 302) redirect(resolved.target);
      permanentRedirect(resolved.target);
    }

    notFound();
  }

  const canonicalSlug = catalogCardUrlSlug(detail.card, detail.locale);
  if (id !== canonicalSlug) {
    permanentRedirect(`/${detail.locale}/product/${canonicalSlug}`);
  }

  const hasPublicPrice =
    detail.packPrice > 0
    && !['REQUEST_ONLY', 'LOGIN_REQUIRED'].includes(detail.card.priceMode);
  const productMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: detail.name,
    image: detail.images,
    description: detail.shortDescription || detail.description || detail.name,
    sku: detail.card.sku,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(hasPublicPrice
      ? {
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/${detail.locale}/product/${canonicalSlug}`,
            priceCurrency: 'UZS',
            price: String(detail.packPrice),
            itemCondition: 'https://schema.org/NewCondition',
            availability: ['IN_STOCK', 'LOW_STOCK'].includes(detail.card.availabilityStatus)
              ? 'https://schema.org/InStock'
              : detail.card.availabilityStatus === 'OUT_OF_STOCK'
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/PreOrder',
            seller: { '@type': 'Organization', name: SITE_NAME },
          },
        }
      : {}),
  };
  const breadcrumbMarkup = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: detail.locale === 'ru' ? 'Главная' : 'Bosh sahifa',
        item: `${SITE_URL}/${detail.locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: detail.locale === 'ru' ? 'Каталог' : 'Katalog',
        item: `${SITE_URL}/${detail.locale}/catalog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: detail.categoryName,
        item: `${SITE_URL}/${detail.locale}/category/${detail.categoryUrlSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: detail.name,
        item: `${SITE_URL}/${detail.locale}/product/${canonicalSlug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productMarkup) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbMarkup) }}
      />
      <B2BProductView detail={detail} />
    </>
  );
}
