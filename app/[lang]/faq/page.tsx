import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/faq',
    title: {
      uz: 'Ko‘p so‘raladigan savollar | PaketShop.uz',
      ru: 'Частые вопросы | PaketShop.uz',
    },
    description: {
      uz: 'Minimal buyurtma, ulgurji narx, to‘lov va yetkazib berish bo‘yicha tez-tez beriladigan savollar.',
      ru: 'Ответы на вопросы о минимальном заказе, оптовых ценах, оплате и доставке.',
    },
  });
}

export default async function FAQPage({ params }: PageProps) {
  const { lang } = await params;
  const ru = lang === 'ru';
  return (
    <div className="min-h-screen bg-white pb-12 pt-24 text-slate-800">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-4xl font-bold text-red-600">
          {ru ? 'Частые вопросы' : 'Ko‘p so‘raladigan savollar'}
        </h1>
        <details className="rounded-xl border bg-slate-50 p-4">
          <summary className="cursor-pointer font-bold">
            {ru ? 'Какой минимальный заказ?' : 'Minimal buyurtma qancha?'}
          </summary>
          <p className="mt-2 text-slate-600">
            {ru
              ? 'Минимальное количество указано отдельно для каждого товара. Итоговый объём подтверждает менеджер.'
              : 'Minimal miqdor har bir mahsulot uchun alohida ko‘rsatiladi. Yakuniy hajmni menejer tasdiqlaydi.'}
          </p>
        </details>
      </div>
    </div>
  );
}
