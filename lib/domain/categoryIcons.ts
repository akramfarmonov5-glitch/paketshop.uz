/**
 * Kategoriya uchun ikonka nomi.
 *
 * Kategoriyada rasm bo'lmasa, hamma kartada bitta logotipni ko'rsatish sayt
 * tugallanmagandek ko'rsatadi. Buning o'rniga har bir kategoriyaga mos ikonka
 * beriladi — bu ataylab qilingan dizayn kabi ko'rinadi (TZ §8).
 */

export type CategoryIconName =
  | 'cup' | 'utensils' | 'container' | 'sauce' | 'kraftBag' | 'plasticBag'
  | 'zipBag' | 'trashBag' | 'stretch' | 'foodFilm' | 'foil' | 'pastry'
  | 'cutlery' | 'napkin' | 'household' | 'party' | 'newYear' | 'box';

/** Slug bo'lagi -> ikonka. Tartib muhim: birinchi mos kelgani ishlatiladi. */
const RULES: Array<[RegExp, CategoryIconName]> = [
  [/stakan|qopqoq|стакан|крышк/i, 'cup'],
  [/bir-martalik-idish|posuda|tovoq/i, 'utensils'],
  [/konteyner|контейнер/i, 'container'],
  [/sous|соус/i, 'sauce'],
  [/kraft|крафт/i, 'kraftBag'],
  [/polietilen|полиэтилен/i, 'plasticBag'],
  [/zip/i, 'zipBag'],
  [/chiqindi|мусор/i, 'trashBag'],
  [/streych|стрейч/i, 'stretch'],
  [/oziq-ovqat-plyonka|пищев/i, 'foodFilm'],
  [/folga|pergament|фольга/i, 'foil'],
  [/qandolat|кондитер/i, 'pastry'],
  [/qoshiq|vilka|прибор/i, 'cutlery'],
  [/salfetka|qogoz|qog-oz|салфетк/i, 'napkin'],
  [/xojalik|xo-jalik|хозяйств/i, 'household'],
  [/yangi-yil|новогодн/i, 'newYear'],
  [/bayram|праздник/i, 'party'],
];

export function categoryIconName(slug: string | undefined | null): CategoryIconName {
  const value = String(slug ?? '');
  for (const [pattern, icon] of RULES) {
    if (pattern.test(value)) return icon;
  }
  return 'box';
}

/** Kartaning fon rangi — ikonkalar bir xil kulrangda cho'kib ketmasligi uchun. */
const TONES = [
  'bg-red-50 text-red-600',
  'bg-amber-50 text-amber-600',
  'bg-emerald-50 text-emerald-600',
  'bg-sky-50 text-sky-600',
  'bg-violet-50 text-violet-600',
  'bg-rose-50 text-rose-600',
];

/** Slug bo'yicha barqaror rang tanlaydi — har yuklashda bir xil bo'ladi. */
export function categoryTone(slug: string | undefined | null): string {
  const value = String(slug ?? '');
  let sum = 0;
  for (let index = 0; index < value.length; index += 1) sum += value.charCodeAt(index);
  return TONES[sum % TONES.length];
}
