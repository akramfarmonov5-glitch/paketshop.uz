import Link from 'next/link';
import { Truck, Store, Zap, Navigation, HelpCircle, PhoneCall } from 'lucide-react';
import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/delivery',
    title: {
      uz: 'Yetkazib berish shartlari | PaketShop.uz',
      ru: 'Условия доставки | PaketShop.uz',
    },
    description: {
      uz: 'Toshkent bo‘ylab kuryer, ombordan olib ketish, Yandex orqali tezkor yetkazish va O‘zbekiston viloyatlariga kargo/yuk mashinasi orqali jo‘natish shartlari.',
      ru: 'Курьерская доставка по Ташкенту, самовывоз со склада, Яндекс.Доставка и отправка карго / грузовым транспортом в регионы Узбекистана.',
    },
  });
}

export default async function DeliveryPage({ params }: PageProps) {
  const { lang } = await params;
  const isRu = lang === 'ru';

  const methods = [
    {
      icon: Store,
      titleUz: 'Ombor / do‘kondan olib ketish (Samovivoz)',
      titleRu: 'Самовывоз со склада / магазина',
      badgeUz: 'Bepul',
      badgeRu: 'Бесплатно',
      descUz: 'Buyurtmangiz tayyor bo‘lgach, Toshkent shahridagi omborimizdan o‘zingiz uchun qulay vaqtda bepul olib ketishingiz mumkin.',
      descRu: 'После подтверждения заказа вы можете забрать его бесплатно с нашего склада в Ташкенте в удобное рабочее время.',
      detailsUz: 'Ish vaqti: Dushanba – Shanba, 09:00 dan 20:00 gacha.',
      detailsRu: 'График: Понедельник – Суббота, с 09:00 до 20:00.',
    },
    {
      icon: Truck,
      titleUz: 'Toshkent bo‘ylab kuryerlik yetkazish',
      titleRu: 'Курьерская доставка по Ташкенту',
      badgeUz: '30 000 – 50 000 so‘m*',
      badgeRu: '30 000 – 50 000 сум*',
      descUz: 'Toshkent shahri bo‘ylab buyurtmangiz eshikkacha yoki ko‘rsatilgan manzilgacha kuryer orqali yetkaziladi.',
      descRu: 'Доставка по Ташкенту до двери или указанного адреса курьерской службой.',
      detailsUz: '* Yakuniy narx buyurtmaning og‘irligi, hajmi va manzil masofasiga qarab menejer tomonidan aniqlanadi.',
      detailsRu: '* Точная стоимость зависит от объема, веса заказа и расстояния, подтверждается менеджером.',
    },
    {
      icon: Zap,
      titleUz: 'Yandex orqali tezkor yetkazish',
      titleRu: 'Срочная доставка через Яндекс',
      badgeUz: 'Mijoz hisobidan',
      badgeRu: 'За счет клиента',
      descUz: 'Mahsulotlar zudlik bilan kerak bo‘lganda, omborda yig‘ilib, Yandex Delivery / Taxi orqali 1-2 soat ichida yuboriladi.',
      descRu: 'Если товар нужен срочно, соберем заказ и отправим через Яндекс Доставку / Такси в течение 1-2 часов.',
      detailsUz: 'Yetkazish xarajatini mijoz to‘g‘ridan-to‘g‘ri Yandex tarifiga muvofiq qoplaydi.',
      detailsRu: 'Стоимость доставки оплачивается клиентом напрямую по тарифу сервиса Яндекс.',
    },
    {
      icon: Navigation,
      titleUz: 'Viloyatlarga kargo va yuk mashinasigacha',
      titleRu: 'Отправка в регионы (карго и грузовики)',
      badgeUz: 'Kelishuv asosida',
      badgeRu: 'По договоренности',
      descUz: 'O‘zbekistonning barcha viloyatlariga (Samarqand, Buxoro, Andijon, Farg‘ona, Namangan, Xorazm, Navoiy va b.) kargo orqali jo‘natamiz.',
      descRu: 'Отправляем во все регионы Узбекистана через междугородние карго-службы или до грузового автомобиля клиента.',
      detailsUz: 'Yirik ulgurji buyurtmalarni mijoz ko‘rsatgan viloyat qatnovchi yuk mashinasigacha (bozorlar / terminallar) yetkazib beramiz.',
      detailsRu: 'Крупные оптовые партии доставляем до грузовика клиента на рынках (Куйлюк, Абу Сахий) или терминалах.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-28 text-slate-900">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 mb-4">
            {isRu ? 'Логистика и доставка' : 'Logistika va yetkazib berish'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
            {isRu ? 'Условия и способы доставки' : 'Yetkazib berish shartlari va usullari'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {isRu
              ? 'Мы обеспечиваем оперативную доставку оптовых заказов по Ташкенту и надежную отправку во все регионы Республики Узбекистан.'
              : 'PaketShop.uz Toshkent shahri bo‘ylab tezkor yetkazish hamda butun O‘zbekiston hududlari bo‘ylab ishonchli kargo xizmatini taqdim etadi.'}
          </p>
        </div>

        {/* Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {methods.map((method, idx) => {
            const Icon = method.icon;
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
                      {isRu ? method.badgeRu : method.badgeUz}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {isRu ? method.titleRu : method.titleUz}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {isRu ? method.descRu : method.descUz}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
                  {isRu ? method.detailsRu : method.detailsUz}
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Notice Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 mb-16 flex items-start gap-4 text-amber-900">
          <HelpCircle size={24} className="shrink-0 text-amber-600 mt-0.5" />
          <div className="text-sm sm:text-base leading-relaxed">
            <h4 className="font-bold text-amber-950 mb-1">
              {isRu ? 'Важная информация по тарифам и срокам' : 'Muhim eslatma'}
            </h4>
            <p>
              {isRu
                ? 'Оптовые заказы часто имеют большой объем и вес (картонные коробки, мешки). Окончательная стоимость и возможность бесплатной доставки зависят от общего объема партии и адреса выгрузки. После оформления заказа менеджер свяжется с вами и предложит самый выгодный вариант.'
                : 'Ulgurji qadoqlash mahsulotlari ko‘p hollarda katta hajm va og‘irlikka ega bo‘ladi (korobkalar, qoplar). Yakuniy yetkazish narxi va bepul yetkazish imkoniyati buyurtma hajmi va tushirish manziliga qarab menejer tomonidan tasdiqlanadi.'}
            </p>
          </div>
        </div>

        {/* Help Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
            {isRu ? 'Есть вопросы по доставке вашего заказа?' : 'Yetkazib berish bo‘yicha savolingiz bormi?'}
          </h3>
          <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
            {isRu
              ? 'Наши менеджеры рассчитают точные сроки и подберут оптимальный способ транспортировки для вашего региона.'
              : 'Menejerlarimiz buyurtmangiz uchun eng qulay transport va yetkazish vaqtini hisoblab berishadi.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+998996448444"
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-7 py-3.5 rounded-2xl transition-all shadow-sm"
            >
              <PhoneCall size={18} />
              <span>+998 99 644 84 44</span>
            </a>
            <Link
              href={`/${lang}/tracking`}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-7 py-3.5 rounded-2xl transition-all"
            >
              <span>{isRu ? 'Отследить заказ' : 'Buyurtmani kuzatish'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
