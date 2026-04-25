import { Category, Product } from '../types';
import { getLocalizedText } from './i18nUtils';
import { slugify } from './slugify';

type CategoryValue = Product['category'] | Category['name'];

export const getCategorySlug = (category: Category): string => {
  return category.slug || slugify(getLocalizedText(category.name, 'uz'));
};

export const findCategoryByValue = (value: CategoryValue, categories: Category[]): Category | undefined => {
  const rawValue = getLocalizedText(value, 'uz');

  return categories.find((category) => {
    const categorySlug = getCategorySlug(category);
    const names = [
      getLocalizedText(category.name, 'uz'),
      getLocalizedText(category.name, 'ru'),
      getLocalizedText(category.name, 'en'),
    ];

    return rawValue === categorySlug || names.includes(rawValue);
  });
};

export const getProductCategoryKey = (value: CategoryValue, categories: Category[]): string => {
  const category = findCategoryByValue(value, categories);
  return category ? getCategorySlug(category) : getLocalizedText(value, 'uz');
};

export const getCategoryDisplayName = (
  value: CategoryValue,
  categories: Category[],
  lang: string,
): string => {
  const category = findCategoryByValue(value, categories);
  return category ? getLocalizedText(category.name, lang) : getLocalizedText(value, lang);
};
