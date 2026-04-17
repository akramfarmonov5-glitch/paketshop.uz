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
    name: 'Chiqindi paketlari',
    slug: 'chiqindi-paketlari',
    image: 'https://images.unsplash.com/photo-1610555356070-d1fb336f13b1?q=80&w=1000&auto=format&fit=crop',
    description: 'Sifatli va mustahkam chiqindi qoplari.',
    googleProductCategory: 'Home & Garden > Household Supplies > Waste Containment'
  },
  {
    id: 2,
    name: 'Salfetka va lattalar',
    slug: 'salfetka-lattalar',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=1000&auto=format&fit=crop',
    description: 'Tozalash ishlari uchun universal va mikrofibra lattalar.',
    googleProductCategory: 'Home & Garden > Household Supplies > Cleaning Supplies'
  },
  {
    id: 3,
    name: 'Zip-Lock paketlar',
    slug: 'zip-lock',
    image: 'https://images.unsplash.com/photo-1605600659908-0befcd3d6331?q=80&w=1000&auto=format&fit=crop',
    description: 'Zich yopiladigan, shaffof zip-paketlar.',
    googleProductCategory: 'Business & Industrial > Material Handling > Packaging & Shipping'
  },
  {
    id: 4,
    name: 'Konteynerlar va idishlar',
    slug: 'konteynerlar',
    image: 'https://images.unsplash.com/photo-1596649811779-16a70a8d67c5?q=80&w=1000&auto=format&fit=crop',
    description: 'Oziq-ovqat konteynerlari va bir martalik idishlar.',
    googleProductCategory: 'Home & Garden > Kitchen & Dining > Food Storage'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Musor paketlari Professional 50x70 sm",
    price: 8500,
    formattedPrice: "8 500 UZS",
    category: "Chiqindi paketlari",
    image: "https://images.unsplash.com/photo-1610555356070-d1fb336f13b1?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Sifatli va mustahkam qora rangli chiqindi qoplari, kundalik foydalanish uchun qulay.",
    stock: 500,
    itemsPerPackage: 25,
    specs: [
      { label: "O'lcham", value: "50x70 sm" },
      { label: "Soni", value: "25 dona" },
      { label: "Rang", value: "Qora" },
      { label: "Material", value: "Zich polietilen" }
    ]
  },
  {
    id: 2,
    name: "Chiqindi uchun qoplar 70x90 sm",
    price: 8000,
    formattedPrice: "8 000 UZS",
    category: "Chiqindi paketlari",
    image: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Katta hajmli va baquvvat chiqindi qoplari, ofis va xo'jalik ishlari uchun mos.",
    stock: 300,
    itemsPerPackage: 20,
    specs: [
      { label: "O'lcham", value: "70x90 sm" },
      { label: "Soni", value: "20 dona" },
      { label: "Hajm", value: "120L" },
      { label: "Turi", value: "Mustahkamlangan" }
    ]
  },
  {
    id: 3,
    name: "Verita universal tozalash lattalari",
    price: 8000,
    formattedPrice: "8 000 UZS",
    category: "Salfetka va lattalar",
    image: "https://images.unsplash.com/photo-1584820927498-cafe2c1c6e1e?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Yuqori sifatli universal lattalar, har qanday yuzani tozalash uchun ideal.",
    stock: 150,
    itemsPerPackage: 3,
    specs: [
      { label: "Turi", value: "Universal latta" },
      { label: "Soni", value: "3 dona" },
      { label: "Ishlab chiqaruvchi", value: "Verita (Germaniya)" },
      { label: "Xususiyat", value: "Namlikni yaxshi tortadi" }
    ]
  },
  {
    id: 4,
    name: "Mikrofibra lattalar",
    price: 17000,
    formattedPrice: "17 000 UZS",
    category: "Salfetka va lattalar",
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Uy va avtomobil uchun mikrofibra matoli lattalar, suvni yaxshi tortadi.",
    stock: 200,
    itemsPerPackage: 1,
    specs: [
      { label: "Material", value: "Mikrofibra" },
      { label: "Qo'llanilishi", value: "Uy va Avtomobil" },
      { label: "Afzalligi", value: "Dog' qoldirmaydi" },
      { label: "Hajmi", value: "40x40 sm" }
    ]
  },
  {
    id: 5,
    name: "Ziplock paketlar 6x9 sm",
    price: 5000,
    formattedPrice: "5 000 UZS",
    category: "Zip-Lock paketlar",
    image: "https://images.unsplash.com/photo-1605600659908-0befcd3d6331?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Mayda buyumlarni saqlash uchun qulay qulflanadigan kichik paketlar.",
    stock: 1000,
    itemsPerPackage: 200,
    specs: [
      { label: "O'lcham", value: "6x9 sm" },
      { label: "Soni", value: "200 dona" },
      { label: "Turi", value: "Shaffof Zip-lock" },
      { label: "Material", value: "Polietilen" }
    ]
  },
  {
    id: 6,
    name: "Ziplock paketlar 5x7 sm",
    price: 4000,
    formattedPrice: "4 000 UZS",
    category: "Zip-Lock paketlar",
    image: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Zich yopiladigan, shaffof va sifatli polietilen zip-paketlar.",
    stock: 1200,
    itemsPerPackage: 200,
    specs: [
      { label: "O'lcham", value: "5x7 sm" },
      { label: "Soni", value: "200 dona" },
      { label: "Zichligi", value: "Standart" },
      { label: "Qulf turi", value: "Germetik" }
    ]
  },
  {
    id: 7,
    name: "Plastik oziq-ovqat konteyneri 1000ml",
    price: 230000,
    formattedPrice: "230 000 UZS",
    category: "Konteynerlar va idishlar",
    image: "https://images.unsplash.com/photo-1596649811779-16a70a8d67c5?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Issiq va sovuq taomlar uchun mo'ljallangan plastik idishlar to'plami.",
    stock: 50,
    itemsPerPackage: 200,
    specs: [
      { label: "Hajmi", value: "1000 ml" },
      { label: "Soni", value: "200 dona" },
      { label: "Turi", value: "Oziq-ovqat uchun" },
      { label: "Material", value: "Oziq-ovqat plastigi" }
    ]
  },
  {
    id: 8,
    name: "Plastik sanchqilar (PS)",
    price: 13000,
    formattedPrice: "13 000 UZS",
    category: "Konteynerlar va idishlar",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000&auto=format&fit=crop",
    shortDescription: "Bir marta ishlatiladigan sifatli plastik sanchqilar.",
    stock: 800,
    itemsPerPackage: 100,
    specs: [
      { label: "Turi", value: "Sanchqi" },
      { label: "Soni", value: "100 dona" },
      { label: "Material", value: "Polistirol (PS)" },
      { label: "Rang", value: "Oq" }
    ]
  }
];