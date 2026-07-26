import CategoryContent from './CategoryContent';
import { fetchGlobalData } from '../../../../lib/fetchGlobalData';
import { findCategoryByValue, getCategorySlug } from '../../../../lib/categoryUtils';
import { getLocalizedText } from '../../../../lib/i18nUtils';
import { findActiveRedirect } from '../../../../lib/server/redirects';
import { SITE_NAME, SITE_URL } from '../../../../lib/site';
import { notFound, permanentRedirect, redirect } from 'next/navigation';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}) {
  const { slug, lang } = await params;
  const activeLang = lang || 'uz';

  try {
    const { categories } = await fetchGlobalData();
    const category = findCategoryByValue(slug, categories);

    if (!category) {
      return {
        title: 'Kategoriya topilmadi | PaketShop.uz',
        robots: { index: false, follow: false },
      };
    }

    const name = getLocalizedText(category.name, activeLang);
    const description =
      getLocalizedText(category.description, activeLang) ||
      `${name} - PaketShop.uz da sifatli mahsulotlar`;

    const alternates: Record<string, string> = {};
    for (const altLang of ['uz', 'ru']) {
      alternates[altLang] = `/${altLang}/category/${getCategorySlug(category, altLang)}`;
    }
    alternates['x-default'] = `/uz/category/${getCategorySlug(category, 'uz')}`;

    return {
      title: `${name} | PaketShop.uz`,
      description,
      alternates: {
        canonical: `/${activeLang}/category/${getCategorySlug(category, activeLang)}`,
        languages: alternates,
      },
      openGraph: {
        title: `${name} | PaketShop.uz`,
        description,
        url: `${SITE_URL}/${activeLang}/category/${getCategorySlug(category, activeLang)}`,
        images: category.image ? [{ url: category.image, alt: name }] : undefined,
      },
    };
  } catch {
    return { title: 'Kategoriya | PaketShop.uz' };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}) {
  const { slug, lang } = await params;
  const activeLang = lang || 'uz';
  const { products, categories } = await fetchGlobalData();
  const category = findCategoryByValue(slug, categories);

  if (!category) {
    const resolved = await findActiveRedirect(
      `/${activeLang}/category/${decodeURIComponent(slug)}`,
    ).catch(() => null);
    if (resolved && resolved.statusCode !== 410) {
      if (resolved.statusCode === 302) redirect(resolved.target);
      permanentRedirect(resolved.target);
    }
    notFound();
  }

  const canonicalSlug = getCategorySlug(category, activeLang);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/${activeLang}/category/${canonicalSlug}`);
  }

  const name = getLocalizedText(category.name, activeLang);
  const description = getLocalizedText(category.description, activeLang)
    || `${name} — ${SITE_NAME} ulgurji katalogi`;
  const collectionMarkup = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${SITE_URL}/${activeLang}/category/${canonicalSlug}`,
  };
  const breadcrumbMarkup = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: activeLang === 'ru' ? 'Главная' : 'Bosh sahifa',
        item: `${SITE_URL}/${activeLang}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name,
        item: `${SITE_URL}/${activeLang}/category/${canonicalSlug}`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionMarkup) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbMarkup) }} />
      <CategoryContent
        lang={activeLang}
        slug={canonicalSlug}
        products={products}
        categories={categories}
      />
    </>
  );
}
