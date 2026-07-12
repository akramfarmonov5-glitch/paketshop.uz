export interface AttributionTouch {
  source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ref?: string;
  olx_ad_id?: string;
  product_code?: string;
  gclid?: string;
  landing_page?: string;
  referrer?: string;
  at?: number;
}

export interface StoredAttribution {
  first?: AttributionTouch;
  last?: AttributionTouch;
}

const FIRST_TOUCH_KEY = 'ps_attribution_first';
const LAST_TOUCH_KEY = 'ps_attribution_last';
const PARAM_MAX_LENGTH = 200;
const URL_MAX_LENGTH = 500;

const CAMPAIGN_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'ref',
  'olx_ad_id',
  'product_code',
  'gclid',
] as const;

function cleanParam(value: string | null, maxLength = PARAM_MAX_LENGTH): string | undefined {
  const trimmed = value?.trim().slice(0, maxLength);
  return trimmed || undefined;
}

function referrerHost(referrer: string): string {
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return '';
  }
}

export function deriveSource(params: URLSearchParams, referrer: string): string {
  const host = referrerHost(referrer);
  const ref = params.get('ref')?.trim().toLowerCase() || '';
  const utmSource = params.get('utm_source')?.trim().toLowerCase() || '';
  const utmMedium = params.get('utm_medium')?.trim().toLowerCase() || '';

  if (ref === 'olx' || utmSource.includes('olx') || params.get('olx_ad_id') || host.includes('olx.')) return 'olx';
  if (utmSource.includes('telegram') || host === 't.me' || host.endsWith('telegram.org') || host.endsWith('telegram.me')) return 'telegram';
  if (utmSource.includes('instagram') || host.endsWith('instagram.com')) return 'instagram';
  if (params.get('gclid') || (utmSource.includes('google') && ['cpc', 'ppc', 'paid'].includes(utmMedium))) return 'google_ads';
  if (utmSource) return utmSource.slice(0, 100);
  if (ref) return ref.slice(0, 100);
  if (host.includes('google.')) return 'google_organic';
  if (host) return 'referral';
  return 'direct';
}

export function buildTouch(input: { url: string; referrer?: string; now?: number }): AttributionTouch | null {
  let parsed: URL;
  try {
    parsed = new URL(input.url);
  } catch {
    return null;
  }

  const params = parsed.searchParams;
  const referrer = input.referrer?.trim() || '';
  const host = referrerHost(referrer);
  const isExternalReferrer = Boolean(host) && host !== parsed.hostname.toLowerCase();

  const touch: AttributionTouch = {
    source: deriveSource(params, isExternalReferrer ? referrer : ''),
    utm_source: cleanParam(params.get('utm_source')),
    utm_medium: cleanParam(params.get('utm_medium')),
    utm_campaign: cleanParam(params.get('utm_campaign')),
    utm_content: cleanParam(params.get('utm_content')),
    utm_term: cleanParam(params.get('utm_term')),
    ref: cleanParam(params.get('ref'), 100),
    olx_ad_id: cleanParam(params.get('olx_ad_id'), 100),
    product_code: cleanParam(params.get('product_code'), 100),
    gclid: cleanParam(params.get('gclid')),
    landing_page: (parsed.pathname + parsed.search).slice(0, URL_MAX_LENGTH),
    referrer: isExternalReferrer ? referrer.slice(0, URL_MAX_LENGTH) : undefined,
    at: input.now ?? Date.now(),
  };

  return touch;
}

export function hasCampaignSignal(touch: AttributionTouch): boolean {
  if (touch.referrer) return true;
  return CAMPAIGN_PARAMS.some((key) => Boolean(touch[key]));
}

function readTouch(key: string): AttributionTouch | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.source !== 'string') return undefined;
    return parsed as AttributionTouch;
  } catch {
    return undefined;
  }
}

function writeTouch(key: string, touch: AttributionTouch): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(touch));
  } catch {
    // Storage unavailable (private mode, quota) — attribution stays best-effort.
  }
}

export function recordAttributionTouch(): void {
  if (typeof window === 'undefined') return;
  const touch = buildTouch({ url: window.location.href, referrer: document.referrer });
  if (!touch) return;

  if (!readTouch(FIRST_TOUCH_KEY)) writeTouch(FIRST_TOUCH_KEY, touch);
  if (hasCampaignSignal(touch) || !readTouch(LAST_TOUCH_KEY)) writeTouch(LAST_TOUCH_KEY, touch);
}

export function getStoredAttribution(): StoredAttribution {
  if (typeof window === 'undefined') return {};
  return { first: readTouch(FIRST_TOUCH_KEY), last: readTouch(LAST_TOUCH_KEY) };
}

export function getSubmissionAttribution(): Record<string, unknown> {
  const { first, last } = getStoredAttribution();
  const current = typeof window !== 'undefined'
    ? buildTouch({ url: window.location.href, referrer: document.referrer })
    : null;
  const effectiveLast = current && hasCampaignSignal(current) ? current : last || current;

  return {
    source: effectiveLast?.source || first?.source || 'direct',
    utm_source: effectiveLast?.utm_source,
    utm_medium: effectiveLast?.utm_medium,
    utm_campaign: effectiveLast?.utm_campaign,
    utm_content: effectiveLast?.utm_content,
    utm_term: effectiveLast?.utm_term,
    ref: effectiveLast?.ref,
    olx_ad_id: effectiveLast?.olx_ad_id,
    ...(first ? { first } : {}),
    ...(effectiveLast ? { last: effectiveLast } : {}),
  };
}
