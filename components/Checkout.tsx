'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, MessageCircle, PackageCheck, Send, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../lib/i18nUtils';
import { getSubmissionAttribution } from '../lib/attribution';
import { saleUnitLabel } from '../lib/domain/catalogMapping';

interface CheckoutProps { onBack: () => void }
type CustomerType = 'entrepreneur' | 'organization' | 'reseller' | 'individual';
type PaymentMethod = 'cash' | 'card_transfer' | 'bank' | 'terminal' | 'other';

const copy = {
  uz: {
    title: 'Ulgurji buyurtma so‘rovi', intro: 'Menejer qoldiq, yakuniy narx va yetkazishni tekshirib, siz bilan bog‘lanadi.', back: 'Katalogga qaytish', customerType: 'Mijoz turi', entrepreneur: 'Biznes / YTT', organization: 'Tashkilot', reseller: 'Qayta sotuvchi', individual: 'Jismoniy shaxs', name: 'Ism yoki mas’ul shaxs *', phone: 'Telefon *', telegram: 'Telegram username', region: 'Shahar yoki viloyat *', address: 'Yetkazish manzili (ixtiyoriy)', note: 'Buyurtma bo‘yicha izoh', payment: 'Qulay to‘lov usuli', cash: 'Naqd', card: 'Karta o‘tkazmasi', bank: 'Bank hisob raqami', terminal: 'Terminal', other: 'Kelishiladi', consent: 'Ma’lumotlarim buyurtmani qayta ishlash va men bilan bog‘lanish uchun ishlatilishiga roziman.', submit: 'So‘rov yuborish', submitting: 'Yuborilmoqda…', summary: 'So‘rov tarkibi', piece: 'dona', estimated: 'Mahsulotlar taxminiy summasi', confirm: 'Yakuniy narx va yetkazish menejer tomonidan tasdiqlanadi.', success: 'So‘rov qabul qilindi', successText: 'Menejer qoldiq va narxni tekshirib, ko‘rsatilgan telefon orqali bog‘lanadi.', orderNumber: 'So‘rov raqami', telegramCta: 'Telegramda yozish', home: 'Bosh sahifaga qaytish', required: 'Majburiy maydonlarni to‘ldiring.', phoneError: 'Telefon raqamini to‘g‘ri kiriting.', consentError: 'Davom etish uchun rozilikni belgilang.', error: 'So‘rov yuborilmadi. Qayta urinib ko‘ring yoki bizga qo‘ng‘iroq qiling.', empty: 'Savat bo‘sh', emptyText: 'Katalogdan kerakli mahsulotlarni tanlang.', sku: 'SKU',
  },
  ru: {
    title: 'Запрос оптового заказа', intro: 'Менеджер проверит остаток, итоговую цену и доставку, затем свяжется с вами.', back: 'Вернуться в каталог', customerType: 'Тип клиента', entrepreneur: 'Бизнес / ИП', organization: 'Организация', reseller: 'Реселлер', individual: 'Физическое лицо', name: 'Имя или ответственное лицо *', phone: 'Телефон *', telegram: 'Telegram username', region: 'Город или область *', address: 'Адрес доставки (необязательно)', note: 'Комментарий к заказу', payment: 'Удобный способ оплаты', cash: 'Наличные', card: 'Перевод на карту', bank: 'Расчётный счёт', terminal: 'Терминал', other: 'По согласованию', consent: 'Согласен на обработку данных для оформления заказа и связи со мной.', submit: 'Отправить запрос', submitting: 'Отправка…', summary: 'Состав запроса', piece: 'шт.', estimated: 'Примерная сумма товаров', confirm: 'Итоговую цену и доставку подтверждает менеджер.', success: 'Запрос принят', successText: 'Менеджер проверит остаток и цену и свяжется по указанному телефону.', orderNumber: 'Номер запроса', telegramCta: 'Написать в Telegram', home: 'Вернуться на главную', required: 'Заполните обязательные поля.', phoneError: 'Введите корректный номер телефона.', consentError: 'Подтвердите согласие, чтобы продолжить.', error: 'Не удалось отправить запрос. Попробуйте ещё раз или позвоните нам.', empty: 'Корзина пуста', emptyText: 'Выберите нужные товары в каталоге.', sku: 'SKU',
  },
} as const;

const inputClass = 'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100';

export default function Checkout({ onBack }: CheckoutProps) {
  const { cart, cartTotal, clearCart } = useCart();
  const { lang } = useLanguage();
  const locale = lang === 'ru' ? 'ru' : 'uz';
  const t = copy[locale];
  const startedAt = useMemo(() => Date.now(), []);
  const [customerType, setCustomerType] = useState<CustomerType>('entrepreneur');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [form, setForm] = useState({ name: '', phone: '', telegram: '', region: 'Toshkent', address: '', note: '', website: '' });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const set = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((previous) => ({ ...previous, [field]: event.target.value }));
  const money = (value: number) => `${new Intl.NumberFormat('uz-UZ').format(value)} UZS`;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (!form.name.trim() || !form.region.trim()) return setError(t.required);
    if (form.phone.replace(/\D/g, '').length < 9) return setError(t.phoneError);
    if (!consent) return setError(t.consentError);
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerType, customerName: form.name.trim(), phone: form.phone.trim(), telegram: form.telegram.trim() || undefined,
          region: form.region.trim(), address: form.address.trim() || undefined, deliveryMethod: 'manager_confirmation', note: form.note.trim() || undefined,
          paymentMethod, locale,
          items: cart.map((item) => ({ productId: item.catalogId || String(item.id), quantity: item.quantity, saleUnit: item.saleUnit || 'PACK' })),
          attribution: getSubmissionAttribution(), website: form.website, startedAt,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || t.error);
      setOrderNumber(result.orderNumber); clearCart();
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : t.error); }
    finally { setLoading(false); }
  };

  if (orderNumber) {
    const telegramText = locale === 'ru' ? `Здравствуйте. Мой запрос ${orderNumber}.` : `Assalomu alaykum. Mening so‘rov raqamim ${orderNumber}.`;
    return <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-32 text-slate-950"><section className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm sm:p-12"><CheckCircle2 className="mx-auto text-emerald-600" size={52} /><h1 className="mt-5 text-3xl font-black">{t.success}</h1><p className="mt-3 leading-7 text-slate-600">{t.successText}</p><div className="mt-6 rounded-xl bg-slate-100 p-4"><span className="block text-sm text-slate-500">{t.orderNumber}</span><strong className="mt-1 block font-mono text-lg">{orderNumber}</strong></div><div className="mt-7 grid gap-3 sm:grid-cols-2"><a href={`https://t.me/paketshopuz?text=${encodeURIComponent(telegramText)}`} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-600 font-bold text-white"><MessageCircle size={19} />{t.telegramCta}</a><Link href={`/${locale}`} className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 font-bold">{t.home}</Link></div></section></main>;
  }
  if (cart.length === 0) return <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center text-slate-950"><PackageCheck className="text-slate-400" size={52} /><h1 className="mt-5 text-3xl font-black">{t.empty}</h1><p className="mt-2 text-slate-600">{t.emptyText}</p><Link href={`/${locale}/catalog`} className="mt-7 rounded-xl bg-red-600 px-6 py-3 font-bold text-white">{t.back}</Link></main>;

  const customerTypes: Array<[CustomerType, string]> = [['entrepreneur', t.entrepreneur], ['organization', t.organization], ['reseller', t.reseller], ['individual', t.individual]];
  const payments: Array<[PaymentMethod, string]> = [['cash', t.cash], ['card_transfer', t.card], ['bank', t.bank], ['terminal', t.terminal], ['other', t.other]];

  return <main className="min-h-screen bg-slate-50 pb-20 pt-28 text-slate-950"><div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"><button onClick={onBack} className="inline-flex items-center gap-2 font-semibold text-slate-600 hover:text-red-700"><ArrowLeft size={18} />{t.back}</button><div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
    <section><h1 className="text-3xl font-black sm:text-4xl">{t.title}</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">{t.intro}</p><form onSubmit={submit} noValidate className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <fieldset><legend className="mb-3 font-bold">{t.customerType}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{customerTypes.map(([value, label]) => <label key={value} className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-semibold ${customerType === value ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200'}`}><input type="radio" className="sr-only" checked={customerType === value} onChange={() => { setCustomerType(value); if (value === 'organization') setPaymentMethod('bank'); }} />{label}</label>)}</div></fieldset>
      <div className="grid gap-4 sm:grid-cols-2"><input required value={form.name} onChange={set('name')} placeholder={t.name} aria-label={t.name} className={inputClass} /><input required type="tel" value={form.phone} onChange={set('phone')} placeholder={`${t.phone} — +998 90 123 45 67`} aria-label={t.phone} className={inputClass} /><input value={form.telegram} onChange={set('telegram')} placeholder={t.telegram} aria-label={t.telegram} className={inputClass} /><input required value={form.region} onChange={set('region')} placeholder={t.region} aria-label={t.region} className={inputClass} /></div>
      <input value={form.address} onChange={set('address')} placeholder={t.address} aria-label={t.address} className={inputClass} /><textarea value={form.note} onChange={set('note')} placeholder={t.note} aria-label={t.note} rows={3} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-red-500" /><input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} className="hidden" aria-hidden="true" />
      <fieldset><legend className="mb-3 font-bold">{t.payment}</legend><div className="flex flex-wrap gap-2">{payments.map(([value, label]) => <label key={value} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold ${paymentMethod === value ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200'}`}><input type="radio" className="sr-only" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} />{label}</label>)}</div></fieldset>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-600"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4" />{t.consent}</label>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}<button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 font-bold text-white disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={19} /> : <Send size={19} />}{loading ? t.submitting : t.submit}</button><p className="flex items-center justify-center gap-2 text-xs text-slate-500"><ShieldCheck size={15} />{t.confirm}</p>
    </form></section>
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28 sm:p-7"><h2 className="text-xl font-bold">{t.summary}</h2><div className="mt-5 space-y-5">{cart.map((item) => { const key = item.catalogId || String(item.id); const unit = saleUnitLabel(item.saleUnit || 'PACK', locale); const baseUnits = item.saleUnit === 'CARTON' ? item.unitsPerCarton : item.itemsPerPackage; return <article key={key} className="flex gap-4 border-b border-slate-100 pb-5 last:border-0"><img src={item.image} alt={getLocalizedText(item.name, locale)} className="h-20 w-20 rounded-xl bg-slate-100 object-contain" /><div className="min-w-0 flex-1"><p className="font-mono text-xs text-slate-500">{t.sku}: {item.sku || `PS-${item.id}`}</p><h3 className="mt-1 font-semibold leading-5">{getLocalizedText(item.name, locale)}</h3><p className="mt-2 text-sm text-slate-600">{item.quantity} {unit}{baseUnits ? ` · ${item.quantity * baseUnits} ${t.piece}` : ''}</p><p className="mt-1 font-bold">{money(item.quoteUnitPrice * item.quantity)}</p></div></article>; })}</div><div className="mt-6 border-t border-slate-200 pt-5"><div className="flex justify-between gap-4"><span className="text-sm text-slate-600">{t.estimated}</span><strong>{money(cartTotal)}</strong></div><p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{t.confirm}</p></div></aside>
  </div></div></main>;
}
