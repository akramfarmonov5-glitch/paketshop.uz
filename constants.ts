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

export const MOCK_CATEGORIES: Category[] = [];

export const MOCK_PRODUCTS: Product[] = [];