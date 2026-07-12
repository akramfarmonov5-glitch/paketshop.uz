import { CheckCircle2 } from 'lucide-react';
import LeadRequestForm from './LeadRequestForm';

interface Props { locale: 'uz' | 'ru'; type: 'wholesale' | 'organization' | 'reseller'; eyebrow: string; title: string; description: string; benefits: string[] }

export default function B2BBusinessLanding({ locale, type, eyebrow, title, description, benefits }: Props) {
  const fields = type === 'organization'
    ? ['organizationName', 'tin', 'email', 'city', 'products', 'bankPayment', 'contractNeeded', 'note'] as const
    : ['telegram', 'city', 'tradePlace', 'monthlyVolume', 'categories', 'products', 'note'] as const;

  return <main className="min-h-screen bg-slate-50 pb-24 pt-28 text-slate-950"><section className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[.18em] text-red-700">{eyebrow}</p><h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">{title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{description}</p></div></section><section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><h2 className="text-2xl font-bold">{locale === 'ru' ? 'Что вы получите' : 'Siz uchun imkoniyatlar'}</h2><ul className="mt-6 space-y-4">{benefits.map((benefit) => <li key={benefit} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"><CheckCircle2 className="shrink-0 text-emerald-600" size={21} /><span className="leading-6">{benefit}</span></li>)}</ul></div><LeadRequestForm type={type} locale={locale} fields={[...fields]} title={locale === 'ru' ? 'Получить предложение' : 'Taklif olish'} submitLabel={locale === 'ru' ? 'Отправить заявку' : 'So‘rov yuborish'} /></section></main>;
}
