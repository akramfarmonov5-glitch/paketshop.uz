import { Category, Product } from '../types';
import { getLocalizedText } from './i18nUtils';
import { slugify } from './slugify';

type CategoryValue = Product['category'] | Category['name'];

export const getCategorySlug = (category: Category, lang = 'uz'): string => {
  return getLocalizedText(category.slug, lang) || slugify(getLocalizedText(category.name, lang));
};

export const getCategorySlugs = (category: Category): string[] => {
  return ['uz', 'ru', 'en']
    .map(lang => getCategorySlug(category, lang))
    .filter((slug, index, slugs) => slug && slugs.indexOf(slug) === index);
};

export const findCategoryByValue = (value: CategoryValue, categories: Category[]): Category | undefined => {
  const rawValue = getLocalizedText(value, 'uz');

  return categories.find((category) => {
    const categorySlugs = getCategorySlugs(category);
    const names = [
      getLocalizedText(category.name, 'uz'),
      getLocalizedText(category.name, 'ru'),
      getLocalizedText(category.name, 'en'),
    ];

    return categorySlugs.includes(rawValue) || names.includes(rawValue);
  });
};

export const getProductCategoryKey = (value: CategoryValue, categories: Category[], lang = 'uz'): string => {
  const category = findCategoryByValue(value, categories);
  return category ? getCategorySlug(category, lang) : getLocalizedText(value, lang);
};

export const getCategoryDisplayName = (
  value: CategoryValue,
  categories: Category[],
  lang: string,
): string => {
  const category = findCategoryByValue(value, categories);
  return category ? getLocalizedText(category.name, lang) : getLocalizedText(value, lang);
};
