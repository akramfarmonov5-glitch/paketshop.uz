import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/terms',
    title: {
      uz: 'Foydalanish shartlari | PaketShop.uz',
      ru: 'Условия использования | PaketShop.uz',
    },
    description: {
      uz: 'PaketShop.uz katalogi, buyurtma so‘rovi va savdo xizmatlaridan foydalanish shartlari.',
      ru: 'Условия использования каталога, заявок на заказ и услуг продаж PaketShop.uz.',
    },
  });
}

export default async function TermsPage({ params }: PageProps) {
  const { lang } = await params;
  const ru = lang === 'ru';
  return (
    <div className="min-h-screen bg-white pb-12 pt-24 text-slate-800">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-4xl font-bold text-red-600">
          {ru ? 'Условия использования' : 'Foydalanish shartlari'}
        </h1>
        <p className="text-slate-700">
          {ru
            ? 'Цена, наличие и условия доставки подтверждаются менеджером после получения заявки.'
            : 'Narx, qoldiq va yetkazib berish shartlari so‘rov olingach menejer tomonidan tasdiqlanadi.'}
        </p>
      </div>
    </div>
  );
}
