import { describe, expect, it } from 'vitest';
import { getBlogIdFromSlug, getIdFromSlug, productSlug, slugify } from './slugify';

describe('localized slugs', () => {
  it('creates an Uzbek-friendly slug', () => {
    expect(slugify("Kraft qog'oz paket 32 × 22")).toBe('kraft-qogoz-paket-32-22');
  });

  it('keeps product URLs unique with the product ID', () => {
    expect(productSlug({ id: 42, name: { uz: 'Sous idishi', ru: 'Соусник', en: '' } }, 'uz')).toBe('sous-idishi-42');
  });

  it('extracts IDs only from supported legacy slugs', () => {
    expect(getIdFromSlug('kraft-paket-42')).toBe(42);
    expect(getIdFromSlug('kraft-paket')).toBeNull();
    expect(getBlogIdFromSlug('qadoqlash-maslahatlari-7')).toBe(7);
  });
});
