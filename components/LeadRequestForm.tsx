'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { getSubmissionAttribution } from '@/lib/attribution';

type LeadFormType = 'wholesale' | 'organization' | 'reseller' | 'product_request' | 'contact';

type OptionalField =
  | 'telegram'
  | 'city'
  | 'email'
  | 'organizationName'
  | 'tin'
  | 'bankPayment'
  | 'contractNeeded'
  | 'tradePlace'
  | 'monthlyVolume'
  | 'categories'
  | 'products'
  | 'note';

interface LeadRequestFormProps {
  type: LeadFormType;
  locale: 'uz' | 'ru';
  fields: OptionalField[];
  title: string;
  submitLabel: string;
}

const copy = {
  uz: {
    name: 'Ismingiz yoki kompaniya nomi *',
    contactPerson: 'Mas‘ul shaxs *',
    phone: 'Telefon raqami *',
    phonePlaceholder: '+998 90 123 45 67',
    telegram: 'Telegram username',
    city: 'Shahar yoki viloyat',
    email: 'Email',
    organizationName: 'Tashkilot nomi *',
    tin: 'STIR (9 raqam)',
    bankPayment: 'Bank orqali to‘lov kerak',
    contractNeeded: 'Shartnoma kerak',
    tradePlace: 'Savdo joyi (bozor, do‘kon...)',
    monthlyVolume: 'Oylik taxminiy xarid hajmi',
    categories: 'Asosiy kerakli kategoriyalar',
    products: 'Kerakli mahsulotlar',
    note: 'Izoh',
    consent: 'Ma‘lumotlarim menejer bilan bog‘lanish uchun ishlatilishiga roziman',
    success: 'So‘rovingiz qabul qilindi. Menejerimiz tez orada siz bilan bog‘lanadi.',
    successTitle: 'Rahmat!',
    error: 'Yuborishda xatolik. Qayta urinib ko‘ring yoki telefon qiling.',
    phoneError: 'Telefon raqamini to‘g‘ri kiriting',
    consentError: 'Davom etish uchun rozilik belgilang',
  },
  ru: {
    name: 'Ваше имя или название компании *',
    contactPerson: 'Ответственное лицо *',
    phone: 'Номер телефона *',
    phonePlaceholder: '+998 90 123 45 67',
    telegram: 'Telegram username',
    city: 'Город или область',
    email: 'Email',
    organizationName: 'Название организации *',
    tin: 'ИНН (9 цифр)',
    bankPayment: 'Нужна оплата через банк',
    contractNeeded: 'Нужен договор',
    tradePlace: 'Место торговли (рынок, магазин...)',
    monthlyVolume: 'Примерный объём закупок в месяц',
    categories: 'Основные нужные категории',
    products: 'Нужные товары',
    note: 'Комментарий',
    consent: 'Согласен на использование моих данных для связи с менеджером',
    success: 'Ваша заявка принята. Менеджер свяжется с вами в ближайшее время.',
    successTitle: 'Спасибо!',
    error: 'Ошибка отправки. Попробуйте ещё раз или позвоните.',
    phoneError: 'Введите корректный номер телефона',
    consentError: 'Отметьте согласие, чтобы продолжить',
  },
};

const inputClass = 'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100';

export default function LeadRequestForm({ type, locale, fields, title, submitLabel }: LeadRequestFormProps) {
  const t = copy[locale];
  const startedAt = useMemo(() => Date.now(), []);
  const [values, setValues] = useState<Record<string, string>>({});
  const [bankPayment, setBankPayment] = useState(false);
  const [contractNeeded, setContractNeeded] = useState(false);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState('');

  const has = (field: OptionalField) => fields.includes(field);
  const set = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((previous) => ({ ...previous, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!consent) {
      setError(t.consentError);
      return;
    }
    if (String(values.phone || '').replace(/\D/g, '').length < 9) {
      setError(t.phoneError);
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          locale,
          name: values.name?.trim(),
          phone: values.phone?.trim(),
          telegram: values.telegram?.trim() || undefined,
          city: values.city?.trim() || undefined,
          email: values.email?.trim() || undefined,
          organizationName: values.organizationName?.trim() || undefined,
          tin: values.tin?.replace(/\D/g, '') || undefined,
          tradePlace: values.tradePlace?.trim() || undefined,
          monthlyVolume: values.monthlyVolume?.trim() || undefined,
          categories: values.categories?.trim() || undefined,
          products: values.products?.trim() || undefined,
          note: values.note?.trim() || undefined,
          ...(has('bankPayment') ? { bankPayment } : {}),
          ...(has('contractNeeded') ? { contractNeeded } : {}),
          attribution: getSubmissionAttribution(),
          website: '',
          startedAt,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || t.error);
      }
      setStatus('success');
    } catch (submitError) {
      setStatus('idle');
      setError(submitError instanceof Error && submitError.message ? submitError.message : t.error);
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-emerald-600" size={40} />
        <h3 className="text-lg font-bold text-emerald-900">{t.successTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-emerald-800">{t.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" noValidate>
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>

      {has('organizationName') && (
        <input required value={values.organizationName || ''} onChange={set('organizationName')} placeholder={t.organizationName} aria-label={t.organizationName} className={inputClass} />
      )}
      <input required value={values.name || ''} onChange={set('name')} placeholder={has('organizationName') ? t.contactPerson : t.name} aria-label={has('organizationName') ? t.contactPerson : t.name} className={inputClass} />
      <input required type="tel" value={values.phone || ''} onChange={set('phone')} placeholder={`${t.phone} — ${t.phonePlaceholder}`} aria-label={t.phone} className={inputClass} />

      <div className="grid gap-4 sm:grid-cols-2">
        {has('tin') && <input inputMode="numeric" value={values.tin || ''} onChange={set('tin')} placeholder={t.tin} aria-label={t.tin} className={inputClass} />}
        {has('email') && <input type="email" value={values.email || ''} onChange={set('email')} placeholder={t.email} aria-label={t.email} className={inputClass} />}
        {has('telegram') && <input value={values.telegram || ''} onChange={set('telegram')} placeholder={t.telegram} aria-label={t.telegram} className={inputClass} />}
        {has('city') && <input value={values.city || ''} onChange={set('city')} placeholder={t.city} aria-label={t.city} className={inputClass} />}
        {has('tradePlace') && <input value={values.tradePlace || ''} onChange={set('tradePlace')} placeholder={t.tradePlace} aria-label={t.tradePlace} className={inputClass} />}
        {has('monthlyVolume') && <input value={values.monthlyVolume || ''} onChange={set('monthlyVolume')} placeholder={t.monthlyVolume} aria-label={t.monthlyVolume} className={inputClass} />}
      </div>

      {has('categories') && <input value={values.categories || ''} onChange={set('categories')} placeholder={t.categories} aria-label={t.categories} className={inputClass} />}
      {has('products') && <textarea value={values.products || ''} onChange={set('products')} placeholder={t.products} aria-label={t.products} rows={2} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />}
      {has('note') && <textarea value={values.note || ''} onChange={set('note')} placeholder={t.note} aria-label={t.note} rows={3} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />}

      {(has('bankPayment') || has('contractNeeded')) && (
        <div className="flex flex-wrap gap-4">
          {has('bankPayment') && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={bankPayment} onChange={(event) => setBankPayment(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
              {t.bankPayment}
            </label>
          )}
          {has('contractNeeded') && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={contractNeeded} onChange={(event) => setContractNeeded(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
              {t.contractNeeded}
            </label>
          )}
        </div>
      )}

      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
        {t.consent}
      </label>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      <button type="submit" disabled={status === 'submitting'} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60">
        {status === 'submitting' ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        {submitLabel}
      </button>
    </form>
  );
}
