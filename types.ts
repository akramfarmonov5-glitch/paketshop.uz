export interface LocalizedString {
  uz: string;
  ru: string;
  en: string;
}

export interface Product {
  id: number;
  name: string | LocalizedString;
  price: number;
  formattedPrice: string;
  category: string; // This will link to Category.slug or name
  image: string;
  images?: string[]; // Qo'shimcha rasmlar (max 4)
  videoUrl?: string; // YouTube video link
  shortDescription: string | LocalizedString;
  specs: { label: string | LocalizedString; value: string | LocalizedString }[];
  stock?: number;
  itemsPerPackage?: number;
}

export interface Category {
  id: number;
  name: string | LocalizedString;
  slug: string;
  image: string;
  description?: string | LocalizedString;
  googleProductCategory?: string; // For FB/Google Catalog mapping
}

export interface HeroContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  images: string[]; // Changed from single image to array
}

export interface MenuItem {
  id: number;
  label: string | LocalizedString;
  href: string; // Masalan: "#" yoki "/category/soatlar"
}

export interface SocialLink {
  id: number;
  platform: 'instagram' | 'telegram' | 'facebook' | 'youtube' | 'twitter';
  url: string;
}

export interface NavigationSettings {
  menuItems: MenuItem[];
  socialLinks: SocialLink[];
}

export interface NavItem {
  label: string | LocalizedString;
  href: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Kutilmoqda' | 'To\'landi' | 'Yetkazilmoqda' | 'Yakunlandi';

export interface OrderItem {
  id?: number;
  name: string | LocalizedString;
  quantity: number;
  price?: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  total: number;
  status: OrderStatus;
  date: string;
  paymentMethod: 'Paynet' | 'Naqd';
  items?: OrderItem[];
  created_at?: string;
}

export interface BlogPost {
  id: number;
  title: string | LocalizedString;
  image: string;
  content: string | LocalizedString;
  seo: {
    title: string | LocalizedString;
    description: string | LocalizedString;
    keywords: string[] | LocalizedString; // LocalizedString can contain stringified arrays if needed
  };
  date: string;
}

export interface ChatLead {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  last_message?: string;
}

export interface Review {
  id: string;
  product_id: number;
  user_name: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
}

declare global {
  interface ImportMeta {
    env: any;
  }
}
