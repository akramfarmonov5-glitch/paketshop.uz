import Link from 'next/link';
import { Check, Coffee, CookingPot, CakeSlice, Send, Store } from 'lucide-react';
import { localizedPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) { const { lang } = await params; return localizedPageMetadata({ lang, path: '/starter-kits', title: { uz: 'Yangi biznes uchun start to‘plamlar | PaketShop.uz', ru: 'Стартовые наборы для бизнеса | PaketShop.uz' }, description: { uz: 'Kofe, fast-food, qandolatchilik va savdo nuqtasi uchun tayyor qadoqlash to‘plamlari.', ru: 'Готовые комплекты упаковки для кофейни, fast-food, кондитера и торговой точки.' } }); }

export default async function StarterKitsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; const locale = lang === 'ru' ? 'ru' : 'uz'; const ru = locale === 'ru';
  const kits = ru ? [
    { title: 'Для кофейни', icon: Coffee, items: ['Стаканы 250/350 мл', 'Крышки', 'Размешиватели', 'Салфетки', 'Крафт-пакеты'] },
    { title: 'Для fast-food', icon: CookingPot, items: ['Контейнеры', 'Соусники', 'Пакеты', 'Приборы', 'Салфетки'] },
    { title: 'Для кондитера', icon: CakeSlice, items: ['Коробки для тортов', 'Подложки', 'Пергамент', 'Пакеты', 'Ленты'] },
    { title: 'Для торговой точки', icon: Store, items: ['Пакеты разных размеров', 'Стрейч-плёнка', 'Скотч', 'Ценники', 'Хозтовары'] },
  ] : [
    { title: 'Kofe nuqtasi uchun', icon: Coffee, items: ['250/350 ml stakanlar', 'Qopqoqlar', 'Aralashtirgich', 'Salfetka', 'Kraft paket'] },
    { title: 'Fast-food uchun', icon: CookingPot, items: ['Konteynerlar', 'Sous idishlari', 'Paketlar', 'Qoshiq-vilka', 'Salfetka'] },
    { title: 'Qandolatchi uchun', icon: CakeSlice, items: ['Tort qutilari', 'Tagliklar', 'Pergament', 'Paketlar', 'Lentalar'] },
    { title: 'Savdo nuqtasi uchun', icon: Store, items: ['Turli paketlar', 'Streych plyonka', 'Skotch', 'Narxnomalar', 'Xo‘jalik mahsulotlari'] },
  ];
  return <main className="min-h-screen bg-slate-50 pb-24 pt-28 text-slate-950"><section className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[.18em] text-red-700">PaketShop Start</p><h1 className="mt-4 text-4xl font-black sm:text-5xl">{ru ? 'Готовые наборы для нового бизнеса' : 'Yangi biznes uchun tayyor to‘plamlar'}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{ru ? 'Выберите направление — менеджер уточнит объём, наличие и рассчитает актуальную оптовую стоимость.' : 'Yo‘nalishni tanlang — menejer hajm, qoldiq va amaldagi ulgurji narxni hisoblab beradi.'}</p></div></section><section className="mx-auto grid max-w-6xl gap-5 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">{kits.map((kit) => <article key={kit.title} className="rounded-2xl border border-slate-200 bg-white p-6"><kit.icon size={32} className="text-red-600" /><h2 className="mt-5 text-2xl font-bold">{kit.title}</h2><ul className="mt-5 space-y-3">{kit.items.map((item) => <li key={item} className="flex items-center gap-3 text-slate-700"><Check size={17} className="text-emerald-600" />{item}</li>)}</ul><a href={`https://t.me/paketshopuz?text=${encodeURIComponent(`${kit.title}: ${ru ? 'рассчитайте набор' : 'to‘plamni hisoblab bering'}`)}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white"><Send size={17} />{ru ? 'Рассчитать в Telegram' : 'Telegramda hisoblatish'}</a></article>)}</section><div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"><Link href={`/${locale}/catalog`} className="font-bold text-red-700">← {ru ? 'Перейти в каталог' : 'Katalogga o‘tish'}</Link></div></main>;
}
