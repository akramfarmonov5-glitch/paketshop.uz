import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { ChevronRight, PackageCheck, Send } from 'lucide-react';
import B2BAddToCartButton from '@/components/B2BAddToCartButton';
import B2BWishlistButton from '@/components/B2BWishlistButton';
import { fetchGlobalData } from '../../../../lib/fetchGlobalData';
import { findCategoryByValue, getCategorySlug } from '../../../../lib/categoryUtils';
import { getLocalizedText } from '../../../../lib/i18nUtils';
import { findActiveRedirect } from '../../../../lib/server/redirects';
import { getActiveCategoryProductCount } from '../../../../lib/server/prismaCatalog';
import { getCatalog } from '../../../../lib/server/catalogRepository';
import { db } from '../../../../lib/server/db';
import { localizedOgImageUrl, SITE_NAME, SITE_URL } from '../../../../lib/site';
import { slugify } from '../../../../lib/slugify';

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await db.category.findMany({
    where: { active: true, products: { some: { status: 'ACTIVE' } } },
    select: { slugUz: true, slugRu: true },
    orderBy: { sortOrder: 'asc' },
    take: 500,
  }).catch(() => []);

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

const categoryCopy = {
  uz: {
    home: 'Bosh sahifa',
    catalog: 'Katalog',
    found: 'ta mahsulot',
    manager: 'Narx va qoldiqni menejer tasdiqlaydi',
    pack: 'Qadoqda',
    carton: 'Korobkada',
    price: '1 qadoq',
    request: 'Narxni aniqlang',
    telegram: 'Telegram orqali so‘rash',
    empty: 'Ushbu kategoriyada mahsulotlar topilmadi',
    previous: 'Oldingi',
    next: 'Keyingi',
  },
  ru: {
    home: 'Главная',
    catalog: 'Каталог',
    found: 'товаров',
    manager: 'Цену и наличие подтверждает менеджер',
    pack: 'В упаковке',
    carton: 'В коробке',
    price: '1 упаковка',
    request: 'Уточнить цену',
    telegram: 'Спросить в Telegram',
    empty: 'В этой категории товары не найдены',
    previous: 'Назад',
    next: 'Далее',
  },
} as const;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lang: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug, lang } = await params;
  const activeLang = (lang === 'ru' ? 'ru' : 'uz') as 'uz' | 'ru';
  const t = categoryCopy[activeLang];

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const queryVal = (val: string | string[] | undefined) =>
    Array.isArray(val) ? val[0] || '' : val || '';
  const page = Number(queryVal(resolvedSearchParams.page) || 1);
  const sort = queryVal(resolvedSearchParams.sort) || 'newest';

  const { categories } = await fetchGlobalData();
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
  const description =
    getLocalizedText(category.description, activeLang) ||
    (activeLang === 'ru'
      ? `${name} оптом для кафе, магазинов и организаций. Уточните цены, наличие и доставку по Узбекистану в ${SITE_NAME}.`
      : `${name} mahsulotlari kafe, savdo va tashkilotlar uchun ulgurji. ${SITE_NAME} orqali narx, qoldiq va yetkazib berishni aniqlang.`);

  const categorySlugUz = getLocalizedText(category.slug, 'uz');
  const result = await getCatalog({
    category: categorySlugUz,
    page,
    sort,
    locale: activeLang,
  });

  const pageHref = (p: number) => `/${activeLang}/category/${canonicalSlug}?page=${p}`;

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
        name: t.home,
        item: `${SITE_URL}/${activeLang}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t.catalog,
        item: `${SITE_URL}/${activeLang}/catalog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name,
        item: `${SITE_URL}/${activeLang}/category/${canonicalSlug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionMarkup) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbMarkup) }}
      />

      <main className="min-h-screen bg-slate-50 pb-24 pt-20 sm:pt-28 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="mb-4 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500"
            >
              <Link href={`/${activeLang}`} className="hover:text-red-700">
                {t.home}
              </Link>
              <ChevronRight size={14} />
              <Link href={`/${activeLang}/catalog`} className="hover:text-red-700">
                {t.catalog}
              </Link>
              <ChevronRight size={14} />
              <span className="font-semibold text-slate-800">{name}</span>
            </nav>

            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              <PackageCheck size={14} /> PaketShop
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-slate-950">
              {name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {description}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              <strong className="text-slate-950">{result.total}</strong> {t.found}
            </p>
            <p className="hidden text-sm text-slate-500 sm:block">{t.manager}</p>
          </div>

          {result.products.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.products.map((product) => {
                const productName = getLocalizedText(product.name, activeLang);
                const slugText =
                  getLocalizedText(product.slug, activeLang) ||
                  getLocalizedText(product.slug, 'uz') ||
                  slugify(productName);
                const url = `/${activeLang}/product/${product.id ? `${slugText}-${product.id}` : slugText}`;
                const telegramText =
                  activeLang === 'ru'
                    ? `Здравствуйте. Нужен товар ${product.sku} — ${productName}. Уточните цену и наличие: ${SITE_URL}${url}`
                    : `Assalomu alaykum. ${product.sku} — ${productName} mahsuloti kerak. Narxi va qoldig‘ini yuboring: ${SITE_URL}${url}`;

                return (
                  <article
                    key={product.catalogId || product.sku}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative">
                      <Link
                        href={url}
                        className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
                      >
                        <Image
                          src={product.image}
                          alt={productName}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-3"
                        />
                      </Link>
                      <B2BWishlistButton
                        product={product}
                        locale={activeLang}
                        className="absolute right-3 top-3 z-10"
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                          {product.sku}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            product.availabilityStatus === 'IN_STOCK'
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {product.availabilityStatus === 'IN_STOCK'
                            ? activeLang === 'ru'
                              ? 'В наличии'
                              : 'Omborda mavjud'
                            : activeLang === 'ru'
                              ? 'Уточнить наличие'
                              : 'Qoldiqni aniqlang'}
                        </span>
                      </div>
                      <Link href={url}>
                        <h2 className="min-h-12 text-base font-semibold leading-6 hover:text-red-700">
                          {productName}
                        </h2>
                      </Link>
                      <dl className="mt-3 space-y-1 text-sm text-slate-600">
                        <div className="flex justify-between">
                          <dt>{t.pack}</dt>
                          <dd className="font-medium text-slate-900">
                            {product.itemsPerPackage || 1}{' '}
                            {activeLang === 'ru' ? 'шт.' : 'dona'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>{t.carton}</dt>
                          <dd className="font-medium text-slate-900">
                            {product.unitsPerCarton || product.itemsPerPackage || 1}{' '}
                            {activeLang === 'ru' ? 'шт.' : 'dona'}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="text-xs text-slate-500">{t.price}</p>
                        <p className="text-lg font-bold text-slate-950">
                          {product.priceMode === 'REQUEST_ONLY'
                            ? t.request
                            : product.formattedPrice}
                        </p>
                      </div>
                      <div className="mt-4 grid gap-2">
                        <B2BAddToCartButton
                          product={product}
                          locale={activeLang}
                          className="h-11 text-sm"
                        />
                        <a
                          href={`https://t.me/${process.env.TELEGRAM_USERNAME || 'akramjon0011'}?text=${encodeURIComponent(telegramText)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-red-600 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          <Send size={16} />
                          {t.telegram}
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <p className="text-lg font-semibold text-slate-700">{t.empty}</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {activeLang === 'ru'
                  ? 'Не нашли нужный товар? Отправьте название или фото в Telegram — мы найдём и предложим цену.'
                  : 'Kerakli mahsulotni topmadingizmi? Nomini yoki rasmini Telegram orqali yuboring — topib, narxini taklif qilamiz.'}
              </p>
              <a
                href={`https://t.me/${process.env.TELEGRAM_USERNAME || 'akramjon0011'}?text=${encodeURIComponent(activeLang === 'ru' ? `Здравствуйте. Ищу товары из категории: ${name}.` : `Assalomu alaykum. ${name} kategoriyasidan mahsulotlar kerak.`)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700"
              >
                <Send size={16} />
                {activeLang === 'ru' ? 'Связаться через Telegram' : 'Telegram orqali bog‘lanish'}
              </a>
            </div>
          )}

          {result.pageCount > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
              {result.page > 1 && (
                <Link
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"
                  href={pageHref(result.page - 1)}
                >
                  {t.previous}
                </Link>
              )}
              <span className="text-sm text-slate-600">
                {result.page} / {result.pageCount}
              </span>
              {result.page < result.pageCount && (
                <Link
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"
                  href={pageHref(result.page + 1)}
                >
                  {t.next}
                </Link>
              )}
            </nav>
          )}
        </div>
      </main>
    </>
  );
}
