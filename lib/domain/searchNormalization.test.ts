import { describe, expect, it } from 'vitest';
import {
  cyrillicToLatin,
  latinToCyrillic,
  normalizeSearchQuery,
  searchQueryVariants,
} from '@/lib/domain/searchNormalization';

describe('search normalization', () => {
  it('normalizes case, apostrophes and whitespace', () => {
    expect(normalizeSearchQuery("  Qog'oz   STAKAN  ")).toBe('qogoz stakan');
    expect(normalizeSearchQuery('«Стрейч»')).toBe('стрейч');
    expect(normalizeSearchQuery(null)).toBe('');
  });

  it('transliterates cyrillic queries to latin', () => {
    expect(cyrillicToLatin('стакан')).toBe('stakan');
    expect(cyrillicToLatin('стрейч')).toBe('streych');
    expect(cyrillicToLatin('контейнер 750')).toBe('konteyner 750');
    expect(cyrillicToLatin('пақет')).toBe('paqet');
  });

  it('transliterates latin queries to cyrillic', () => {
    expect(latinToCyrillic('stakan')).toBe('стакан');
    expect(latinToCyrillic('zip 10x15')).toBe('зип 10х15');
    expect(latinToCyrillic('sous')).toBe('соус');
  });

  it('builds unique query variants for both scripts', () => {
    expect(searchQueryVariants('стакан 250')).toEqual(['стакан 250', 'stakan 250']);
    expect(searchQueryVariants('stakan')).toEqual(['stakan', 'стакан']);
    expect(searchQueryVariants('')).toEqual([]);
    // Raqamlar ikkala variantda saqlanadi
    expect(searchQueryVariants('750')).toEqual(['750']);
  });
});
