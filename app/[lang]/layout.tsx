import '../globals.css';
import { Providers } from './Providers';
import ClientLayout from './ClientLayout';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang || 'uz';
  const metadataMap: Record<string, any> = {
    uz: {
      title: 'PaketShop.uz | Qadoqlash va xo\'jalik mahsulotlari',
      description: 'PaketShop.uz - O\'zbekistondagi qadoqlash, oshxona va xo\'jalik mahsulotlari onlayn do\'koni. Paketlar, konteynerlar, bir martalik idishlar va tozalash anjomlarini buyurtma qiling.',
    },
    ru: {
      title: 'PaketShop.uz | Упаковочные и хозяйственные товары',
      description: 'PaketShop.uz - Онлайн магазин упаковочных, кухонных и хозяйственных товаров в Узбекистане. Закажите пакеты, контейнеры, одноразовую посуду и инвентарь для уборки.',
    },
    en: {
      title: 'PaketShop.uz | Packaging & Household Goods',
      description: 'PaketShop.uz - Online store for packaging, kitchen, and household goods in Uzbekistan. Order bags, containers, disposable tableware, and cleaning supplies.',
    }
  };
  return metadataMap[l] || metadataMap['uz'];
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang || 'uz'} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#DC2626" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      </head>
      <body>
        <Providers>
          <ClientLayout lang={lang}>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
