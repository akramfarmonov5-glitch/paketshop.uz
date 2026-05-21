import { Product, Category, HeroContent, NavigationSettings } from './types';

export const DEFAULT_HERO_CONTENT: HeroContent = {
  badge: "Yangi Xizmat",
  title: "Sizning ishonchli hamkoringiz",
  description: "Biz sizning biznesingiz uchun tez va ishonchli yetkazib berish xizmatlarini taqdim etamiz. Bizning jamoamiz paketlaringiz o'z manziliga xavfsiz va o'z vaqtida yetib borishini ta'minlashga bag'ishlangan.",
  buttonText: "Hozir buyurtma berish",
  images: [
    "https://images.unsplash.com/photo-1547996160-71df45082e0e?q=80&w=1000&auto=format&fit=crop", // Nature/Landscape for vibe
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop", // Fashion Model
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop"  // Shopping/Luxury
  ]
};

export const DEFAULT_NAVIGATION: NavigationSettings = {
  menuItems: [
    { id: 1, label: "Yangi To'plam", href: "#" },
    { id: 2, label: "Erkaklar", href: "#" },
    { id: 3, label: "Ayollar", href: "#" },
    { id: 4, label: "Aksessuarlar", href: "#" }
  ],
  socialLinks: [
    { id: 1, platform: 'instagram', url: 'https://instagram.com' },
    { id: 2, platform: 'telegram', url: 'https://t.me' }
  ]
};

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: {
      uz: "Kraft Qog'oz Paketlar",
      ru: "Крафт Бумажные Пакеты",
      en: "Kraft Paper Bags"
    },
    slug: {
      uz: "qogoz-paketlar",
      ru: "bumajnie-paketi",
      en: "paper-bags"
    },
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
    description: {
      uz: "Tabiiy va ekologik toza kraft qog'ozdan tayyorlangan paketlar.",
      ru: "Пакеты из натуральной и экологически чистой крафт-бумаги.",
      en: "Bags made from natural and eco-friendly kraft paper."
    }
  },
  {
    id: 2,
    name: {
      uz: "Oziq-ovqat Idishlari",
      ru: "Пищевые Контейнеры",
      en: "Food Containers"
    },
    slug: {
      uz: "oziq-ovqat-idishlari",
      ru: "pishchevie-konteyneri",
      en: "food-containers"
    },
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=600&auto=format&fit=crop",
    description: {
      uz: "Issiq va sovuq taomlar uchun bir martalik sifatli idishlar.",
      ru: "Качественная одноразовая посуда для горячих и холодных блюд.",
      en: "High-quality disposable containers for hot and cold dishes."
    }
  },
  {
    id: 3,
    name: {
      uz: "Karton Qutilar",
      ru: "Картонные Коробки",
      en: "Cardboard Boxes"
    },
    slug: {
      uz: "karton-qutilar",
      ru: "kartonnie-korobki",
      en: "cardboard-boxes"
    },
    image: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600&auto=format&fit=crop",
    description: {
      uz: "Kuryerlar, yetkazib berish va saqlash uchun qattiq karton qutilar.",
      ru: "Прочные картонные коробки для курьеров, доставки и хранения.",
      en: "Sturdy cardboard boxes for couriers, delivery, and storage."
    }
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: {
      uz: "Kraft qog'oz paket 32x22x12 sm",
      ru: "Крафт бумажный пакет 32x22x12 см",
      en: "Kraft paper bag 32x22x12 cm"
    },
    price: 2500,
    formattedPrice: "2 500 UZS",
    category: "qogoz-paketlar",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop"
    ],
    shortDescription: {
      uz: "Restoranlar, do'konlar va sovg'alar uchun juda qulay jigarrang kraft paket.",
      ru: "Удобный коричневый крафт-пакет для ресторанов, магазинов и подарков.",
      en: "Convenient brown kraft bag for restaurants, shops, and gifts."
    },
    specs: [
      { label: { uz: "O'lchami", ru: "Размер", en: "Size" }, value: "32x22x12 sm" },
      { label: { uz: "Zichligi", ru: "Плотность", en: "Density" }, value: "80 g/m²" },
      { label: { uz: "Tutqichi", ru: "Ручка", en: "Handle" }, value: { uz: "Yassi qog'oz", ru: "Плоская бумажная", en: "Flat paper" } }
    ],
    stock: 5000,
    itemsPerPackage: 100
  },
  {
    id: 2,
    name: {
      uz: "Oziq-ovqat konteyneri 750 ml (qopqoqli)",
      ru: "Контейнер пищевой 750 мл (с крышкой)",
      en: "Food container 750 ml (with lid)"
    },
    price: 1800,
    formattedPrice: "1 800 UZS",
    category: "oziq-ovqat-idishlari",
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=600&auto=format&fit=crop",
    shortDescription: {
      uz: "Mikroto'lqinli pechda isitishga chidamli, germetik oziq-ovqat idishi.",
      ru: "Герметичный пищевой контейнер, устойчивый к нагреванию в микроволновой печи.",
      en: "Airtight food container, microwave-safe."
    },
    specs: [
      { label: { uz: "Hajmi", ru: "Объем", en: "Volume" }, value: "750 ml" },
      { label: { uz: "Material", ru: "Материал", en: "Material" }, value: "PP (Polipropilen)" },
      { label: { uz: "Rangi", ru: "Цвет", en: "Color" }, value: { uz: "Shaffof", ru: "Прозрачный", en: "Transparent" } }
    ],
    stock: 12000,
    itemsPerPackage: 50
  },
  {
    id: 3,
    name: {
      uz: "Karton quti 40x30x20 sm (Kuryerlik)",
      ru: "Картонная коробка 40x30x20 см (Курьерская)",
      en: "Cardboard box 40x30x20 cm (Courier)"
    },
    price: 4500,
    formattedPrice: "4 500 UZS",
    category: "karton-qutilar",
    image: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=600&auto=format&fit=crop",
    shortDescription: {
      uz: "Uch qavatli, mustahkam kartondan tayyorlangan pochta va yuk jo'natish qutisi.",
      ru: "Почтовая и грузовая коробка из трехслойного прочного картона.",
      en: "Three-layer sturdy cardboard box for mailing and shipping."
    },
    specs: [
      { label: { uz: "O'lchami", ru: "Размер", en: "Size" }, value: "40x30x20 sm" },
      { label: { uz: "Karton turi", ru: "Тип картона", en: "Cardboard type" }, value: "T-23 B" },
      { label: { uz: "Qatlam soni", ru: "Количество слоев", en: "Layers" }, value: "3" }
    ],
    stock: 2500,
    itemsPerPackage: 25
  }
];