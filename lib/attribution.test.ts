import { describe, expect, it } from 'vitest';
import { buildTouch, deriveSource, hasCampaignSignal } from '@/lib/attribution';

function params(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe('deriveSource', () => {
  it('detects OLX from ref parameter', () => {
    expect(deriveSource(params('ref=olx&olx_ad_id=12345'), '')).toBe('olx');
  });

  it('detects OLX from referrer', () => {
    expect(deriveSource(params(''), 'https://www.olx.uz/d/obyavlenie/stakan')).toBe('olx');
  });

  it('detects Telegram from referrer', () => {
    expect(deriveSource(params(''), 'https://t.me/paketshopuz')).toBe('telegram');
  });

  it('detects Instagram from utm_source', () => {
    expect(deriveSource(params('utm_source=instagram&utm_medium=social'), '')).toBe('instagram');
  });

  it('detects Google Ads from gclid', () => {
    expect(deriveSource(params('gclid=abc123'), 'https://www.google.com/')).toBe('google_ads');
  });

  it('detects Google Ads from cpc medium', () => {
    expect(deriveSource(params('utm_source=google&utm_medium=cpc'), '')).toBe('google_ads');
  });

  it('detects Google organic from referrer', () => {
    expect(deriveSource(params(''), 'https://www.google.com/search?q=stakan')).toBe('google_organic');
  });

  it('falls back to raw utm_source', () => {
    expect(deriveSource(params('utm_source=newsletter'), '')).toBe('newsletter');
  });

  it('marks unknown external referrers as referral', () => {
    expect(deriveSource(params(''), 'https://example.com/page')).toBe('referral');
  });

  it('defaults to direct', () => {
    expect(deriveSource(params(''), '')).toBe('direct');
  });
});

describe('buildTouch', () => {
  it('captures UTM parameters, landing page and timestamp', () => {
    const touch = buildTouch({
      url: 'https://paketshop.uz/uz/catalog?utm_source=olx&utm_campaign=winter&olx_ad_id=987',
      referrer: 'https://www.olx.uz/d/obyavlenie/stakan',
      now: 1_700_000_000_000,
    });

    expect(touch).toMatchObject({
      source: 'olx',
      utm_source: 'olx',
      utm_campaign: 'winter',
      olx_ad_id: '987',
      landing_page: '/uz/catalog?utm_source=olx&utm_campaign=winter&olx_ad_id=987',
      referrer: 'https://www.olx.uz/d/obyavlenie/stakan',
      at: 1_700_000_000_000,
    });
  });

  it('ignores internal referrers', () => {
    const touch = buildTouch({
      url: 'https://paketshop.uz/uz/product/stakan',
      referrer: 'https://paketshop.uz/uz/catalog',
    });

    expect(touch?.referrer).toBeUndefined();
    expect(touch?.source).toBe('direct');
  });

  it('returns null for invalid URLs', () => {
    expect(buildTouch({ url: 'not-a-url' })).toBeNull();
  });
});

describe('hasCampaignSignal', () => {
  it('is true when any campaign parameter is present', () => {
    const touch = buildTouch({ url: 'https://paketshop.uz/uz?utm_medium=social', now: 1 });
    expect(touch && hasCampaignSignal(touch)).toBe(true);
  });

  it('is true for external referrers', () => {
    const touch = buildTouch({ url: 'https://paketshop.uz/uz', referrer: 'https://example.com', now: 1 });
    expect(touch && hasCampaignSignal(touch)).toBe(true);
  });

  it('is false for plain direct visits', () => {
    const touch = buildTouch({ url: 'https://paketshop.uz/uz', now: 1 });
    expect(touch && hasCampaignSignal(touch)).toBe(false);
  });
});
