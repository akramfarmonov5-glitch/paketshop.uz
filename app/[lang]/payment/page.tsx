import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/payment',
    title: {
      uz: 'To‘lov usullari | PaketShop.uz',
      ru: 'Способы оплаты | PaketShop.uz',
    },
    description: {
      uz: 'Naqd pul, karta o‘tkazmasi va tashkilotlar uchun bank hisob raqami orqali to‘lov.',
      ru: 'Оплата наличными, переводом на карту или на расчётный счёт для организаций.',
    },
  });
}

export default async function PaymentPage({ params }: PageProps) {
  const { lang } = await params;
  const ru = lang === 'ru';
  const methods = ru
    ? ['Наличные', 'Перевод на карту', 'Расчётный счёт для организаций']
    : ['Naqd pul', 'Karta o‘tkazmasi', 'Tashkilotlar uchun bank hisob raqami'];

  return (
    <div className="min-h-screen bg-white pb-12 pt-24 text-slate-800">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-4xl font-bold text-red-600">
          {ru ? 'Способы оплаты' : 'To‘lov usullari'}
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {methods.map((method) => <div key={method} className="rounded-2xl border p-6">{method}</div>)}
        </div>
      </div>
    </div>
  );
}
