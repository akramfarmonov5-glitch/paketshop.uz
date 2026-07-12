import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Phone, Send } from 'lucide-react';
import {
  buildProductTelegramMessage,
  formatUzsPrice,
  saleUnitLabel,
} from '@/lib/domain/catalogMapping';
import { catalogCardUrlSlug, type PrismaProductDetail } from '@/lib/server/prismaCatalog';
import B2BAddToCartButton from '@/components/B2BAddToCartButton';
import type { Product } from '@/types';

const copy = {
  uz: {
    home: 'Bosh sahifa',
    catalog: 'Katalog',
    sku: 'Mahsulot kodi',
    packInfo: 'Qadoq ma’lumoti',
    perPack: 'Qadoqda',
    perCarton: 'Korobkada',
    packsInCarton: 'Korobkada qadoq',
    piece: 'dona',
    minOrder: 'Eng kam buyurtma',
    orderStep: 'Buyurtma qadami',
    packPrice: 'narxi',
    approxPiece: 'Taxminiy 1 dona narxi',
    request: 'Narxni aniqlang',
    from: 'dan boshlab',
    tiers: 'Ulgurji narx darajalari',
    tierQty: 'Miqdor',
    tierPrice: 'Narx',
    telegram: 'Telegram orqali buyurtma',
    phone: 'Telefon qilish',
    manager: 'Yakuniy narx va qoldiqni menejer tasdiqlaydi.',
    description: 'Tavsif',
    related: 'O‘xshash mahsulotlar',
    availability: {
      IN_STOCK: 'Omborda mavjud',
      LOW_STOCK: 'Kam qoldi',
      CHECK_AVAILABILITY: 'Qoldiqni aniqlang',
      ON_ORDER: 'Buyurtma asosida',
      OUT_OF_STOCK: 'Vaqtincha yo‘q',
      DISCONTINUED: 'Sotuvdan chiqarilgan',
    } as Record<string, string>,
  },
  ru: {
    home: 'Главная',
    catalog: 'Каталог',
    sku: 'Код товара',
    packInfo: 'Информация об упаковке',
    perPack: 'В упаковке',
    perCarton: 'В коробке',
    packsInCarton: 'Упаковок в коробке',
    piece: 'шт.',
    minOrder: 'Минимальный заказ',
    orderStep: 'Шаг заказа',
    packPrice: 'цена',
    approxPiece: 'Примерная цена за 1 шт.',
    request: 'Уточнить цену',
    from: 'от',
    tiers: 'Оптовые уровни цен',
    tierQty: 'Количество',
    tierPrice: 'Цена',
    telegram: 'Заказать в Telegram',
    phone: 'Позвонить',
    manager: 'Итоговую цену и наличие подтверждает менеджер.',
    description: 'Описание',
    related: 'Похожие товары',
    availability: {
      IN_STOCK: 'В наличии',
      LOW_STOCK: 'Мало на складе',
      CHECK_AVAILABILITY: 'Уточнить наличие',
      ON_ORDER: 'Под заказ',
      OUT_OF_STOCK: 'Временно нет',
      DISCONTINUED: 'Снят с продажи',
    } as Record<string, string>,
  },
};

function availabilityTone(status: string): string {
  if (status === 'IN_STOCK') return 'bg-emerald-50 text-emerald-700';
  if (status === 'LOW_STOCK') return 'bg-amber-50 text-amber-700';
  if (status === 'OUT_OF_STOCK' || status === 'DISCONTINUED') return 'bg-red-50 text-red-700';
  return 'bg-slate-100 text-slate-700';
}

export default function B2BProductView({ detail }: { detail: PrismaProductDetail }) {
  const { card, locale } = detail;
  const t = copy[locale];
  const unit = saleUnitLabel(card.saleUnit, locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paketshop.uz';
  const telegramUser = process.env.TELEGRAM_USERNAME || 'paketshopuz';
  const phone = '+998996448444';
  const pageUrl = `${siteUrl}/${locale}/product/${catalogCardUrlSlug(card, locale)}`;
  const telegramText = buildProductTelegramMessage({
    locale,
    sku: card.sku,
    name: detail.name,
    quantity: card.minimumOrderQuantity,
    saleUnit: card.saleUnit,
    url: pageUrl,
  });

  const showExactPrice = (card.priceMode === 'PUBLIC_EXACT' || card.priceMode === 'FROM_PRICE') && detail.packPrice > 0;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-28 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
          <Link href={`/${locale}`} className="hover:text-red-700">{t.home}</Link>
          <ChevronRight size={14} />
          <Link href={`/${locale}/catalog`} className="hover:text-red-700">{t.catalog}</Link>
          <ChevronRight size={14} />
          <Link href={`/${locale}/catalog?category=${encodeURIComponent(detail.categorySlug)}`} className="hover:text-red-700">{detail.categoryName}</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800">{detail.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
              <Image src={detail.images[0] || card.image} alt={detail.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-4" priority />
            </div>
            {detail.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {detail.images.slice(1, 5).map((image) => (
                  <div key={image} className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                    <Image src={image} alt={detail.name} fill sizes="120px" className="object-contain p-1" />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-sm font-semibold text-slate-700">{card.sku}</span>
              <span className={`rounded-md px-2.5 py-1 text-sm font-semibold ${availabilityTone(card.availabilityStatus)}`}>{t.availability[card.availabilityStatus] || t.availability.CHECK_AVAILABILITY}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{detail.name}</h1>
            {detail.shortDescription && <p className="mt-3 text-base leading-7 text-slate-600">{detail.shortDescription}</p>}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              {showExactPrice ? (
                <>
                  <p className="text-2xl font-bold text-slate-950">
                    1 {unit}: {formatUzsPrice(detail.packPrice, locale)}
                    {card.priceMode === 'FROM_PRICE' && <span className="ml-1 text-base font-semibold text-slate-500">{t.from}</span>}
                  </p>
                  {detail.piecePrice != null && (
                    <p className="mt-1 text-sm text-slate-600">{t.approxPiece}: <strong className="text-slate-900">{formatUzsPrice(detail.piecePrice, locale)}</strong></p>
                  )}
                </>
              ) : (
                <p className="text-2xl font-bold text-red-700">{t.request}</p>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-sm">
                <dt className="text-slate-500">{t.perPack}</dt>
                <dd className="text-right font-semibold text-slate-900">{card.itemsPerPackage} {t.piece}</dd>
                {card.packsPerCarton > 1 && (
                  <>
                    <dt className="text-slate-500">{t.packsInCarton}</dt>
                    <dd className="text-right font-semibold text-slate-900">{card.packsPerCarton}</dd>
                  </>
                )}
                <dt className="text-slate-500">{t.perCarton}</dt>
                <dd className="text-right font-semibold text-slate-900">{card.unitsPerCarton} {t.piece}</dd>
                <dt className="text-slate-500">{t.minOrder}</dt>
                <dd className="text-right font-semibold text-slate-900">{card.minimumOrderQuantity} {unit}</dd>
                {card.orderStep > 1 && (
                  <>
                    <dt className="text-slate-500">{t.orderStep}</dt>
                    <dd className="text-right font-semibold text-slate-900">{card.orderStep} {unit}</dd>
                  </>
                )}
              </dl>

              {detail.priceTiers.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h2 className="mb-2 text-sm font-bold text-slate-900">{t.tiers}</h2>
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-slate-500"><th className="pb-1 font-medium">{t.tierQty}</th><th className="pb-1 text-right font-medium">{t.tierPrice}</th></tr></thead>
                    <tbody>
                      {detail.priceTiers.map((tier) => (
                        <tr key={`${tier.minQuantity}-${tier.maxQuantity}`} className="border-t border-slate-100">
                          <td className="py-1.5 text-slate-700">{tier.minQuantity}{tier.maxQuantity ? `–${tier.maxQuantity}` : '+'} {saleUnitLabel(tier.priceUnit, locale)}</td>
                          <td className="py-1.5 text-right font-semibold text-slate-900">{formatUzsPrice(tier.price, locale)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="mt-4 text-xs text-slate-500">{t.manager}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <B2BAddToCartButton product={card as unknown as Product} locale={locale} className="h-12 text-sm" />
                <a href={`https://t.me/${telegramUser}?text=${encodeURIComponent(telegramText)}`} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700">
                  <Send size={17} />{t.telegram}
                </a>
                <a href={`tel:${phone}`} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-red-500 hover:text-red-700">
                  <Phone size={17} />{t.phone}
                </a>
              </div>
            </div>
          </section>
        </div>

        {detail.description && (
          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold">{t.description}</h2>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{detail.description}</p>
          </section>
        )}

        {detail.related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold">{t.related}</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {detail.related.map((relatedCard) => {
                const relatedName = locale === 'ru' ? relatedCard.name.ru : relatedCard.name.uz;
                return (
                  <Link key={relatedCard.sku} href={`/${locale}/product/${catalogCardUrlSlug(relatedCard, locale)}`} className="rounded-2xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="relative mb-2 aspect-square overflow-hidden rounded-xl bg-slate-100">
                      <Image src={relatedCard.image} alt={relatedName} fill sizes="200px" className="object-contain p-2" />
                    </div>
                    <p className="font-mono text-xs font-semibold text-slate-500">{relatedCard.sku}</p>
                    <h3 className="mt-1 text-sm font-semibold leading-5 text-slate-900">{relatedName}</h3>
                    {relatedCard.formattedPrice && <p className="mt-1 text-sm font-bold text-slate-950">{relatedCard.formattedPrice}</p>}
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
