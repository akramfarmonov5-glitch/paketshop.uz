import CategoryContent from './CategoryContent';
import { fetchGlobalData } from '../../../../lib/fetchGlobalData';
import { findCategoryByValue, getCategorySlug } from '../../../../lib/categoryUtils';
import { getLocalizedText } from '../../../../lib/i18nUtils';

export const revalidate = 300;

const SITE_URL = 'https://paketshop.uz';

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
      return { title: 'Kategoriya topilmadi | PaketShop.uz' };
    }

    const name = getLocalizedText(category.name, activeLang);
    const description =
      getLocalizedText(category.description, activeLang) ||
      `${name} - PaketShop.uz da sifatli mahsulotlar`;

    const alternates: Record<string, string> = {};
    for (const altLang of ['uz', 'ru', 'en']) {
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

  return (
    <CategoryContent
      lang={activeLang}
      slug={slug}
      products={products}
      categories={categories}
    />
  );
}
