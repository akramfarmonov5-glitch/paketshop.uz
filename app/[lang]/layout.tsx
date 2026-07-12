import '../globals.css';
import { Providers } from './Providers';
import ClientLayout from './ClientLayout';

const siteUrl = 'https://paketshop.uz';
const logoUrl = `${siteUrl}/logo.png`;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang || 'uz';
  const metadataMap: Record<string, any> = {
    uz: {
      title: 'PaketShop.uz | Qadoqlash va bir martalik idishlar ulgurji',
      description: 'O‘zbekiston bizneslari uchun qadoqlash, bir martalik idishlar va xo‘jalik sarf materiallari ulgurji katalogi.',
    },
    ru: {
      title: 'PaketShop.uz | Упаковка и одноразовая посуда оптом',
      description: 'Оптовый каталог упаковки, одноразовой посуды и хозяйственных расходных материалов для бизнеса Узбекистана.',
    },
  };
  const metadata = metadataMap[l] || metadataMap['uz'];

  return {
    metadataBase: new URL(siteUrl),
    ...metadata,
    applicationName: 'PaketShop.uz',
    alternates: {
      canonical: `/${l}`,
      languages: {
        uz: '/uz',
        ru: '/ru',
        'x-default': '/uz',
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png?v=20260430', type: 'image/png', sizes: '16x16' },
        { url: '/favicon-32x32.png?v=20260430', type: 'image/png', sizes: '32x32' },
        { url: '/favicon-48x48.png?v=20260430', type: 'image/png', sizes: '48x48' },
        { url: '/favicon.png?v=20260430', type: 'image/png', sizes: '32x32' },
      ],
      apple: [
        { url: '/apple-touch-icon.png?v=20260430', sizes: '180x180', type: 'image/png' },
      ],
      shortcut: ['/favicon.ico'],
    },
    manifest: '/manifest.webmanifest',
    openGraph: {
      type: 'website',
      url: `${siteUrl}/${l}`,
      siteName: 'PaketShop.uz',
      title: metadata.title,
      description: metadata.description,
      images: [
        {
          url: logoUrl,
          width: 320,
          height: 320,
          alt: 'PaketShop.uz logo',
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: metadata.title,
      description: metadata.description,
      images: [logoUrl],
    },
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PaketShop.uz',
    url: siteUrl,
    logo: logoUrl,
  };

  return (
    <html lang={lang || 'uz'} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#DC2626" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=20260430" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=20260430" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=20260430" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20260430" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
