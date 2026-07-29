import CategoryContent from './CategoryContent';
import { fetchGlobalData } from '../../../../lib/fetchGlobalData';
import { findCategoryByValue, getCategorySlug } from '../../../../lib/categoryUtils';
import { getLocalizedText } from '../../../../lib/i18nUtils';
import { findActiveRedirect } from '../../../../lib/server/redirects';
import { getActiveCategoryProductCount } from '../../../../lib/server/prismaCatalog';
import { db } from '../../../../lib/server/db';
import { localizedOgImageUrl, SITE_NAME, SITE_URL } from '../../../../lib/site';
import { notFound, permanentRedirect, redirect } from 'next/navigation';

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await db.category.findMany({
    where: { active: true, products: { some: { status: 'ACTIVE' } } },
    select: { slugUz: true, slugRu: true },
    orderBy: { sortOrder: 'asc' },
    take: 500,
  });

  return categories.flatMap((category) => [
    { lang: 'uz', slug: category.slugUz },
    { lang: 'ru', slug: category.slugRu || category.slugUz },
  ]);
}

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
    const productCount = await getActiveCategoryProductCount(slug).catch(() => null);
    const description =
      getLocalizedText(category.description, activeLang) ||
      (activeLang === 'ru'
        ? `${name} оптом для кафе, магазинов и организаций. Уточните цены, наличие и доставку по Узбекистану в PaketShop.uz.`
        : `${name} mahsulotlari kafe, savdo va tashkilotlar uchun ulgurji. PaketShop.uz orqali narx, qoldiq va yetkazib berishni aniqlang.`);
    const canonicalPath = `/${activeLang}/category/${getCategorySlug(category, activeLang)}`;
    const image = category.image && !category.image.endsWith('/logo.png')
      ? category.image
      : localizedOgImageUrl(activeLang);

    const alternates: Record<string, string> = {};
    for (const altLang of ['uz', 'ru']) {
      alternates[altLang] = `/${altLang}/category/${getCategorySlug(category, altLang)}`;
    }
    alternates['x-default'] = `/uz/category/${getCategorySlug(category, 'uz')}`;

    return {
      title: `${name} | PaketShop.uz`,
      description,
      alternates: {
        canonical: canonicalPath,
        languages: alternates,
      },
      openGraph: {
        title: `${name} | PaketShop.uz`,
        description,
        url: `${SITE_URL}${canonicalPath}`,
        siteName: SITE_NAME,
        locale: activeLang === 'ru' ? 'ru_RU' : 'uz_UZ',
        images: [{ url: image, alt: name }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name} | PaketShop.uz`,
        description,
        images: [image],
      },
      ...(productCount === 0 ? { robots: { index: false, follow: true } } : {}),
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
    || (activeLang === 'ru'
      ? `${name} оптом для кафе, магазинов и организаций. Уточните цены, наличие и доставку по Узбекистану в ${SITE_NAME}.`
      : `${name} mahsulotlari kafe, savdo va tashkilotlar uchun ulgurji. ${SITE_NAME} orqali narx, qoldiq va yetkazib berishni aniqlang.`);
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
      <header className="border-b border-slate-200 bg-white px-4 pb-8 pt-28 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-slate-950">{name}</h1>
          <p className="mt-3 max-w-3xl text-slate-600">{description}</p>
        </div>
      </header>
      <CategoryContent
        lang={activeLang}
        slug={canonicalSlug}
        products={products}
        categories={categories}
      />
    </>
  );
}
