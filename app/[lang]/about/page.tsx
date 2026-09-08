import Link from 'next/link';
import { Package, ShieldCheck, Truck, Users, Award, ArrowRight } from 'lucide-react';
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
      uz: 'PaketShop.uz — Toshkentdagi qadoqlash materiallari, paketlar va bir martalik idishlar ulgurji yetkazib beruvchisi. HoReCa va savdo uchun birinchi qo‘l narxlar.',
      ru: 'PaketShop.uz — оптовый поставщик упаковочных материалов, пакетов и одноразовой посуды в Ташкенте. Первые цены для HoReCa и торговли.',
    },
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { lang } = await params;
  const isRu = lang === 'ru';

  const stats = [
    { value: '1 000+', labelUz: 'Mahsulot turlari', labelRu: 'Видов продукции' },
    { value: '500+', labelUz: 'Doimiy B2B mijozlar', labelRu: 'Постоянных клиентов' },
    { value: '12', labelUz: 'Viloyatga yetkazish', labelRu: 'Регионов доставки' },
    { value: '100%', labelUz: 'Hujjatlar va hisob-faktura', labelRu: 'Официальные документы' },
  ];

  const features = [
    {
      icon: Package,
      titleUz: 'Katta ombor va barqaror assortiment',
      titleRu: 'Собственный склад и стабильный ассортимент',
      descUz: 'Toshkent shahridagi markaziy omborimizda ommabop qadoqlash materiallari, bir martalik idishlar va salfetkalar doimiy mavjud bo‘ladi.',
      descRu: 'На нашем центральном складе в Ташкенте всегда в наличии популярные упаковочные материалы, одноразовая посуда и салфетки.',
    },
    {
      icon: Award,
      titleUz: 'Birinchi qo‘l ulgurji narxlar',
      titleRu: 'Первые оптовые цены от производителей',
      descUz: 'Ishlab chiqaruvchilar bilan to‘g‘ridan-to‘g‘ri hamkorlik qilganimiz sababli xaridorlarimizga eng maqbul va raqobatbardosh narxlarni taqdim etamiz.',
      descRu: 'Прямые поставки от производителей позволяют предлагать самые выгодные оптовые цены без лишних посредников.',
    },
    {
      icon: ShieldCheck,
      titleUz: 'Tashkilotlar uchun rasmiy shartnoma',
      titleRu: 'Официальный договор для организаций',
      descUz: 'Yuridik shaxslar, davlat va xususiy korxonalar uchun bank orqali to‘lov, hisob-faktura (Didox) va shartnoma taqdim etiladi.',
      descRu: 'Работаем с юридическими лицами по безналичному расчету, предоставляем полный пакет закрывающих документов (ЭСФ Didox).',
    },
    {
      icon: Truck,
      titleUz: 'Tezkor yetkazib berish tizimi',
      titleRu: 'Быстрая и гибкая доставка',
      descUz: 'Toshkent bo‘ylab kuryer va Yandex orqali, butun O‘zbekiston viloyatlariga esa kargo va yuk mashinalari orqali xavfsiz yetkazamiz.',
      descRu: 'Курьерская доставка по Ташкенту и отправка карго / грузовым автотранспортом во все регионы Узбекистана.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-28 text-slate-900">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 mb-4">
            {isRu ? 'О компании PaketShop.uz' : 'PaketShop.uz haqida'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
            {isRu
              ? 'Надежный оптовый партнер в сфере упаковки и одноразовой посуды'
              : 'Qadoqlash materiallari va bir martalik idishlar bo‘yicha ishonchli hamkoringiz'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {isRu
              ? 'PaketShop.uz — современная платформа оптовых поставок упаковочных материалов, крафт-пакетов, пищевых контейнеров и расходных материалов для сегмента HoReCa, ритейла и производства по всему Узбекистану.'
              : 'PaketShop.uz — O‘zbekistondagi umumiy ovqatlanish shoxobchalari (HoReCa), chakana savdo tarmoqlari, qandolatchilar va ishlab chiqaruvchilar uchun qadoqlash vositalari va bir martalik idishlarning yirik ulgurji ta’minotchisi.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 text-center shadow-sm">
              <div className="text-3xl sm:text-4xl font-black text-red-600 mb-2 font-mono">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-600">
                {isRu ? stat.labelRu : stat.labelUz}
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">
            {isRu ? 'Почему выбирают PaketShop.uz?' : 'Nega aynan PaketShop.uz?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {isRu ? item.titleRu : item.titleUz}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {isRu ? item.descRu : item.descUz}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Who We Serve */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 mb-16 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
            {isRu ? 'Для кого мы работаем?' : 'Kimlar uchun xizmat qilamiz?'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-slate-700">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">
                {isRu ? '☕ Кафе и рестораны (HoReCa)' : '☕ Kafe va restoranlar (HoReCa)'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600">
                {isRu
                  ? 'Одноразовые стаканы, крышки, ланч-боксы, крафт-пакеты, салфетки и трубочки для напитков.'
                  : 'Bir martalik stakanlar, qopqoqlar, lanch-bokslar, sous idishlari, salfetkalar va naychalar.'}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">
                {isRu ? '🛍 Магазины и маркетплейсы' : '🛍 Do‘konlar va marketpleyslar'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600">
                {isRu
                  ? 'Зип-пакеты, фасовочные пакеты, майки, скотч и стрейч-пленка для надежной упаковки заказов.'
                  : 'Zip-Lock paketlar, mayka paketlar, rulo strech plyonkalar va qadoqlash skotchi.'}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">
                {isRu ? '🏢 Организации и реселлеры' : '🏢 Tashkilotlar va qayta sotuvchilar'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600">
                {isRu
                  ? 'Крупные оптовые объемы, поставка в регионы, расчетный счет с НДС, персональный менеджер.'
                  : 'Katta hajmda korobkali xaridlar, viloyatlarga jo‘natish, shartnoma va individual menejer.'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">
            {isRu ? 'Готовы сделать заказ или запросить оптовый прайс?' : 'Buyurtma berishga yoki ulgurji narx olishga tayyormisiz?'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            {isRu
              ? 'Ознакомьтесь с полным каталогом товаров или свяжитесь с нашим отделом продаж для получения индивидуального коммерческого предложения.'
              : 'Katalogimizdagi tovarlar bilan tanishing yoki maxsus tijorat taklifi olish uchun savdo bo‘limimizga murojaat qiling.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${lang}/catalog`}
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-sm"
            >
              <span>{isRu ? 'Открыть каталог' : 'Katalogni ko‘rish'}</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-2xl transition-all border border-white/20"
            >
              <span>{isRu ? 'Связаться с нами' : 'Biz bilan bog‘lanish'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
