import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/contact',
    title: {
      uz: 'PaketShop.uz kontaktlari | Savdo bo‘limi',
      ru: 'Контакты PaketShop.uz | Отдел продаж',
    },
    description: {
      uz: 'Ulgurji qadoqlash va bir martalik idishlar bo‘yicha PaketShop.uz savdo bo‘limi bilan bog‘laning.',
      ru: 'Свяжитесь с отделом продаж PaketShop.uz по вопросам оптовой упаковки и одноразовой посуды.',
    },
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { lang } = await params;
  const ru = lang === 'ru';
  return (
    <div className="min-h-screen bg-white pb-12 pt-24 text-slate-800">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-4xl font-bold text-red-600">
          {ru ? 'Контакты' : 'Kontaktlar'}
        </h1>
        <div className="space-y-4 text-lg">
          <p>{ru ? 'Телефон' : 'Telefon'}: +998 99 644 84 44</p>
          <p>Telegram: @paketshop_uz</p>
          <p>{ru ? 'Адрес: город Ташкент' : 'Manzil: Toshkent shahri'}</p>
        </div>
      </div>
    </div>
  );
}
