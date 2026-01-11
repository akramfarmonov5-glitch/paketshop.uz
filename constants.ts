import { Product, Category, HeroContent, NavigationSettings } from './types';

export const DEFAULT_HERO_CONTENT: HeroContent = {
  badge: "Yangi Mavsum",
  title: "Premium Collection 2026",
  description: "Sifatli mahsulotlar va qulay narxlar. O'z uslubingizni PaketShop bilan yangi bosqichga olib chiqing.",
  buttonText: "Sotib olish",
  images: [
    "https://images.unsplash.com/photo-1547996160-71df45082e0e?q=80&w=1000&auto=format&fit=crop", // Nature/Landscape for vibe
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop", // Fashion Model
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop"  // Shopping/Luxury
  ]
};

export const DEFAULT_NAVIGATION: NavigationSettings = {
  menuItems: [
    { id: 'nav_1', label: "Yangi To'plam", href: "#" },
    { id: 'nav_2', label: "Erkaklar", href: "#" },
    { id: 'nav_3', label: "Ayollar", href: "#" },
    { id: 'nav_4', label: "Aksessuarlar", href: "#" }
  ],
  socialLinks: [
    { id: 'soc_1', platform: 'instagram', url: 'https://instagram.com' },
    { id: 'soc_2', platform: 'telegram', url: 'https://t.me' }
  ]
};

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat_1',
    name: 'Soatlar',
    slug: 'soatlar',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop',
    description: 'Vaqtni qadrlaydiganlar uchun eksklyuziv shveytsariya soatlari.',
    googleProductCategory: 'Apparel & Accessories > Jewelry > Watches'
  },
  {
    id: 'cat_2',
    name: 'Sumkalar',
    slug: 'sumkalar',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
    description: 'Italiya charmidan tayyorlangan premium sumkalar.',
    googleProductCategory: 'Apparel & Accessories > Handbags, Wallets & Cases'
  },
  {
    id: 'cat_3',
    name: 'Ko\'zoynaklar',
    slug: 'kozoynaklar',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop',
    description: 'Quyoshdan himoya va betakror uslub.',
    googleProductCategory: 'Apparel & Accessories > Clothing Accessories > Sunglasses'
  },
  {
    id: 'cat_4',
    name: 'Parfyumeriya',
    slug: 'parfyumeriya',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
    description: 'Betakror iforlar kolleksiyasi.',
    googleProductCategory: 'Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne'
  },
  {
    id: 'cat_5',
    name: 'Aksessuarlar',
    slug: 'aksessuarlar',
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1000&auto=format&fit=crop',
    description: 'Obrazingizni to\'ldiruvchi muhim detallar.',
    googleProductCategory: 'Apparel & Accessories > Clothing Accessories'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Midnight Chronograph",
    price: 12500000,
    formattedPrice: "12 500 000 UZS",
    category: "Soatlar",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Tungi osmon ilhomi bilan yaratilgan, olmos qoplamali eksklyuziv soat.",
    specs: [
      { label: "Mexanizm", value: "Swiss Automatic" },
      { label: "Korpus", value: "Titanium Grade 5" },
      { label: "Suvga chidamli", value: "100m" },
      { label: "Oyna", value: "Safir kristal" }
    ]
  },
  {
    id: 2,
    name: "Royal Leather Bag",
    price: 4800000,
    formattedPrice: "4 800 000 UZS",
    category: "Sumkalar",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Italiya charmidan qo'lda tikilgan, aslzodalar uchun maxsus dizayn.",
    specs: [
      { label: "Material", value: "Haqiqiy charm" },
      { label: "O'lchami", value: "35x25x15 sm" },
      { label: "Rang", value: "Konyak" },
      { label: "Furnitura", value: "Oltin qoplama" }
    ]
  },
  {
    id: 3,
    name: "Aviator Elite",
    price: 2100000,
    formattedPrice: "2 100 000 UZS",
    category: "Ko'zoynaklar",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Klassik uslub va zamonaviy himoya texnologiyalari uyg'unligi.",
    specs: [
      { label: "Linza", value: "Polarized UV400" },
      { label: "Ramka", value: "Aviatsiya alyuminiysi" },
      { label: "Uslub", value: "Vintage Pilot" },
      { label: "Og'irligi", value: "24g" }
    ]
  },
  {
    id: 4,
    name: "Essence No. 5",
    price: 3500000,
    formattedPrice: "3 500 000 UZS",
    category: "Parfyumeriya",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Noyob gullar va sharq ziravorlarining sehrli aralashmasi.",
    specs: [
      { label: "Hajmi", value: "100ml" },
      { label: "Turi", value: "Eau de Parfum" },
      { label: "Nota", value: "Jasmine, Sandalwood" },
      { label: "Davomiyligi", value: "12 soat+" }
    ]
  },
  {
    id: 5,
    name: "Golden Horizon Heels",
    price: 1800000,
    formattedPrice: "1 800 000 UZS",
    category: "Poyabzal",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Har bir qadamingizda o'zingizga bo'lgan ishonch va nafosat.",
    specs: [
      { label: "Material", value: "Zamsh" },
      { label: "Balandligi", value: "10sm" },
      { label: "Taglik", value: "Qizil lak" },
      { label: "Ishlab chiqarilgan", value: "Fransiya" }
    ]
  },
  {
    id: 6,
    name: "Obsidian Cufflinks",
    price: 950000,
    formattedPrice: "950 000 UZS",
    category: "Aksessuarlar",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Ishbilarmon erkaklar uchun minimalist va jiddiy uslubdagi tugmalar.",
    specs: [
      { label: "Tosh", value: "Qora Oniks" },
      { label: "Metall", value: "Kumush 925" },
      { label: "Shakli", value: "Kvadrat" },
      { label: "To'plam", value: "Sovg'a qutisi bilan" }
    ]
  },
  {
    id: 7,
    name: "Silk Monarch Scarf",
    price: 1200000,
    formattedPrice: "1 200 000 UZS",
    category: "Aksessuarlar",
    image: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "100% tabiiy ipakdan to'qilgan, yumshoq va nafis sharf.",
    specs: [
      { label: "Material", value: "100% Ipak" },
      { label: "O'lchami", value: "90x90 sm" },
      { label: "Naqsh", value: "Barokko" },
      { label: "Mavsum", value: "Barcha mavsum" }
    ]
  },
  {
    id: 8,
    name: "Titan Smart Ring",
    price: 3200000,
    formattedPrice: "3 200 000 UZS",
    category: "Texnologiya",
    image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Salomatlikni kuzatuvchi kelajak uzugi. Ko'rinmas texnologiya.",
    specs: [
      { label: "Batareya", value: "7 kun" },
      { label: "Sensorlar", value: "Yurak urishi, Uyqu" },
      { label: "Material", value: "Titan" },
      { label: "Suvga chidamli", value: "IP68" }
    ]
  }
];