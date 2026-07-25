import B2BBusinessLanding from '@/components/B2BBusinessLanding';
import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/organizations',
    title: {
      uz: 'Tashkilotlar uchun qadoqlash ta’minoti | PaketShop.uz',
      ru: 'Упаковка для организаций | PaketShop.uz',
    },
    description: {
      uz: 'Shartnoma, hisob-faktura, bank orqali to‘lov va doimiy qadoqlash ta’minoti.',
      ru: 'Договор, счёт-фактура, безналичная оплата и регулярные поставки упаковки.',
    },
  });
}

export default async function OrganizationsPage({ params }: PageProps) {
  const { lang } = await params;
  const ru = lang === 'ru';

  return (
    <B2BBusinessLanding
      locale={ru ? 'ru' : 'uz'}
      type="organization"
      eyebrow={ru ? 'Для организаций' : 'Tashkilotlar uchun'}
      title={ru
        ? 'Поставка упаковки для организаций и сетей'
        : 'Tashkilot va savdo tarmoqlari uchun qadoqlash ta’minoti'}
      description={ru
        ? 'Договор, счёт-фактура, безналичная оплата и регулярные поставки по согласованному графику.'
        : 'Shartnoma, hisob-faktura, bank orqali to‘lov va kelishilgan jadval bo‘yicha doimiy ta’minot.'}
      benefits={ru
        ? [
            'Договор и счёт-фактура на каждую поставку',
            'Безналичная оплата на расчётный счёт',
            'Регулярные поставки по согласованному графику',
            'Резерв крупного заказа на складе',
            'Индивидуальный менеджер для вашей организации',
          ]
        : [
            'Har bir yetkazib berish uchun shartnoma va hisob-faktura',
            'Bank hisob raqamiga o‘tkazma orqali to‘lov',
            'Kelishilgan jadval bo‘yicha doimiy ta’minot',
            'Katta buyurtmani omborda rezerv qilish',
            'Tashkilotingizga individual menejer',
          ]}
    />
  );
}
