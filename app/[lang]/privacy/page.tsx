import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/privacy',
    title: {
      uz: 'Maxfiylik siyosati | PaketShop.uz',
      ru: 'Политика конфиденциальности | PaketShop.uz',
    },
    description: {
      uz: 'PaketShop.uz saytida mijoz ma’lumotlarini yig‘ish, saqlash va himoya qilish qoidalari.',
      ru: 'Правила сбора, хранения и защиты данных клиентов на сайте PaketShop.uz.',
    },
  });
}

export default async function PrivacyPage({ params }: PageProps) {
  const { lang } = await params;
  const ru = lang === 'ru';
  return (
    <div className="min-h-screen bg-white pb-12 pt-24 text-slate-800">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-4xl font-bold text-red-600">
          {ru ? 'Политика конфиденциальности' : 'Maxfiylik siyosati'}
        </h1>
        <p className="text-slate-700">
          {ru
            ? 'Мы используем контактные данные только для обработки заказа и связи с клиентом.'
            : 'Kontakt ma’lumotlaridan faqat buyurtmani ko‘rib chiqish va mijoz bilan bog‘lanish uchun foydalanamiz.'}
        </p>
      </div>
    </div>
  );
}
