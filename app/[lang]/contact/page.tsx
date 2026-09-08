import { Phone, Send, MapPin, Clock } from 'lucide-react';
import LeadRequestForm from '@/components/LeadRequestForm';
import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/contact',
    title: {
      uz: 'PaketShop.uz kontaktlari | Savdo bo‘limi va manzil',
      ru: 'Контакты PaketShop.uz | Отдел продаж и адрес',
    },
    description: {
      uz: 'Ulgurji qadoqlash va bir martalik idishlar bo‘yicha PaketShop.uz savdo bo‘limi bilan bog‘laning. Telefon: +998 99 644 84 44.',
      ru: 'Свяжитесь с отделом продаж PaketShop.uz по вопросам оптовой упаковки и одноразовой посуды. Телефон: +998 99 644 84 44.',
    },
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { lang } = await params;
  const isRu = lang === 'ru';
  const locale = isRu ? 'ru' : 'uz';

  const contactCards = [
    {
      icon: Phone,
      titleUz: 'Telefon raqam',
      titleRu: 'Телефон отдела продаж',
      value: '+998 99 644 84 44',
      href: 'tel:+998996448444',
      noteUz: 'Qo‘ng‘iroqlarni qabul qilish',
      noteRu: 'Прием звонков и консультации',
    },
    {
      icon: Send,
      titleUz: 'Telegram orqali aloqa',
      titleRu: 'Telegram канал и бот',
      value: '@paketshop_uz',
      href: 'https://t.me/paketshop_uz',
      noteUz: 'Tezkor javob va narxlar',
      noteRu: 'Быстрый ответ и прайс-листы',
    },
    {
      icon: MapPin,
      titleUz: 'Markaziy ombor manzili',
      titleRu: 'Адрес центрального склада',
      value: isRu ? 'г. Ташкент, Узбекистан' : 'Toshkent sh., O‘zbekiston',
      href: null,
      noteUz: 'Samovivoz va namunalar',
      noteRu: 'Самовывоз и демонстрация образцов',
    },
    {
      icon: Clock,
      titleUz: 'Ish tartibi',
      titleRu: 'График работы',
      value: isRu ? 'Пн–Сб: 09:00 – 20:00' : 'Dush–Shan: 09:00 – 20:00',
      href: null,
      noteUz: 'Yakshanba — dam olish kuni',
      noteRu: 'Воскресенье — выходной',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-28 text-slate-900">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 mb-4">
            {isRu ? 'Свяжитесь с нами' : 'Biz bilan bog‘laning'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
            {isRu ? 'Контакты отдела продаж' : 'Savdo bo‘limi kontaktlari'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {isRu
              ? 'Есть вопросы по оптовым поставкам, наличию товара или сотрудничеству? Позвоните нам, напишите в Telegram или оставьте заявку прямо на сайте.'
              : 'Ulgurji xaridlar, tovar mavjudligi yoki hamkorlik bo‘yicha savollaringiz bormi? Qo‘ng‘iroq qiling, Telegram orqali yozing yoki saytda so‘rov qoldiring.'}
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {contactCards.map((card, idx) => {
            const Icon = card.icon;
            const content = (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="p-3 bg-red-50 text-red-600 rounded-2xl w-fit mb-4">
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    {isRu ? card.titleRu : card.titleUz}
                  </span>
                  <div className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                    {card.value}
                  </div>
                </div>
                <div className="text-xs text-slate-500 pt-3 border-t border-slate-100">
                  {isRu ? card.noteRu : card.noteUz}
                </div>
              </div>
            );

            if (card.href) {
              return (
                <a
                  key={idx}
                  href={card.href}
                  target={card.href.startsWith('http') ? '_blank' : undefined}
                  rel={card.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="block group"
                >
                  {content}
                </a>
              );
            }

            return <div key={idx}>{content}</div>;
          })}
        </div>

        {/* Contact Form Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                {isRu ? 'Оставить заявку или запрос прайса' : 'So‘rov yoki narx so‘rash'}
              </h2>
              <p className="text-slate-600 text-sm">
                {isRu
                  ? 'Заполните форму ниже, и дежурный менеджер свяжется с вами в течение 15 минут.'
                  : 'Quyidagi shaklni to‘ldiring, menejerimiz 15 daqiqa ichida siz bilan bog‘lanadi.'}
              </p>
            </div>

            <LeadRequestForm
              type="contact"
              locale={locale}
              fields={['telegram', 'city', 'note']}
              title={isRu ? 'Обратная связь' : 'Qayta aloqa'}
              submitLabel={isRu ? 'Отправить запрос' : 'So‘rovni yuborish'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
