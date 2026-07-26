import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/about',
    title: {
      uz: 'PaketShop.uz haqida | Ulgurji qadoqlash yetkazib beruvchisi',
      ru: 'О компании PaketShop.uz | Оптовый поставщик упаковки',
    },
    description: {
      uz: 'PaketShop.uz — Toshkentdagi qadoqlash materiallari, paketlar va bir martalik idishlar ulgurji yetkazib beruvchisi.',
      ru: 'PaketShop.uz — оптовый поставщик упаковочных материалов, пакетов и одноразовой посуды в Ташкенте.',
    },
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { lang } = await params;
  const ru = lang === 'ru';
  return (
    <div className="min-h-screen bg-white pb-12 pt-24 text-slate-800">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-4xl font-bold text-red-600">
          {ru ? 'О компании' : 'Biz haqimizda'}
        </h1>
        <p className="text-lg leading-relaxed text-slate-700">
          {ru
            ? 'PaketShop.uz — оптовый поставщик упаковочных материалов и одноразовой посуды в Ташкенте.'
            : 'PaketShop.uz — Toshkent shahridagi qadoqlash materiallari va bir martalik idishlarning ulgurji yetkazib beruvchisi.'}
        </p>
      </div>
    </div>
  );
}
