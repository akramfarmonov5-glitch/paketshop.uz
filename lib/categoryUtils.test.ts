import { describe, expect, it } from 'vitest';
import type { Category } from '../types';
import { getProductCategoryKey } from './categoryUtils';

const categories: Category[] = [
  {
    id: 1,
    name: { uz: 'Bir martalik idishlar', ru: 'Одноразовая посуда' },
    slug: { uz: 'bir-martalik-idishlar', ru: 'odnorazovaya-posuda' },
    image: '/logo.png',
  },
];

describe('getProductCategoryKey', () => {
  it('returns the category slug for the active language', () => {
    expect(
      getProductCategoryKey('bir-martalik-idishlar', categories, 'uz'),
    ).toBe('bir-martalik-idishlar');

    expect(
      getProductCategoryKey('bir-martalik-idishlar', categories, 'ru'),
    ).toBe('odnorazovaya-posuda');
  });
});
