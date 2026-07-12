// Qidiruv so'rovlarini normallashtirish va uz-lotin <-> kirill transliteratsiyasi (spec §13).

const CYRILLIC_TO_LATIN: Array<[string, string]> = [
  ['щ', 'sh'], ['ё', 'yo'], ['ю', 'yu'], ['я', 'ya'], ['ч', 'ch'], ['ш', 'sh'], ['ц', 'ts'],
  ['а', 'a'], ['б', 'b'], ['в', 'v'], ['г', 'g'], ['д', 'd'], ['е', 'e'], ['ж', 'j'], ['з', 'z'],
  ['и', 'i'], ['й', 'y'], ['к', 'k'], ['л', 'l'], ['м', 'm'], ['н', 'n'], ['о', 'o'], ['п', 'p'],
  ['р', 'r'], ['с', 's'], ['т', 't'], ['у', 'u'], ['ф', 'f'], ['х', 'x'], ['ъ', ''], ['ь', ''],
  ['э', 'e'], ['ы', 'i'], ['ҳ', 'h'], ['қ', 'q'], ['ғ', 'g'], ['ў', 'o'],
];

const LATIN_TO_CYRILLIC: Array<[string, string]> = [
  ['shch', 'щ'], ['yo', 'ё'], ['yu', 'ю'], ['ya', 'я'], ['ch', 'ч'], ['sh', 'ш'], ['ts', 'ц'], ['kh', 'х'],
  ['a', 'а'], ['b', 'б'], ['v', 'в'], ['g', 'г'], ['d', 'д'], ['e', 'е'], ['j', 'ж'], ['z', 'з'],
  ['i', 'и'], ['y', 'й'], ['k', 'к'], ['l', 'л'], ['m', 'м'], ['n', 'н'], ['o', 'о'], ['p', 'п'],
  ['r', 'р'], ['s', 'с'], ['t', 'т'], ['u', 'у'], ['f', 'ф'], ['x', 'х'], ['h', 'х'], ['q', 'к'],
  ['w', 'в'], ['c', 'к'],
];

function transliterate(text: string, table: Array<[string, string]>): string {
  let result = '';
  let index = 0;
  const lower = text;
  while (index < lower.length) {
    const pair = table.find(([from]) => lower.startsWith(from, index));
    if (pair) {
      result += pair[1];
      index += pair[0].length;
    } else {
      result += lower[index];
      index += 1;
    }
  }
  return result;
}

export function normalizeSearchQuery(raw: unknown): string {
  return String(raw ?? '')
    .toLocaleLowerCase('ru')
    .replace(/['`’‘"«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

export function cyrillicToLatin(text: string): string {
  return transliterate(text, CYRILLIC_TO_LATIN);
}

export function latinToCyrillic(text: string): string {
  return transliterate(text, LATIN_TO_CYRILLIC);
}

/** So'rovning original, lotin va kirill variantlarini qaytaradi (dublikatlarsiz). */
export function searchQueryVariants(raw: unknown): string[] {
  const normalized = normalizeSearchQuery(raw);
  if (!normalized) return [];

  const variants = new Set<string>([normalized]);
  if (/[а-яёҳқғў]/.test(normalized)) variants.add(cyrillicToLatin(normalized));
  if (/[a-z]/.test(normalized)) variants.add(latinToCyrillic(normalized));

  return [...variants].filter(Boolean);
}
