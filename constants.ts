import { Product, Category, HeroContent, NavigationSettings } from './types';

export const DEFAULT_HERO_CONTENT: HeroContent = {
  badge: "Ulgurji katalog",
  title: "Bir martalik idishlar va qadoqlash mahsulotlari ulgurji savdosi",
  description: "Kafe, savdo nuqtalari, tashkilotlar va qayta sotuvchilar uchun ombordagi va buyurtma asosidagi mahsulotlar.",
  buttonText: "Katalogni ko'rish",
  images: [
    "/logo.png",
  ]
};

export const DEFAULT_NAVIGATION: NavigationSettings = {
  menuItems: [
    { id: 1, label: { uz: "Katalog", ru: "Каталог" }, href: "/catalog" },
    { id: 2, label: { uz: "Ulgurji", ru: "Оптом" }, href: "/wholesale" },
    { id: 3, label: { uz: "Tashkilotlarga", ru: "Организациям" }, href: "/organizations" },
    { id: 4, label: { uz: "Start to'plamlar", ru: "Стартовые наборы" }, href: "/starter-kits" },
  ],
  socialLinks: [
    { id: 1, platform: 'telegram', url: 'https://t.me/paketshopuz' },
    { id: 2, platform: 'instagram', url: 'https://instagram.com/paketshopuz' },
  ]
};

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: { uz: "Stakanlar va qopqoqlar", ru: "Стаканы и крышки" },
    slug: { uz: "stakanlar-va-qopqoqlar", ru: "stakany-i-kryshki" },
    image: "/logo.png",
    description: { uz: "Qog'oz va plastik stakanlar, qopqoqlar, aralashtirgichlar.", ru: "Бумажные и пластиковые стаканы, крышки, мешалки." }
  },
  {
    id: 2,
    name: { uz: "Bir martalik idishlar", ru: "Одноразовая посуда" },
    slug: { uz: "bir-martalik-idishlar", ru: "odnorazovaya-posuda" },
    image: "/logo.png",
    description: { uz: "Konteynerlar, likopchalar, sous idishlari.", ru: "Контейнеры, тарелки, соусники." }
  },
  {
    id: 3,
    name: { uz: "Kraft paketlar", ru: "Крафт-пакеты" },
    slug: { uz: "kraft-paketlar", ru: "kraft-pakety" },
    image: "/logo.png",
    description: { uz: "Tabiiy kraft qog'ozdan tayyorlangan paketlar.", ru: "Пакеты из натуральной крафт-бумаги." }
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    sku: "ST-250-KR",
    name: { uz: "Kraft qog'oz stakan 250 ml", ru: "Крафт бумажный стакан 250 мл" },
    price: 47500,
    formattedPrice: "47 500 so'm",
    category: "stakanlar-va-qopqoqlar",
    image: "/logo.png",
    shortDescription: { uz: "Issiq ichimliklar uchun kraft stakan, 250 ml.", ru: "Крафт-стакан для горячих напитков, 250 мл." },
    specs: [
      { label: { uz: "Hajmi", ru: "Объем" }, value: "250 ml" },
      { label: { uz: "Material", ru: "Материал" }, value: { uz: "Kraft qog'oz", ru: "Крафт-бумага" } },
    ],
    stock: 5000,
    itemsPerPackage: 50,
    packsPerCarton: 20,
    saleUnit: "PACK",
    baseUnit: "PIECE",
    priceMode: "PUBLIC_EXACT",
    availabilityStatus: "IN_STOCK",
  },
  {
    id: 2,
    sku: "KT-750-PP",
    name: { uz: "Oziq-ovqat konteyneri 750 ml", ru: "Контейнер пищевой 750 мл" },
    price: 35000,
    formattedPrice: "35 000 so'm",
    category: "bir-martalik-idishlar",
    image: "/logo.png",
    shortDescription: { uz: "Mikroto'lqinli pechda isitishga chidamli konteyner.", ru: "Контейнер для микроволновой печи." },
    specs: [
      { label: { uz: "Hajmi", ru: "Объем" }, value: "750 ml" },
      { label: { uz: "Material", ru: "Материал" }, value: "PP (Polipropilen)" },
    ],
    stock: 12000,
    itemsPerPackage: 50,
    packsPerCarton: 8,
    saleUnit: "PACK",
    baseUnit: "PIECE",
    priceMode: "PUBLIC_EXACT",
    availabilityStatus: "IN_STOCK",
  },
  {
    id: 3,
    sku: "KR-PAKET-32",
    name: { uz: "Kraft paket 32x22x12 sm", ru: "Крафт-пакет 32x22x12 см" },
    price: 55000,
    formattedPrice: "55 000 so'm",
    category: "kraft-paketlar",
    image: "/logo.png",
    shortDescription: { uz: "Kafe, do'kon va sovg'alar uchun kraft paket.", ru: "Крафт-пакет для кафе, магазинов и подарков." },
    specs: [
      { label: { uz: "O'lchami", ru: "Размер" }, value: "32x22x12 sm" },
      { label: { uz: "Zichligi", ru: "Плотность" }, value: "80 g/m²" },
    ],
    stock: 5000,
    itemsPerPackage: 100,
    packsPerCarton: 10,
    saleUnit: "PACK",
    baseUnit: "PIECE",
    priceMode: "FROM_PRICE",
    availabilityStatus: "IN_STOCK",
  },
];