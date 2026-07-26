import { DEFAULT_HERO_CONTENT, DEFAULT_NAVIGATION } from '@/constants';
import { getLocalizedText, parseLocalizedObject } from '@/lib/i18nUtils';
import type {
  HeroContent,
  LocalizedString,
  MenuItem,
  NavigationSettings,
  SocialLink,
} from '@/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeLocalized(
  value: unknown,
  fallback: string | LocalizedString,
): LocalizedString {
  const normalized = parseLocalizedObject(value);
  const fallbackValue = parseLocalizedObject(fallback);
  return {
    uz: normalized.uz.trim() || fallbackValue.uz,
    ru: normalized.ru.trim() || fallbackValue.ru,
  };
}

function validInternalOrHttpsUrl(value: string) {
  return value.startsWith('/') || value.startsWith('#') || /^https:\/\//i.test(value);
}

function normalizeHref(value: unknown): string | LocalizedString | null {
  if (typeof value === 'string') {
    const href = value.trim();
    return validInternalOrHttpsUrl(href) ? href : null;
  }
  if (!isRecord(value)) return null;
  const uz = typeof value.uz === 'string' ? value.uz.trim() : '';
  const ru = typeof value.ru === 'string' ? value.ru.trim() : '';
  if (!validInternalOrHttpsUrl(uz) || !validInternalOrHttpsUrl(ru)) return null;
  return { uz, ru };
}

export function normalizeHeroContent(value: unknown): HeroContent {
  const source = isRecord(value) ? value : {};
  const images = Array.isArray(source.images)
    ? source.images
      .filter((image): image is string => typeof image === 'string')
      .map((image) => image.trim())
      .filter((image) => image.startsWith('/') || /^https:\/\//i.test(image))
      .slice(0, 5)
    : DEFAULT_HERO_CONTENT.images;

  return {
    badge: normalizeLocalized(source.badge, DEFAULT_HERO_CONTENT.badge),
    title: normalizeLocalized(source.title, DEFAULT_HERO_CONTENT.title),
    description: normalizeLocalized(source.description, DEFAULT_HERO_CONTENT.description),
    buttonText: normalizeLocalized(source.buttonText, DEFAULT_HERO_CONTENT.buttonText),
    images,
  };
}

export function normalizeNavigationSettings(value: unknown): NavigationSettings {
  const source = isRecord(value) ? value : {};
  const rawMenuItems = Array.isArray(source.menuItems) ? source.menuItems : [];
  const rawSocialLinks = Array.isArray(source.socialLinks) ? source.socialLinks : [];

  const menuItems = rawMenuItems.flatMap<MenuItem>((item, index) => {
    if (!isRecord(item)) return [];
    const labelSource = item.label ?? item.title;
    const href = normalizeHref(item.href ?? item.path);
    const label = normalizeLocalized(labelSource, '');
    if (!href || (!label.uz && !label.ru)) return [];
    return [{
      id: typeof item.id === 'string' || typeof item.id === 'number' ? item.id : index + 1,
      label,
      href,
    }];
  });

  const allowedPlatforms = new Set<SocialLink['platform']>([
    'instagram',
    'telegram',
    'facebook',
    'youtube',
    'twitter',
  ]);
  const socialLinks = rawSocialLinks.flatMap<SocialLink>((item, index) => {
    if (!isRecord(item) || typeof item.url !== 'string' || typeof item.platform !== 'string') {
      return [];
    }
    const platform = item.platform.toLowerCase() as SocialLink['platform'];
    const url = item.url.trim();
    if (!allowedPlatforms.has(platform) || !/^https:\/\//i.test(url)) return [];
    return [{
      id: typeof item.id === 'string' || typeof item.id === 'number' ? item.id : index + 1,
      platform,
      url,
    }];
  });

  return {
    menuItems: Array.isArray(source.menuItems) ? menuItems : DEFAULT_NAVIGATION.menuItems,
    socialLinks: Array.isArray(source.socialLinks) ? socialLinks : DEFAULT_NAVIGATION.socialLinks,
  };
}

export function resolveNavigationHref(
  href: string | LocalizedString,
  lang: 'uz' | 'ru',
): string {
  const localizedHref = getLocalizedText(href, lang).trim();
  if (!localizedHref) return `/${lang}`;
  if (/^https:\/\//i.test(localizedHref) || localizedHref.startsWith('#')) {
    return localizedHref;
  }
  const withoutLanguage = localizedHref.replace(/^\/(uz|ru)(?=\/|$)/, '');
  if (!withoutLanguage || withoutLanguage === '/') return `/${lang}`;
  return `/${lang}${withoutLanguage.startsWith('/') ? withoutLanguage : `/${withoutLanguage}`}`;
}
