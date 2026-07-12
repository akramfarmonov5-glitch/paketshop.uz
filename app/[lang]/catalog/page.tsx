import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PackageCheck, Search, Send, SlidersHorizontal } from 'lucide-react';
import { getLocalizedText } from '@/lib/i18nUtils';
import { getCatalog } from '@/lib/server/catalogRepository';
import { slugify } from '@/lib/slugify';
import B2BAddToCartButton from '@/components/B2BAddToCartButton';

const copy = {
  uz: {
    title: 'Ulgurji mahsulotlar katalogi',
    description: 'Qadoqlash, bir martalik idishlar va xo‘jalik sarf materiallarini SKU, qadoq va mavjudlik bo‘yicha toping.',
    search: 'Mahsulot nomi yoki SKU', category: 'Barcha kategoriyalar', available: 'Faqat mavjud', sort: 'Saralash', newest: 'Eng yangi', cheap: 'Narxi arzon', expensive: 'Narxi qimmat', az: 'Nomi A–Z', apply: 'Ko‘rsatish', found: 'ta mahsulot', pack: 'Qadoqda', carton: 'Korobkada', price: '1 qadoq', request: 'Narxni aniqlang', telegram: 'Telegram orqali so‘rash', empty: 'Mahsulot topilmadi', manager: 'Narx va qoldiqni menejer tasdiqlaydi', previous: 'Oldingi', next: 'Keyingi',
  },
  ru: {
    title: 'Каталог оптовых товаров',
    description: 'Найдите упаковку, одноразовую посуду и хозяйственные товары по SKU, упаковке и наличию.',
    search: 'Название товара или SKU', category: 'Все категории', available: 'Только в наличии', sort: 'Сортировка', newest: 'Сначала новые', cheap: 'Сначала дешевле', expensive: 'Сначала дороже', az: 'Название А–Я', apply: 'Показать', found: 'товаров', pack: 'В упаковке', carton: 'В коробке', price: '1 упаковка', request: 'Уточнить цену', telegram: 'Спросить в Telegram', empty: 'Товары не найдены', manager: 'Цену и наличие подтверждает менеджер', previous: 'Назад', next: 'Далее',
  },
};

type PageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang === 'ru' ? 'ru' : 'uz';
  return {
    title: `${copy[locale].title} | PaketShop.uz`,
    description: copy[locale].description,
    alternates: { canonical: `/${locale}/catalog`, languages: { uz: '/uz/catalog', ru: '/ru/catalog' } },
  };
}

function value(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const [{ lang }, query] = await Promise.all([params, searchParams]);
  const locale = lang === 'ru' ? 'ru' : 'uz';
  const t = copy[locale];
  const selected = {
    query: value(query.q), category: value(query.category), availability: value(query.availability), sort: value(query.sort) || 'newest', page: Number(value(query.page) || 1), pageSize: Number(value(query.pageSize) || 24), locale,
  };
  const result = await getCatalog(selected);
  const baseQuery = new URLSearchParams();
  if (selected.query) baseQuery.set('q', selected.query);
  if (selected.category) baseQuery.set('category', selected.category);
  if (selected.availability) baseQuery.set('availability', selected.availability);
  if (selected.sort) baseQuery.set('sort', selected.sort);
  baseQuery.set('pageSize', String(result.pageSize));
  const pageHref = (page: number) => { const next = new URLSearchParams(baseQuery); next.set('page', String(page)); return `/${locale}/catalog?${next}`; };

  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-28 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700"><PackageCheck size={16} /> PaketShop B2B</span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.title}</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">{t.description}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[2fr_1fr_1fr_1fr_auto]" action={`/${locale}/catalog`}>
          <label className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={18} /><input name="q" defaultValue={selected.query} placeholder={t.search} className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
          <select name="category" defaultValue={selected.category} aria-label={t.category} className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"><option value="">{t.category}</option>{result.categories.map((category) => <option key={category.id} value={getLocalizedText(category.slug, 'uz')}>{getLocalizedText(category.name, locale)}</option>)}</select>
          <select name="availability" defaultValue={selected.availability} aria-label={t.available} className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"><option value="">{t.available}</option><option value="available">{t.available}</option></select>
          <select name="sort" defaultValue={selected.sort} aria-label={t.sort} className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"><option value="newest">{t.newest}</option><option value="price_asc">{t.cheap}</option><option value="price_desc">{t.expensive}</option><option value="name_asc">{t.az}</option></select>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700"><SlidersHorizontal size={17} />{t.apply}</button>
        </form>

        <div className="my-6 flex items-center justify-between"><p className="text-sm font-medium text-slate-600"><strong className="text-slate-950">{result.total}</strong> {t.found}</p><p className="hidden text-sm text-slate-500 sm:block">{t.manager}</p></div>

        {result.products.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{result.products.map((product) => {
          const name = getLocalizedText(product.name, locale);
          const slugText = getLocalizedText(product.slug, locale) || getLocalizedText(product.slug, 'uz') || slugify(name);
          const url = `/${locale}/product/${product.id ? `${slugText}-${product.id}` : slugText}`;
          const telegramText = locale === 'ru' ? `Здравствуйте. Нужен товар ${product.sku} — ${name}. Уточните цену и наличие: https://paketshop.uz${url}` : `Assalomu alaykum. ${product.sku} — ${name} mahsuloti kerak. Narxi va qoldig‘ini yuboring: https://paketshop.uz${url}`;
          return <article key={product.catalogId || product.sku} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <Link href={url} className="relative block aspect-[4/3] overflow-hidden bg-slate-100"><Image src={product.image} alt={name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-3" /></Link>
            <div className="p-4"><div className="mb-2 flex items-center justify-between gap-2"><span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">{product.sku}</span><span className={`text-xs font-semibold ${product.availabilityStatus === 'IN_STOCK' ? 'text-emerald-700' : 'text-amber-700'}`}>{product.availabilityStatus === 'IN_STOCK' ? (locale === 'ru' ? 'В наличии' : 'Omborda mavjud') : (locale === 'ru' ? 'Уточнить наличие' : 'Qoldiqni aniqlang')}</span></div>
              <Link href={url}><h2 className="min-h-12 text-base font-semibold leading-6 hover:text-red-700">{name}</h2></Link>
              <dl className="mt-3 space-y-1 text-sm text-slate-600"><div className="flex justify-between"><dt>{t.pack}</dt><dd className="font-medium text-slate-900">{product.itemsPerPackage || 1} {locale === 'ru' ? 'шт.' : 'dona'}</dd></div><div className="flex justify-between"><dt>{t.carton}</dt><dd className="font-medium text-slate-900">{product.unitsPerCarton || product.itemsPerPackage || 1} {locale === 'ru' ? 'шт.' : 'dona'}</dd></div></dl>
              <div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">{t.price}</p><p className="text-lg font-bold text-slate-950">{product.priceMode === 'REQUEST_ONLY' ? t.request : product.formattedPrice}</p></div>
              <div className="mt-4 grid gap-2"><B2BAddToCartButton product={product} locale={locale} className="h-10 text-sm" /><a href={`https://t.me/${process.env.TELEGRAM_USERNAME || 'paketshopuz'}?text=${encodeURIComponent(telegramText)}`} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-600 text-sm font-semibold text-red-700 hover:bg-red-50"><Send size={16} />{t.telegram}</a></div>
            </div>
          </article>;
        })}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold text-slate-700">{t.empty}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{locale === 'ru' ? 'Не нашли нужный товар? Отправьте название или фото в Telegram — мы найдём и предложим цену.' : 'Kerakli mahsulotni topmadingizmi? Nomini yoki rasmini Telegram orqali yuboring — topib, narxini taklif qilamiz.'}</p>
          <a href={`https://t.me/${process.env.TELEGRAM_USERNAME || 'paketshopuz'}?text=${encodeURIComponent(locale === 'ru' ? `Здравствуйте. Ищу товар: ${selected.query || '...'} — помогите найти.` : `Assalomu alaykum. Shu mahsulotni qidiryapman: ${selected.query || '...'} — topishga yordam bering.`)}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700"><Send size={16} />{locale === 'ru' ? 'Найти через Telegram' : 'Telegram orqali topib beramiz'}</a>
        </div>}

        {result.pageCount > 1 && <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">{result.page > 1 && <Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold" href={pageHref(result.page - 1)}>{t.previous}</Link>}<span className="text-sm text-slate-600">{result.page} / {result.pageCount}</span>{result.page < result.pageCount && <Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold" href={pageHref(result.page + 1)}>{t.next}</Link>}</nav>}
      </div>
    </main>
  );
}
