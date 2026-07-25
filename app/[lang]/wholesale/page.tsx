import B2BBusinessLanding from '@/components/B2BBusinessLanding';
import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/wholesale',
    title: {
      uz: 'Ulgurji xaridorlar uchun | PaketShop.uz',
      ru: 'Оптовым покупателям | PaketShop.uz',
    },
    description: {
      uz: 'Do‘konlar va qayta sotuvchilar uchun hajmga bog‘liq ulgurji narxlar, katta qadoqlar va muntazam prays.',
      ru: 'Оптовые цены по объёму, крупные упаковки и регулярный прайс для магазинов и реселлеров.',
    },
  });
}

export default async function WholesalePage({ params }: PageProps) {
  const { lang } = await params;
  const ru = lang === 'ru';

  return (
    <B2BBusinessLanding
      locale={ru ? 'ru' : 'uz'}
      type="reseller"
      eyebrow={ru ? 'Для реселлеров' : 'Qayta sotuvchilar uchun'}
      title={ru
        ? 'Оптовые условия для магазинов и региональных продавцов'
        : 'Do‘konlar va hududiy sotuvchilar uchun ulgurji shartlar'}
      description={ru
        ? 'Получайте крупные упаковки, регулярный прайс и предложения по новым товарам. Менеджер подтвердит остаток и итоговую цену.'
        : 'Katta qadoq, muntazam prays va yangi mahsulotlar bo‘yicha takliflarni oling. Qoldiq va yakuniy narxni menejer tasdiqlaydi.'}
      benefits={ru
        ? [
            'Оптовые цены по объёму: 10, 50 и 100+ упаковок',
            'Крупные упаковки и коробки, удобные для перепродажи',
            'Регулярное обновление прайса для постоянных партнёров',
            'Уведомления о поступлении и остатках нужных товаров',
            'Персональная связь с менеджером',
          ]
        : [
            'Hajm bo‘yicha ulgurji narx: 10, 50 va 100+ qadoq',
            'Qayta sotishga qulay katta qadoq va korobkalar',
            'Doimiy hamkorlarga muntazam prays yangilanishi',
            'Kerakli mahsulot kelgani va qoldiq haqida xabar',
            'Shaxsiy menejer bilan aloqa',
          ]}
    />
  );
}
