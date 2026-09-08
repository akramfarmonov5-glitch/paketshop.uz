import Link from 'next/link';
import { Banknote, CreditCard, Building2, Smartphone, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/payment',
    title: {
      uz: 'To‘lov usullari | PaketShop.uz',
      ru: 'Способы оплаты | PaketShop.uz',
    },
    description: {
      uz: 'Naqd pul, karta o‘tkazmasi, terminal va tashkilotlar uchun rasmiy bank hisob raqami (shartnoma va hisob-faktura) orqali to‘lov.',
      ru: 'Оплата наличными, переводом на карту, через терминал или на расчетный счет с закрывающими документами для организаций.',
    },
  });
}

export default async function PaymentPage({ params }: PageProps) {
  const { lang } = await params;
  const isRu = lang === 'ru';

  const methods = [
    {
      icon: Building2,
      badgeUz: 'Tashkilotlar uchun',
      badgeRu: 'Для юрлиц',
      titleUz: 'Bank hisob-kitob raqami (Perechisleniye)',
      titleRu: 'Безналичный расчет (на р/счет)',
      descUz: 'YTT, MChJ va davlat korxonalari uchun qonuniy rasmiy shartnoma hamda elektron hisob-faktura (Didox) taqdim etiladi.',
      descRu: 'Для ООО, ИП и бюджетных организаций. Работаем по договору с полным комплектом закрывающих документов (Didox ЭСФ).',
      noteUz: 'To‘lov tasdiqlangandan so‘ng mahsulot ombordan darhol chiqariladi.',
      noteRu: 'Отгрузка производится сразу после поступления средств на счет.',
    },
    {
      icon: CreditCard,
      badgeUz: 'Tezkor',
      badgeRu: 'Быстро',
      titleUz: 'Karta o‘tkazmasi (Uzcard / Humo)',
      titleRu: 'Перевод на карту (Uzcard / Humo)',
      descUz: 'Istalgan bank mobil ilovasi (Click, Payme, Uzum va h.k.) orqali korporativ yoki rasmiy kartaga to‘lov o‘tkazish mumkin.',
      descRu: 'Оплата через любое мобильное банковское приложение (Click, Payme, Uzum и др.) на официальную карту.',
      noteUz: 'Menejer buyurtmani tasdiqlagach, rekvizitlar taqdim etiladi.',
      noteRu: 'Реквизиты отправляются после подтверждения наличия товара менеджером.',
    },
    {
      icon: Banknote,
      badgeUz: 'Qulay',
      badgeRu: 'Удобно',
      titleUz: 'Naqd pul orqali to‘lov',
      titleRu: 'Оплата наличными',
      descUz: 'Toshkent shahridagi omborimizdan tovarlarni olib ketishda yoki kuryer yetkazib berganda to‘g‘ridan-to‘g‘ri naqd to‘lash mumkin.',
      descRu: 'Оплата наличными средствами при самовывозе с нашего склада в Ташкенте или курьеру при получении.',
      noteUz: 'Xarid cheki yoki tovar hujjati beriladi.',
      noteRu: 'Предоставляется товарный чек или накладная.',
    },
    {
      icon: Smartphone,
      badgeUz: 'Omborda',
      badgeRu: 'На складе',
      titleUz: 'Bank terminali',
      titleRu: 'Оплата через терминал',
      descUz: 'Omborimizga kelib xarid qilganingizda Uzcard va Humo bank kartalari orqali terminalda to‘lash imkoniyati mavjud.',
      descRu: 'При посещении склада доступна оплата через стационарный банковский терминал картами Uzcard и Humo.',
      noteUz: 'Komissiyasiz to‘lov.',
      noteRu: 'Без дополнительных комиссий.',
    },
  ];

  const steps = [
    {
      step: '01',
      titleUz: 'So‘rov yuborish',
      titleRu: 'Отправка заявки',
      descUz: 'Saytda tovarlarni savatga yig‘ib so‘rov yuboring yoki Telegram/telefon orqali bog‘laning.',
      descRu: 'Соберите нужные позиции в корзину и оформите заказ или свяжитесь через Telegram / телефон.',
    },
    {
      step: '02',
      titleUz: 'Menejer tasdiqlashi',
      titleRu: 'Согласование заказа',
      descUz: 'Menejer ombor qoldig‘i, ulgurji chegirma va yetkazish shartlarini siz bilan 10-15 daqiqada tasdiqlaydi.',
      descRu: 'Менеджер свяжется с вами, подтвердит наличие на складе, оптовую скидку и условия доставки.',
    },
    {
      step: '03',
      titleUz: 'Hisob / To‘lov',
      titleRu: 'Выставление счета и оплата',
      descUz: 'Yuridik shaxslarga hisob-faktura yuboriladi yoki qulay to‘lov usuli bo‘yicha to‘lov amalga oshiriladi.',
      descRu: 'Для юрлиц выставляется счет на оплату, для физлиц предоставляются реквизиты.',
    },
    {
      step: '04',
      titleUz: 'Yetkazish yoki topshirish',
      titleRu: 'Отгрузка товара',
      descUz: 'To‘lov amalga oshishi bilan buyurtma ombordan jo‘natiladi yoki topshiriladi.',
      descRu: 'Заказ собирается и немедленно передается в доставку или выдается на складе.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-28 text-slate-900">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 mb-4">
            {isRu ? 'Оплата и расчеты' : 'To‘lov va hisob-kitob'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
            {isRu ? 'Способы и порядок оплаты' : 'To‘lov usullari va tartibi'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {isRu
              ? 'Мы предлагаем прозрачные и удобные условия расчетов как для розничных и оптовых покупателей, так и для крупных организаций с полным пакетом документов.'
              : 'PaketShop.uz xaridorlar va tashkilotlar uchun shaffof, rasmiy va qulay to‘lov shakllarini taqdim etadi.'}
          </p>
        </div>

        {/* Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {methods.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
                      <Icon size={24} />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                      {isRu ? item.badgeRu : item.badgeUz}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {isRu ? item.titleRu : item.titleUz}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {isRu ? item.descRu : item.descUz}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
                  {isRu ? item.noteRu : item.noteUz}
                </div>
              </div>
            );
          })}
        </div>

        {/* Process Steps */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 mb-16 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">
            {isRu ? 'Как происходит процесс покупки?' : 'Xarid qilish jarayoni qanday kechadi?'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-2xl font-black text-red-600/70 block mb-2">
                    {step.step}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mb-2">
                    {isRu ? step.titleRu : step.titleUz}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isRu ? step.descRu : step.descUz}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organizations Callout */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
              <FileText size={16} />
              <span>{isRu ? 'Для корпоративных клиентов' : 'Tashkilotlar uchun'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black mb-2">
              {isRu ? 'Нужен договор и счет-фактура?' : 'Shartnoma va hisob-faktura kerakmi?'}
            </h3>
            <p className="text-slate-400 text-sm max-w-lg">
              {isRu
                ? 'Оставьте заявку на странице для организаций — мы выставим счет в системе Didox в течение 30 минут.'
                : 'Tashkilotlar uchun mo‘ljallangan bo‘limda rekvizitlaringizni qoldiring — Didox orqali 30 daqiqada hisob-faktura chiqaramiz.'}
            </p>
          </div>
          <Link
            href={`/${lang}/organizations`}
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-7 py-4 rounded-2xl transition-all shrink-0"
          >
            <span>{isRu ? 'Организациям' : 'Tashkilotlar bo‘limi'}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
