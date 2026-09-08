import Link from 'next/link';
import { HelpCircle, ChevronDown, PhoneCall, ArrowRight } from 'lucide-react';
import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/faq',
    title: {
      uz: 'Ko‘p so‘raladigan savollar (FAQ) | PaketShop.uz',
      ru: 'Часто задаваемые вопросы (FAQ) | PaketShop.uz',
    },
    description: {
      uz: 'Minimal buyurtma, ulgurji chegirmalar, hisob-faktura, viloyatlarga yetkazish va to‘lov bo‘yicha ko‘p beriladigan savollarga javoblar.',
      ru: 'Ответы на вопросы о минимальном заказе, оптовых ценах, договоре с НДС, доставке в регионы и оплате.',
    },
  });
}

export default async function FAQPage({ params }: PageProps) {
  const { lang } = await params;
  const isRu = lang === 'ru';

  const faqs = [
    {
      qUz: 'Minimal buyurtma miqdori qancha?',
      qRu: 'Какой минимальный объем заказа?',
      aUz: 'Bizda har bir mahsulot uchun minimal sotuv birligi mavjud (odatda 1 qadoq yoki 1 korobka). Mahsulot kartochkasida eng kam xarid miqdori (MOQ) aniq ko‘rsatilgan. Katta hajmda xarid qiluvchilar uchun esa ulgurji chegirmali narxlar amal qiladi.',
      aRu: 'Для каждого товара установлена минимальная единица продажи (обычно 1 упаковка или 1 коробка). Минимальное количество заказа указано в карточке товара. При заказе крупных объемов действуют оптовые скидки.',
    },
    {
      qUz: 'Ulgurji narxlar va pog‘onali chegirmalar qanday ishlaydi?',
      qRu: 'Как работают оптовые цены и шкала скидок?',
      aUz: 'Ko‘pgina mahsulotlarimizda xarid miqdori oshgan sari birlik narx arzonlashadi (masalan: 1-9 qadoq, 10-49 qadoq va 50+ qadoq). Savatda miqdorni oshirganingizda, umumiy summa eng qulay ulgurji narx bo‘yicha avtomatik qayta hisoblanadi.',
      aRu: 'Для большинства позиций действует ступенчатое ценообразование: чем больше объем, тем ниже цена за единицу (например: 1-9 упаковок, 10-49 упаковок и от 50 упаковок). При изменении количества в корзине цена пересчитывается автоматически.',
    },
    {
      qUz: 'Tashkilotlar uchun rasmiy shartnoma va hisob-faktura beriladimi?',
      qRu: 'Работаете ли вы с организациями по договору и счетам-фактурам?',
      aUz: 'Albatta! Biz barcha yuridik shaxslar, korxonalar va YTTlar bilan rasmiy shartnoma asosida ishlaymiz. Barcha hujjatlar elektron hisob-faktura tizimi (Didox) orqali rasmiylashtiriladi va to‘lov bank hisob raqamimizga qabul qilinadi.',
      aRu: 'Да, обязательно. Мы сотрудничаем с юридическими лицами (ООО, ИП, госструктуры) по официальному договору. Все закрывающие документы отправляются через систему электронных счетов-фактур (Didox).',
    },
    {
      qUz: 'O‘zbekiston viloyatlariga yetkazib berasizmi?',
      qRu: 'Осуществляется ли доставка в регионы Узбекистана?',
      aUz: 'Ha, butun respublika bo‘ylab kargo xizmatlari (BTS, Fargo, EMU va b.) orqali yoki Toshkentdagi ulgurji bozorlardan viloyatlarga qatnovchi mijoz yuk mashinalarigacha yetkazib beramiz. Transport xarajati buyurtma hajmiga ko‘ra kelishiladi.',
      aRu: 'Да, мы отправляем заказы во все области Узбекистана через проверенные службы карго либо доставляем до грузового транспорта клиента на рынках Ташкента. Условия и тарифы согласовываются индивидуально.',
    },
    {
      qUz: 'Qanday to‘lov usullari qabul qilinadi?',
      qRu: 'Какие способы оплаты поддерживаются?',
      aUz: 'Siz to‘lovni tashkilot hisob-kitob raqamiga (bank orqali), korporativ yoki rasmiy kartaga o‘tkazish (Uzcard/Humo) orqali, shuningdek Toshkentdagi ombordan olganda naqd pul yoki terminal orqali amalga oshirishingiz mumkin.',
      aRu: 'Вы можете оплатить заказ безналичным расчетом на банковский счет юрлица, переводом на карту (Uzcard/Humo), а также наличными или через терминал при получении на нашем складе.',
    },
    {
      qUz: 'Mahsulot namunalarini (obrazets) ko‘rish mumkinmi?',
      qRu: 'Можно ли ознакомиться с образцами продукции?',
      aUz: 'Ha, albatta. Toshkent shahridagi omborimizga tashrif buyurib, stakanlar, qadoqlar, kraft paketlar va idishlarning o‘lchami hamda sifatini bevosita tekshirib ko‘rishingiz mumkin.',
      aRu: 'Да, вы можете приехать на наш центральный склад в Ташкенте, чтобы вживую оценить плотность, размеры и качество стаканов, контейнеров, крафт-пакетов и другой упаковки.',
    },
    {
      qUz: 'Logotip tushirish va individual brending xizmati bormi?',
      qRu: 'Возможно ли нанесение логотипа (брендирование)?',
      aUz: 'Ha, ma’lum partiya hajmidan boshlab stakanlar, kraft paketlar va qadoqlarga buyurtmachi logotipini tushirish xizmatimiz mavjud. Shartlar va minimal tirajlarni savdo bo‘limi bilan muhokama qilishingiz mumkin.',
      aRu: 'Да, при заказе определенных тиражей мы выполняем брендирование стаканов, бумажных и полиэтиленовых пакетов. Минимальный тираж и сроки уточняйте у наших специалистов.',
    },
    {
      qUz: 'Buyurtma holatini qayerdan kuzatsam bo‘ladi?',
      qRu: 'Где можно отследить статус оформления заказа?',
      aUz: 'Saytimizning "Buyurtmani kuzatish" bo‘limiga kirib, telefon raqamingizni yoki buyurtma kodini (PS-...) kiritish orqali buyurtmaning joriy holatini (Qabul qilindi, Tasdiqlandi, Yetkazilmoqda va h.k.) real vaqtda bilib olishingiz mumkin.',
      aRu: 'В разделе "Отслеживание заказа" на сайте введите ваш номер телефона или код заказа (PS-...), чтобы узнать текущий статус (Принят, Подтвержден, Комплектуется, В доставке).',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-28 text-slate-900">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 mb-4">
            FAQ
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
            {isRu ? 'Часто задаваемые вопросы' : 'Ko‘p so‘raladigan savollar'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {isRu
              ? 'Здесь собраны ответы на самые важные вопросы об оптовых закупках упаковки, ценообразовании, оплате и доставке.'
              : 'Qadoqlash mahsulotlari xaridi, ulgurji narxlar, shartnoma va yetkazib berish bo‘yicha asosiy savollarga javoblar.'}
          </p>
        </div>

        {/* FAQs List */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden transition-all open:ring-1 open:ring-red-600/20"
            >
              <summary className="flex items-center justify-between cursor-pointer font-bold text-base sm:text-lg text-slate-900 gap-4">
                <span>{isRu ? faq.qRu : faq.qUz}</span>
                <span className="p-1 rounded-full bg-slate-100 group-open:rotate-180 transition-transform shrink-0">
                  <ChevronDown size={18} className="text-slate-600" />
                </span>
              </summary>
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                {isRu ? faq.aRu : faq.aUz}
              </p>
            </details>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm">
          <HelpCircle size={36} className="text-red-600 mx-auto mb-3" />
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            {isRu ? 'Не нашли ответ на свой вопрос?' : 'O‘zingizni qiziqtirgan savolga javob topmadingizmi?'}
          </h3>
          <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
            {isRu
              ? 'Свяжитесь с нашим отделом продаж напрямую — мы с радостью проконсультируем вас по всем деталям.'
              : 'Savdo bo‘limimizga murojaat qiling — mutaxassislarimiz har qanday savolingizga mamnuniyat bilan javob berishadi.'}
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
              href={`/${lang}/contact`}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-7 py-3.5 rounded-2xl transition-all"
            >
              <span>{isRu ? 'Написать нам' : 'Aloqa sahifasi'}</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
