'use client';

import { Phone, Send } from 'lucide-react';
import { useState } from 'react';
import B2BAddToCartButton from '@/components/B2BAddToCartButton';
import B2BWishlistButton from '@/components/B2BWishlistButton';
import {
  buildProductTelegramMessage,
  formatUzsPrice,
  saleUnitLabel,
} from '@/lib/domain/catalogMapping';
import type { PrismaProductDetail } from '@/lib/server/prismaCatalog';
import type { Product } from '@/types';

const copy = {
  uz: {
    variant: 'Variantni tanlang',
    perPack: 'Qadoqda',
    perCarton: 'Korobkada',
    packsInCarton: 'Korobkada qadoq',
    piece: 'dona',
    minOrder: 'Eng kam buyurtma',
    orderStep: 'Buyurtma qadami',
    approxPiece: 'Taxminiy 1 dona narxi',
    request: 'Narxni aniqlang',
    from: 'dan boshlab',
    tiers: 'Ulgurji narx darajalari',
    tierQty: 'Miqdor',
    tierPrice: 'Narx',
    telegram: 'Telegram orqali buyurtma',
    phone: 'Telefon qilish',
    manager: 'Yakuniy narx va qoldiqni menejer tasdiqlaydi.',
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
    variant: 'Выберите вариант',
    perPack: 'В упаковке',
    perCarton: 'В коробке',
    packsInCarton: 'Упаковок в коробке',
    piece: 'шт.',
    minOrder: 'Минимальный заказ',
    orderStep: 'Шаг заказа',
    approxPiece: 'Примерная цена за 1 шт.',
    request: 'Уточнить цену',
    from: 'от',
    tiers: 'Оптовые уровни цен',
    tierQty: 'Количество',
    tierPrice: 'Цена',
    telegram: 'Заказать в Telegram',
    phone: 'Позвонить',
    manager: 'Итоговую цену и наличие подтверждает менеджер.',
    availability: {
      IN_STOCK: 'В наличии',
      LOW_STOCK: 'Мало на складе',
      CHECK_AVAILABILITY: 'Уточнить наличие',
      ON_ORDER: 'Под заказ',
      OUT_OF_STOCK: 'Временно нет',
      DISCONTINUED: 'Снят с продажи',
    } as Record<string, string>,
  },
} as const;

function availabilityTone(status: string): string {
  if (status === 'IN_STOCK') return 'bg-emerald-50 text-emerald-700';
  if (status === 'LOW_STOCK') return 'bg-amber-50 text-amber-700';
  if (status === 'OUT_OF_STOCK' || status === 'DISCONTINUED') {
    return 'bg-red-50 text-red-700';
  }
  return 'bg-slate-100 text-slate-700';
}

function variantLabel(
  variant: PrismaProductDetail['variants'][number],
  locale: 'uz' | 'ru',
): string {
  const values = [
    variant.color,
    variant.size,
    variant.volumeMl ? `${variant.volumeMl} ml` : null,
    variant.thicknessMicron
      ? `${variant.thicknessMicron} ${locale === 'ru' ? 'мкм' : 'mkm'}`
      : null,
    variant.unitsPerPack
      ? `${variant.unitsPerPack} ${locale === 'ru' ? 'шт.' : 'dona'}`
      : null,
  ].filter(Boolean);
  return values.length ? values.join(' · ') : variant.sku;
}

export default function B2BProductPurchasePanel({
  detail,
  pageUrl,
  telegramUser,
  phone,
}: {
  detail: PrismaProductDetail;
  pageUrl: string;
  telegramUser: string;
  phone: string;
}) {
  const { card, locale } = detail;
  const t = copy[locale];
  const preferredVariant =
    detail.variants.find((variant) => ['IN_STOCK', 'LOW_STOCK'].includes(variant.availabilityStatus))
    || detail.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(preferredVariant?.id || '');
  const selectedVariant =
    detail.variants.find((variant) => variant.id === selectedVariantId)
    || preferredVariant;
  const selectedPrice = selectedVariant?.price ?? detail.packPrice;
  const selectedUnitsPerPack = selectedVariant?.unitsPerPack ?? card.itemsPerPackage;
  const selectedAvailability = selectedVariant?.availabilityStatus || card.availabilityStatus;
  const selectedSku = selectedVariant?.sku || card.sku;
  const piecePrice =
    selectedPrice > 0 && selectedUnitsPerPack > 1
      ? Math.round(selectedPrice / selectedUnitsPerPack)
      : null;
  const showExactPrice =
    ['PUBLIC_EXACT', 'FROM_PRICE'].includes(card.priceMode)
    && selectedPrice > 0;
  const unit = saleUnitLabel(card.saleUnit, locale);
  const product = {
    ...card,
    variantId: selectedVariant?.id,
    sku: selectedSku,
    price: selectedPrice,
    formattedPrice: showExactPrice ? formatUzsPrice(selectedPrice, locale) : '',
    availabilityStatus: selectedAvailability,
    itemsPerPackage: selectedUnitsPerPack,
    unitsPerCarton: selectedUnitsPerPack * card.packsPerCarton,
  } as unknown as Product;
  const telegramText = buildProductTelegramMessage({
    locale,
    sku: selectedSku,
    name: detail.name,
    quantity: card.minimumOrderQuantity,
    saleUnit: card.saleUnit,
    url: pageUrl,
  });

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      {detail.variants.length > 0 && (
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-bold text-slate-900">{t.variant}</legend>
          <div className="flex flex-wrap gap-2">
            {detail.variants.map((variant) => {
              const checked = variant.id === selectedVariant?.id;
              const unavailable = ['OUT_OF_STOCK', 'DISCONTINUED'].includes(
                variant.availabilityStatus,
              );
              return (
                <button
                  type="button"
                  key={variant.id}
                  aria-pressed={checked}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    checked
                      ? 'border-red-600 bg-red-50 text-red-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-red-300'
                  } ${unavailable ? 'opacity-60' : ''}`}
                >
                  <span className="block font-semibold">{variantLabel(variant, locale)}</span>
                  <span className="mt-0.5 block font-mono text-[11px] opacity-70">
                    {variant.sku}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-sm font-semibold text-slate-700">
          {selectedSku}
        </span>
        <span className={`rounded-md px-2.5 py-1 text-sm font-semibold ${availabilityTone(selectedAvailability)}`}>
          {t.availability[selectedAvailability] || t.availability.CHECK_AVAILABILITY}
        </span>
      </div>

      <div className="mt-4">
        {showExactPrice ? (
          <>
            <p className="text-2xl font-bold text-slate-950">
              1 {unit}: {formatUzsPrice(selectedPrice, locale)}
              {card.priceMode === 'FROM_PRICE' && (
                <span className="ml-1 text-base font-semibold text-slate-500">{t.from}</span>
              )}
            </p>
            {piecePrice != null && (
              <p className="mt-1 text-sm text-slate-600">
                {t.approxPiece}:{' '}
                <strong className="text-slate-900">{formatUzsPrice(piecePrice, locale)}</strong>
              </p>
            )}
          </>
        ) : (
          <p className="text-2xl font-bold text-red-700">{t.request}</p>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-sm">
        <dt className="text-slate-500">{t.perPack}</dt>
        <dd className="text-right font-semibold text-slate-900">
          {selectedUnitsPerPack} {t.piece}
        </dd>
        {card.packsPerCarton > 1 && (
          <>
            <dt className="text-slate-500">{t.packsInCarton}</dt>
            <dd className="text-right font-semibold text-slate-900">{card.packsPerCarton}</dd>
          </>
        )}
        <dt className="text-slate-500">{t.perCarton}</dt>
        <dd className="text-right font-semibold text-slate-900">
          {selectedUnitsPerPack * card.packsPerCarton} {t.piece}
        </dd>
        <dt className="text-slate-500">{t.minOrder}</dt>
        <dd className="text-right font-semibold text-slate-900">
          {card.minimumOrderQuantity} {unit}
        </dd>
        {card.orderStep > 1 && (
          <>
            <dt className="text-slate-500">{t.orderStep}</dt>
            <dd className="text-right font-semibold text-slate-900">
              {card.orderStep} {unit}
            </dd>
          </>
        )}
      </dl>

      {detail.priceTiers.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <h2 className="mb-2 text-sm font-bold text-slate-900">{t.tiers}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-1 font-medium">{t.tierQty}</th>
                <th className="pb-1 text-right font-medium">{t.tierPrice}</th>
              </tr>
            </thead>
            <tbody>
              {detail.priceTiers.map((tier) => (
                <tr key={`${tier.minQuantity}-${tier.maxQuantity}`} className="border-t border-slate-100">
                  <td className="py-1.5 text-slate-700">
                    {tier.minQuantity}{tier.maxQuantity ? `–${tier.maxQuantity}` : '+'}{' '}
                    {saleUnitLabel(tier.priceUnit, locale)}
                  </td>
                  <td className="py-1.5 text-right font-semibold text-slate-900">
                    {formatUzsPrice(tier.price, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">{t.manager}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <B2BAddToCartButton product={product} locale={locale} className="h-12 text-sm" />
        <B2BWishlistButton product={product} locale={locale} variant="button" className="h-12 text-sm" />
        <a
          href={`https://t.me/${telegramUser}?text=${encodeURIComponent(telegramText)}`}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
        >
          <Send size={17} />
          {t.telegram}
        </a>
        <a
          href={`tel:${phone}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-red-500 hover:text-red-700"
        >
          <Phone size={17} />
          {t.phone}
        </a>
      </div>
    </div>
  );
}
