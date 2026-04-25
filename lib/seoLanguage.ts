export type SeoLanguage = 'uz' | 'ru' | 'en';

export const SEO_LANGUAGES: SeoLanguage[] = ['uz', 'ru', 'en'];
export const DEFAULT_LANGUAGE: SeoLanguage = 'uz';

export const LOCALE_BY_LANG: Record<SeoLanguage, string> = {
  uz: 'uz_UZ',
  ru: 'ru_RU',
  en: 'en_US',
};

export const isSeoLanguage = (value: string | undefined): value is SeoLanguage => {
  return value === 'uz' || value === 'ru' || value === 'en';
};

export const stripLanguagePrefix = (path: string): string => {
  const cleanPath = path || '/';
  const segments = cleanPath.split('/').filter(Boolean);
  if (isSeoLanguage(segments[0])) {
    const rest = segments.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }
  return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
};

export const getLanguageFromPath = (path: string): SeoLanguage => {
  const firstSegment = path.split('/').filter(Boolean)[0];
  return isSeoLanguage(firstSegment) ? firstSegment : DEFAULT_LANGUAGE;
};

export const withLanguagePrefix = (path: string, lang: SeoLanguage): string => {
  const cleanPath = stripLanguagePrefix(path);
  return cleanPath === '/' ? `/${lang}` : `/${lang}${cleanPath}`;
};

export const localizedUrl = (baseUrl: string, path: string, lang: SeoLanguage): string => {
  return `${baseUrl}${withLanguagePrefix(path, lang)}`;
};
