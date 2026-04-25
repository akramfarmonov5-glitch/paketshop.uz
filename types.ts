
export interface Product {
  id: number;
  name: string;
  price: number;
  formattedPrice: string;
  category: string; // This will link to Category.slug or name
  image: string;
  images?: string[]; // Qo'shimcha rasmlar (max 4)
  videoUrl?: string; // YouTube video link
  shortDescription: string;
  specs: { label: string; value: string }[];
  stock?: number;
  itemsPerPackage?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  description?: string;
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
  label: string;
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
  label: string;
  href: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Kutilmoqda' | 'To\'landi' | 'Yetkazilmoqda' | 'Yakunlandi';

export interface OrderItem {
  id?: number;
  name: string;
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
  title: string;
  image: string;
  content: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
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
