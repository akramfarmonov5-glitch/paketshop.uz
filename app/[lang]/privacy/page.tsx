import StaticContentPage from '@/components/StaticContentPage';
import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/privacy',
    title: {
      uz: 'Maxfiylik siyosati | PaketShop.uz',
      ru: 'Политика конфиденциальности | PaketShop.uz',
    },
    description: {
      uz: 'PaketShop.uz saytida mijoz ma’lumotlarini yig‘ish, saqlash va himoya qilish qoidalari.',
      ru: 'Правила сбора, хранения и защиты данных клиентов на сайте PaketShop.uz.',
    },
  });
}

export default async function PrivacyPage({ params }: PageProps) {
  const { lang } = await params;
  const isRu = lang === 'ru';

  const sections = isRu
    ? [
        {
          title: '1. Общие положения',
          body: 'Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональной информации пользователей сайта PaketShop.uz. Мы соблюдаем законодательство Республики Узбекистан в сфере защиты персональных данных.',
        },
        {
          title: '2. Сбор информации',
          body: 'При оформлении заказа, запросе оптового прайса или обращении через форму обратной связи мы собираем следующие данные:\n• Имя и контактное лицо;\n• Номер телефона;\n• Адрес доставки и город;\n• Название организации и ИНН (для юридических лиц);\n• Никнейм в Telegram (по желанию).',
        },
        {
          title: '3. Цели использования данных',
          body: 'Мы используем предоставленную информацию исключительно для:\n• Обработки и подтверждения вашего оптового заказа;\n• Связи с вами для согласования деталей отгрузки и доставки;\n• Оформления бухгалтерских документов и договоров;\n• Улучшения качества обслуживания и информирования о статусе заказа.',
        },
        {
          title: '4. Защита и передача третьим лицам',
          body: 'Мы не передаем ваши личные данные третьим лицам, за исключением случаев, необходимых для исполнения заказа (например, передача номера телефона и адреса курьерской службе или транспортной компании для доставки), либо по требованию уполномоченных органов в соответствии с законом.',
        },
        {
          title: '5. Контакты по вопросам конфиденциальности',
          body: 'Если у вас есть вопросы касательно обработки персональных данных, вы можете связаться с нами по телефону +998 99 644 84 44 или написать на support@paketshop.uz.',
        },
      ]
    : [
        {
          title: '1. Umumiy qoidalar',
          body: 'Ushbu Maxfiylik siyosati PaketShop.uz sayti foydalanuvchilarining shaxsiy ma’lumotlarini to‘plash, qayta ishlash va himoya qilish tartibini belgilaydi. Biz O‘zbekiston Respublikasining "Shaxsga doir ma’lumotlar to‘g‘risida"gi qonuniga to‘liq rioya qilamiz.',
        },
        {
          title: '2. To‘planadigan ma’lumotlar',
          body: 'Saytda buyurtma so‘rovi berish, ulgurji narx so‘rash yoki qayta aloqa shaklini to‘ldirishda quyidagi ma’lumotlar olinishi mumkin:\n• Ism va mas’ul shaxs;\n• Telefon raqami;\n• Yetkazib berish manzili va shahar/viloyat;\n• Tashkilot nomi va STIR (yuridik shaxslar uchun);\n• Telegram foydalanuvchi nomi.',
        },
        {
          title: '3. Ma’lumotlardan foydalanish maqsadlari',
          body: 'Yig‘ilgan ma’lumotlardan quyidagi maqsadlarda foydalaniladi:\n• Buyurtma so‘rovingizni ko‘rib chiqish va tasdiqlash;\n• Yetkazib berish va to‘lov shartlarini kelishish uchun bog‘lanish;\n• Tashkilotlar uchun shartnoma va hisob-faktura rasmiylashtirish;\n• Buyurtma holatini mijozga xabar qilish.',
        },
        {
          title: '4. Xavfsizlik va uchinchi shaxslarga bermaslik',
          body: 'Mijozlarning shaxsiy ma’lumotlari uchinchi shaxslarga sotilmaydi va berilmaydi. Faqat buyurtmani yetkazib berish uchun zarur bo‘lgan hollarda (kuryer yoki kargo xizmatiga manzil va telefon taqdim etish) yoki qonunda belgilangan holatlarda foydalaniladi.',
        },
        {
          title: '5. Savollar bo‘yicha aloqa',
          body: 'Maxfiylik siyosati bo‘yicha savollaringiz bo‘lsa, biz bilan +998 99 644 84 44 raqami yoki support@paketshop.uz elektron pochtasi orqali bog‘lanishingiz mumkin.',
        },
      ];

  return (
    <StaticContentPage
      title={isRu ? 'Политика конфиденциальности' : 'Maxfiylik siyosati'}
      intro={
        isRu
          ? 'Мы ценим ваше доверие и гарантируем безопасность и конфиденциальность предоставляемых вами персональных и коммерческих данных.'
          : 'Biz sizning ishonchingizni qadrlaymiz va taqdim etilgan barcha shaxsiy hamda tijoriy ma’lumotlar xavfsizligini kafolatlaymiz.'
      }
      sections={sections}
    />
  );
}
