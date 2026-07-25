import Link from 'next/link';
import { CakeSlice, Check, Coffee, CookingPot, Send, Store } from 'lucide-react';
import LeadRequestForm from '@/components/LeadRequestForm';
import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/starter-kits',
    title: {
      uz: 'Yangi biznes uchun start to‘plamlar | PaketShop.uz',
      ru: 'Стартовые наборы для бизнеса | PaketShop.uz',
    },
    description: {
      uz: 'Kofe nuqtasi, fast-food, qandolatchilik va savdo nuqtasi uchun tayyor qadoqlash to‘plamlari.',
      ru: 'Готовые комплекты упаковки для кофейни, fast-food, кондитера и торговой точки.',
    },
  });
}

const KITS = {
  uz: [
    { title: 'Kofe nuqtasi uchun', icon: Coffee, items: ['250/350 ml stakanlar', 'Qopqoqlar', 'Aralashtirgich', 'Salfetka', 'Kraft paket'] },
    { title: 'Fast-food uchun', icon: CookingPot, items: ['Konteynerlar', 'Sous idishlari', 'Paketlar', 'Qoshiq-vilka', 'Salfetka'] },
    { title: 'Qandolatchi uchun', icon: CakeSlice, items: ['Tort qutilari', 'Tagliklar', 'Pergament', 'Paketlar', 'Lentalar'] },
    { title: 'Savdo nuqtasi uchun', icon: Store, items: ['Turli paketlar', 'Streych plyonka', 'Skotch', 'Narxnomalar', 'Xo‘jalik mahsulotlari'] },
  ],
  ru: [
    { title: 'Для кофейни', icon: Coffee, items: ['Стаканы 250/350 мл', 'Крышки', 'Размешиватели', 'Салфетки', 'Крафт-пакеты'] },
    { title: 'Для fast-food', icon: CookingPot, items: ['Контейнеры', 'Соусники', 'Пакеты', 'Приборы', 'Салфетки'] },
    { title: 'Для кондитера', icon: CakeSlice, items: ['Коробки для тортов', 'Подложки', 'Пергамент', 'Пакеты', 'Ленты'] },
    { title: 'Для торговой точки', icon: Store, items: ['Пакеты разных размеров', 'Стрейч-плёнка', 'Скотч', 'Ценники', 'Хозтовары'] },
  ],
};

export default async function StarterKitsPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = lang === 'ru' ? 'ru' : 'uz';
  const ru = locale === 'ru';
  const telegramUser = process.env.TELEGRAM_USERNAME || 'akramjon0011';
  const kitMessage = (kit: string) => ru
    ? `Здравствуйте. Нужен стартовый набор «${kit}» с сайта PaketShop.uz. Рассчитайте состав и цену.`
    : `Assalomu alaykum. PaketShop.uz saytidagi «${kit}» start to‘plami kerak. Tarkibi va narxini hisoblab yuboring.`;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-28 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-red-700">PaketShop Start</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            {ru ? 'Готовые наборы для нового бизнеса' : 'Yangi biznes uchun tayyor to‘plamlar'}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {ru
              ? 'Выберите направление — менеджер уточнит объём, наличие и рассчитает актуальную оптовую стоимость.'
              : 'Yo‘nalishni tanlang — menejer hajm, qoldiq va amaldagi ulgurji narxni hisoblab beradi.'}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          {ru
            ? 'Состав и цена набора ориентировочные — итоговый расчёт менеджер подтверждает по наличию и объёму.'
            : 'To‘plam tarkibi va narxi taxminiy — yakuniy hisobni menejer qoldiq va hajmga qarab tasdiqlaydi.'}
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          {KITS[locale].map((kit) => (
            <article key={kit.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
              <kit.icon size={32} className="text-red-600" />
              <h2 className="mt-5 text-2xl font-bold">{kit.title}</h2>
              <ul className="mt-5 flex-1 space-y-3">
                {kit.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-700">
                    <Check size={17} className="shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={`https://t.me/${telegramUser}?text=${encodeURIComponent(kitMessage(kit.title))}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 font-bold text-white hover:bg-red-700"
              >
                <Send size={17} />
                {ru ? 'Рассчитать в Telegram' : 'Telegramda hisoblatish'}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <div>
          <h2 className="text-2xl font-bold">{ru ? 'Не нашли свой формат?' : 'O‘z formatingizni topmadingizmi?'}</h2>
          <p className="mt-4 leading-7 text-slate-600">
            {ru
              ? 'Опишите бизнес и примерный объём — соберём набор под вас и пришлём расчёт.'
              : 'Biznesingiz va taxminiy hajmni yozing — sizga mos to‘plam yig‘ib, hisobini yuboramiz.'}
          </p>
          <Link href={`/${locale}/catalog`} className="mt-6 inline-block font-bold text-red-700">
            ← {ru ? 'Перейти в каталог' : 'Katalogga o‘tish'}
          </Link>
        </div>

        <LeadRequestForm
          type="product_request"
          locale={locale}
          fields={['city', 'telegram', 'products', 'monthlyVolume', 'note']}
          title={ru ? 'Запросить расчёт набора' : 'To‘plam hisobini so‘rash'}
          submitLabel={ru ? 'Отправить заявку' : 'So‘rov yuborish'}
        />
      </section>
    </main>
  );
}
