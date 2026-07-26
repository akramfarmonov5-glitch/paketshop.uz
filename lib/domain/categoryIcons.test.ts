import { describe, expect, it } from 'vitest';
import { categoryIconName, categoryTone } from '@/lib/domain/categoryIcons';

describe('categoryIconName', () => {
  it('maps the seeded uzbek category slugs to distinct icons', () => {
    const mapping = {
      'stakanlar-va-qopqoqlar': 'cup',
      'bir-martalik-idishlar': 'utensils',
      'ovqat-konteynerlari': 'container',
      'sous-idishlari': 'sauce',
      'kraft-paketlar': 'kraftBag',
      'polietilen-paketlar': 'plasticBag',
      'zip-paketlar': 'zipBag',
      'chiqindi-paketlari': 'trashBag',
      'streych-plyonkalar': 'stretch',
      'oziq-ovqat-plyonkasi': 'foodFilm',
      'folga-va-pergament': 'foil',
      'qandolatchilik-qadoqlari': 'pastry',
      'bir-martalik-qoshiq-vilka': 'cutlery',
      'salfetka-va-qogoz': 'napkin',
      'xojalik-sarf-materiallari': 'household',
      'bayram-mahsulotlari': 'party',
      'yangi-yil-paketlari': 'newYear',
    } as const;

    for (const [slug, expected] of Object.entries(mapping)) {
      expect(categoryIconName(slug), slug).toBe(expected);
    }
  });

  it('gives most seeded categories a different icon (not one repeated icon)', () => {
    const slugs = [
      'stakanlar-va-qopqoqlar', 'bir-martalik-idishlar', 'ovqat-konteynerlari', 'sous-idishlari',
      'kraft-paketlar', 'polietilen-paketlar', 'zip-paketlar', 'chiqindi-paketlari',
    ];
    const icons = new Set(slugs.map(categoryIconName));
    expect(icons.size).toBe(slugs.length);
  });

  it('also matches russian slugs', () => {
    expect(categoryIconName('стаканы-и-крышки')).toBe('cup');
    expect(categoryIconName('крафт-пакеты')).toBe('kraftBag');
  });

  it('falls back to a neutral box icon', () => {
    expect(categoryIconName('nomalum-kategoriya')).toBe('box');
    expect(categoryIconName('')).toBe('box');
    expect(categoryIconName(null)).toBe('box');
    expect(categoryIconName(undefined)).toBe('box');
  });

  it('prefers the more specific rule when a slug could match two', () => {
    // "bir-martalik-qoshiq-vilka" ham "bir-martalik-idish" ham mos kelishi mumkin
    expect(categoryIconName('bir-martalik-qoshiq-vilka')).toBe('cutlery');
  });
});

describe('categoryTone', () => {
  it('is stable for the same slug', () => {
    expect(categoryTone('kraft-paketlar')).toBe(categoryTone('kraft-paketlar'));
  });

  it('returns a tailwind class pair', () => {
    expect(categoryTone('zip-paketlar')).toMatch(/^bg-\w+-50 text-\w+-600$/);
  });

  it('spreads colours across the seeded categories', () => {
    const tones = new Set(['stakanlar-va-qopqoqlar', 'kraft-paketlar', 'zip-paketlar', 'sous-idishlari'].map(categoryTone));
    expect(tones.size).toBeGreaterThan(1);
  });

  it('handles empty input without throwing', () => {
    expect(() => categoryTone('')).not.toThrow();
  });
});
