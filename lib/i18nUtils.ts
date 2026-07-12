export interface LocalizedString {
  uz: string;
  ru: string;
}

export const getLocalizedText = (text: string | LocalizedString | any, lang: string): string => {
  if (!text) return '';
  if (typeof text === 'string') {
    try {
      const parsed = JSON.parse(text);
      if (parsed && (parsed.uz !== undefined || parsed.ru !== undefined)) {
        return parsed[lang as keyof LocalizedString] || parsed.uz || '';
      }
    } catch {
      return text;
    }
  }
  if (typeof text === 'object') {
    return text[lang as keyof LocalizedString] || text.uz || '';
  }
  return String(text);
};

export const parseLocalizedObject = (text: string | any): LocalizedString => {
  const defaultLoc: LocalizedString = { uz: '', ru: '' };
  if (!text) return defaultLoc;
  if (typeof text === 'string') {
    try {
      const parsed = JSON.parse(text);
      if (parsed && (parsed.uz !== undefined || parsed.ru !== undefined)) {
        return { ...defaultLoc, ...parsed };
      }
      return { ...defaultLoc, uz: text, ru: text };
    } catch {
      return { ...defaultLoc, uz: text, ru: text };
    }
  }
  return { ...defaultLoc, ...text };
};
