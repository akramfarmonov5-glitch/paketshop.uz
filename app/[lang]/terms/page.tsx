import StaticContentPage from '@/components/StaticContentPage';
import { localizedPageMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return localizedPageMetadata({
    lang,
    path: '/terms',
    title: {
      uz: 'Foydalanish shartlari | PaketShop.uz',
      ru: 'Условия использования | PaketShop.uz',
    },
    description: {
      uz: 'PaketShop.uz katalogi, buyurtma so‘rovi va savdo xizmatlaridan foydalanish shartlari.',
      ru: 'Условия использования каталога, заявок на заказ и услуг продаж PaketShop.uz.',
    },
  });
}

export default async function TermsPage({ params }: PageProps) {
  const { lang } = await params;
  const isRu = lang === 'ru';

  const sections = isRu
    ? [
        {
          title: '1. Предмет соглашения',
          body: 'PaketShop.uz предоставляет пользователям доступ к электронному каталогу упаковочных материалов, посуды и сопутствующих товаров, а также возможность формировать заявки на оптовую покупку.',
        },
        {
          title: '2. Цены и наличие товара',
          body: 'Информация о товарах, ценах и характеристиках в каталоге носит информационный характер. Оптовая цена, фактическое наличие на складе и возможность бронирования партии подтверждаются менеджером после получения заявки.',
        },
        {
          title: '3. Оформление заказа и оплата',
          body: 'Оформление заявки на сайте не является безоговорочным обязательством покупки. Договор поставки считается заключенным с момента согласования условий с менеджером и выставления счета или получения оплаты.',
        },
        {
          title: '4. Доставка и приемка товара',
          body: 'Сроки и стоимость доставки зависят от выбранного способа (самовывоз, курьер, карго). Приемка товара по количеству и качеству упаковки производится покупателем в момент передачи товара.',
        },
        {
          title: '5. Ответственность сторон',
          body: 'Мы стремимся обеспечить максимальную точность информации на сайте и стабильность поставок. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств при наступлении обстоятельств непреодолимой силы (форс-мажор).',
        },
      ]
    : [
        {
          title: '1. Kelishuv predmeti',
          body: 'PaketShop.uz foydalanuvchilarga qadoqlash materiallari, bir martalik idishlar va xo‘jalik mahsulotlari elektron katalogidan foydalanish hamda ulgurji buyurtma so‘rovlarini shakllantirish imkoniyatini taqdim etadi.',
        },
        {
          title: '2. Narxlar va tovar mavjudligi',
          body: 'Saytdagi narxlar va mahsulot xususiyatlari dastlabki ma’lumot xarakteriga ega. Ulgurji chegirmali yakuniy narx, ombordagi aniq qoldiq va yetkazib berish shartlari mijoz so‘rovi qabul qilingach menejer tomonidan tasdiqlanadi.',
        },
        {
          title: '3. Buyurtma berish va to‘lov tartibi',
          body: 'Sayt orqali so‘rov qoldirish to‘g‘ridan-to‘g‘ri to‘lov majburiyatini yuklamaydi. Xarid shartnomasi menejer bilan barcha tafsilotlar kelishilgach va hisob-faktura chiqarilgach yoki to‘lov tasdiqlangach kuchga kiradi.',
        },
        {
          title: '4. Yetkazib berish va qabul qilish',
          body: 'Yetkazib berish muddati va narxi tanlangan usulga (samovivoz, kuryer, kargo) bog‘liq. Mahsulot soni va butunligi xaridor tomonidan tovar qabul qilinayotgan vaqtda tekshiriladi.',
        },
        {
          title: '5. Tomonlar javobgarligi',
          body: 'PaketShop.uz katalogdagi ma’lumotlarning aniqligi va buyurtmalarning o‘z vaqtida bajarilishini ta’minlashga harakat qiladi. Fors-major holatlarida tomonlar o‘zaro kelishuv asosida harakat qiladilar.',
        },
      ];

  return (
    <StaticContentPage
      title={isRu ? 'Условия использования' : 'Foydalanish shartlari'}
      intro={
        isRu
          ? 'Пожалуйста, ознакомьтесь с правилами использования каталога и оформления оптовых заказов на платформе PaketShop.uz.'
          : 'Iltimos, PaketShop.uz platformasi katalogidan foydalanish va ulgurji buyurtma rasmiylashtirish qoidalari bilan tanishib chiqing.'
      }
      sections={sections}
    />
  );
}
