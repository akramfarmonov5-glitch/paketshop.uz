import { describe, expect, it } from 'vitest';
import {
  normalizeHeroContent,
  normalizeNavigationSettings,
  resolveNavigationHref,
} from './siteSettings';

describe('site settings', () => {
  it('normalizes localized hero JSON strings', () => {
    const hero = normalizeHeroContent({
      badge: JSON.stringify({ uz: 'Ulgurji', ru: 'Оптом' }),
      title: { uz: 'Sarlavha', ru: 'Заголовок' },
      description: { uz: 'Tavsif', ru: 'Описание' },
      buttonText: { uz: 'Ko‘rish', ru: 'Открыть' },
      images: ['https://example.com/hero.jpg', 'javascript:alert(1)'],
    });

    expect(hero.badge).toEqual({ uz: 'Ulgurji', ru: 'Оптом' });
    expect(hero.images).toEqual(['https://example.com/hero.jpg']);
  });

  it('falls back when legacy navigation data is incomplete', () => {
    const navigation = normalizeNavigationSettings({
      menuItems: [{ title: 'Home', path: '/' }],
      socialLinks: [{ platform: 'Facebook', url: 'https://facebook.com' }],
    });

    expect(navigation.menuItems[0]).toMatchObject({ label: { uz: 'Home', ru: 'Home' }, href: '/' });
    expect(navigation.socialLinks[0]).toMatchObject({ platform: 'facebook' });
  });

  it('resolves localized internal navigation links', () => {
    const href = {
      uz: '/category/stakanlar-va-qopqoqlar',
      ru: '/category/stakany-i-kryshki',
    };

    expect(resolveNavigationHref(href, 'uz')).toBe('/uz/category/stakanlar-va-qopqoqlar');
    expect(resolveNavigationHref(href, 'ru')).toBe('/ru/category/stakany-i-kryshki');
    expect(resolveNavigationHref('/uz/catalog', 'ru')).toBe('/ru/catalog');
  });
});
