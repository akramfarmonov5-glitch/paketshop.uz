import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/delivery',
    title: {
      uz: 'Yetkazib berish shartlari | PaketShop.uz',
      ru: 'Условия доставки | PaketShop.uz',
    },
    description: {
      uz: 'Toshkent bo‘ylab kuryer, do‘kondan olib ketish va O‘zbekiston viloyatlariga kargo orqali yetkazib berish.',
      ru: 'Курьерская доставка по Ташкенту, самовывоз и отправка карго в регионы Узбекистана.',
    },
  });
}

export default async function DeliveryPage({ params }: PageProps) {
  const { lang } = await params;
  const ru = lang === 'ru';
  const items = ru
    ? ['Самовывоз из магазина', 'Курьер по Ташкенту', 'Отправка карго в регионы']
    : ['Do‘kondan olib ketish', 'Toshkent bo‘ylab kuryer', 'Viloyatlarga kargo orqali'];

  return (
    <div className="min-h-screen bg-white pb-12 pt-24 text-slate-800">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-4xl font-bold text-red-600">
          {ru ? 'Условия доставки' : 'Yetkazib berish shartlari'}
        </h1>
        <ul className="list-inside list-disc space-y-4 text-lg text-slate-700">
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p className="mt-6 text-sm text-slate-500">
          {ru ? '* Стоимость доставки подтверждает менеджер.' : '* Yetkazib berish narxini menejer tasdiqlaydi.'}
        </p>
      </div>
    </div>
  );
}
