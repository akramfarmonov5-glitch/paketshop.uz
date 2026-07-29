import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import B2BProductPurchasePanel from '@/components/B2BProductPurchasePanel';
import {
  catalogCardUrlSlug,
  type PrismaProductDetail,
} from '@/lib/server/prismaCatalog';
import { SITE_URL } from '@/lib/site';

const copy = {
  uz: {
    home: 'Bosh sahifa',
    catalog: 'Katalog',
    description: 'Tavsif',
    related: 'O‘xshash mahsulotlar',
  },
  ru: {
    home: 'Главная',
    catalog: 'Каталог',
    description: 'Описание',
    related: 'Похожие товары',
  },
} as const;

export default function B2BProductView({ detail }: { detail: PrismaProductDetail }) {
  const { card, locale } = detail;
  const t = copy[locale];
  const telegramUser = process.env.TELEGRAM_USERNAME || 'akramjon0011';
  const phone = '+998996448444';
  const pageUrl = `${SITE_URL}/${locale}/product/${catalogCardUrlSlug(card, locale)}`;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-28 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500"
        >
          <Link href={`/${locale}`} className="hover:text-red-700">{t.home}</Link>
          <ChevronRight size={14} />
          <Link href={`/${locale}/catalog`} className="hover:text-red-700">{t.catalog}</Link>
          <ChevronRight size={14} />
          <Link
            href={`/${locale}/catalog?category=${encodeURIComponent(detail.categorySlug)}`}
            className="hover:text-red-700"
          >
            {detail.categoryName}
          </Link>
          <ChevronRight size={14} />
          <span className="text-slate-800">{detail.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={detail.images[0] || card.image}
                alt={detail.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-4"
                priority
              />
            </div>
            {detail.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {detail.images.slice(1, 5).map((image) => (
                  <div
                    key={image}
                    className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"
                  >
                    <Image
                      src={image}
                      alt={detail.name}
                      fill
                      sizes="120px"
                      className="object-contain p-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{detail.name}</h1>
            {detail.shortDescription && (
              <p className="mt-3 text-base leading-7 text-slate-600">
                {detail.shortDescription}
              </p>
            )}
            <B2BProductPurchasePanel
              detail={detail}
              pageUrl={pageUrl}
              telegramUser={telegramUser}
              phone={phone}
            />
          </section>
        </div>

        {detail.description && (
          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold">{t.description}</h2>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
              {detail.description}
            </p>
          </section>
        )}

        {detail.related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold">{t.related}</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {detail.related.map((relatedCard) => {
                const relatedName =
                  locale === 'ru' ? relatedCard.name.ru : relatedCard.name.uz;
                return (
                  <Link
                    key={relatedCard.sku}
                    href={`/${locale}/product/${catalogCardUrlSlug(relatedCard, locale)}`}
                    className="rounded-2xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative mb-2 aspect-square overflow-hidden rounded-xl bg-slate-100">
                      <Image
                        src={relatedCard.image}
                        alt={relatedName}
                        fill
                        sizes="200px"
                        className="object-contain p-2"
                      />
                    </div>
                    <p className="font-mono text-xs font-semibold text-slate-500">
                      {relatedCard.sku}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold leading-5 text-slate-900">
                      {relatedName}
                    </h3>
                    {relatedCard.formattedPrice && (
                      <p className="mt-1 text-sm font-bold text-slate-950">
                        {relatedCard.formattedPrice}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
