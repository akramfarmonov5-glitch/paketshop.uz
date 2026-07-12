import { describe, expect, it } from 'vitest';
import {
  localizeTargetPath,
  normalizeRedirectPath,
  redirectLookupCandidates,
  splitLocale,
} from '@/lib/domain/redirects';

describe('redirect path helpers', () => {
  it('normalizes paths to a canonical form', () => {
    expect(normalizeRedirectPath('/Old-Page/')).toBe('/old-page');
    expect(normalizeRedirectPath('old-page')).toBe('/old-page');
    expect(normalizeRedirectPath('/page?utm_source=olx#top')).toBe('/page');
    expect(normalizeRedirectPath('https://paketshop.uz/uz/product/stakan')).toBe('/uz/product/stakan');
    expect(normalizeRedirectPath('//a//b/')).toBe('/a/b');
    expect(normalizeRedirectPath('')).toBe('');
    expect(normalizeRedirectPath('/')).toBe('/');
  });

  it('splits locale prefixes', () => {
    expect(splitLocale('/uz/product/x')).toEqual({ locale: 'uz', rest: '/product/x' });
    expect(splitLocale('/ru')).toEqual({ locale: 'ru', rest: '/' });
    expect(splitLocale('/product/x')).toEqual({ locale: null, rest: '/product/x' });
    expect(splitLocale('/fr/page')).toEqual({ locale: null, rest: '/fr/page' });
  });

  it('localizes target paths with the request locale', () => {
    expect(localizeTargetPath('/catalog', 'uz')).toBe('/uz/catalog');
    expect(localizeTargetPath('/ru/catalog', 'uz')).toBe('/ru/catalog');
    expect(localizeTargetPath('/catalog', null)).toBe('/catalog');
    expect(localizeTargetPath('/', 'ru')).toBe('/ru');
  });

  it('builds lookup candidates with and without locale prefix', () => {
    expect(redirectLookupCandidates('/uz/eski-sahifa')).toEqual(['/uz/eski-sahifa', '/eski-sahifa']);
    expect(redirectLookupCandidates('/eski-sahifa')).toEqual(['/eski-sahifa']);
    expect(redirectLookupCandidates('')).toEqual([]);
  });
});
