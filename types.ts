export interface LocalizedString {
  uz: string;
  ru: string;
}

export interface Product {
  id: number;
  catalogId?: string;
  sku?: string;
  legacySku?: string;
  name: string | LocalizedString;
  slug?: string | LocalizedString;
  price: number;
  formattedPrice: string;
  category: string;
  image: string;
  images?: string[];
  shortDescription: string | LocalizedString;
  specs: { label: string | LocalizedString; value: string | LocalizedString }[];
  stock?: number;
  itemsPerPackage?: number;
  packsPerCarton?: number;
  unitsPerCarton?: number;
  minimumOrderQuantity?: number;
  orderStep?: number;
  baseUnit?: 'PIECE' | 'METER' | 'KILOGRAM' | 'ROLL' | 'LITER';
  saleUnit?: 'PIECE' | 'PACK' | 'CARTON' | 'ROLL' | 'KILOGRAM';
  priceMode?: 'PUBLIC_EXACT' | 'FROM_PRICE' | 'LOGIN_REQUIRED' | 'REQUEST_ONLY';
  availabilityStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'CHECK_AVAILABILITY' | 'ON_ORDER' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  originCountry?: string;
}

export interface Category {
  id: number;
  name: string | LocalizedString;
  slug: string | LocalizedString;
  image: string;
  description?: string | LocalizedString;
}

export interface HeroContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  images: string[];
}

export interface MenuItem {
  id: number;
  label: string | LocalizedString;
  href: string;
}

export interface SocialLink {
  id: number;
  platform: 'instagram' | 'telegram';
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
  quoteUnitPrice: number;
}

export interface OrderItem {
  id?: number;
  name: string | LocalizedString;
  quantity: number;
  price?: number;
}

export interface BlogPost {
  id: number;
  title: string | LocalizedString;
  slug?: string | LocalizedString;
  image: string;
  content: string | LocalizedString;
  seo: {
    title: string | LocalizedString;
    description: string | LocalizedString;
    keywords: string[] | LocalizedString;
  };
  date: string;
}

declare global {
  interface ImportMeta {
    env: any;
  }
}
