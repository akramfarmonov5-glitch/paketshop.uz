import { supabase, hasSupabaseCredentials } from './supabaseClient';
import { slugify } from './slugify';
import { getLocalizedText } from './i18nUtils';
import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  DEFAULT_HERO_CONTENT,
  DEFAULT_NAVIGATION,
} from '../constants';
import type {
  Product,
  Category,
  HeroContent,
  NavigationSettings,
  BlogPost,
} from '../types';

export interface GlobalData {
  products: Product[];
  categories: Category[];
  heroContent: HeroContent;
  navigationSettings: NavigationSettings;
  blogPosts: BlogPost[];
}

export async function fetchGlobalData(): Promise<GlobalData> {
  if (!hasSupabaseCredentials) {
    return {
      products: MOCK_PRODUCTS,
      categories: MOCK_CATEGORIES,
      heroContent: DEFAULT_HERO_CONTENT,
      navigationSettings: DEFAULT_NAVIGATION,
      blogPosts: [],
    };
  }

  const [productsRes, categoriesRes, heroRes, blogRes, navRes] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('categories').select('*'),
    supabase.from('hero_content').select('*').single(),
    supabase.from('blog_posts').select('*').order('date', { ascending: false }),
    supabase.from('navigation_settings').select('*').single(),
  ]);

  const products: Product[] =
    productsRes.data && productsRes.data.length > 0
      ? productsRes.data.map((p: any) => ({
          ...p,
          formattedPrice: new Intl.NumberFormat('uz-UZ').format(Number(p.price)) + ' UZS',
          shortDescription: p.description || '',
          specs: p.specifications || [],
          videoUrl: p.videoUrl || '',
        }))
      : MOCK_PRODUCTS;

  const categories: Category[] =
    categoriesRes.data && categoriesRes.data.length > 0
      ? categoriesRes.data.map((c: any) => ({
          ...c,
          slug: c.slug || slugify(getLocalizedText(c.name, 'uz')),
        }))
      : MOCK_CATEGORIES;

  const heroContent: HeroContent = heroRes.data
    ? {
        badge: heroRes.data.badge || 'Yangi Mavsum',
        title: heroRes.data.title || 'Premium Collection',
        description: heroRes.data.description || '',
        buttonText: heroRes.data.buttonText || heroRes.data.button_text || 'Sotib olish',
        images: heroRes.data.images || [],
      }
    : DEFAULT_HERO_CONTENT;

  const blogPosts: BlogPost[] = blogRes.data
    ? blogRes.data.map((post: any) => ({
        ...post,
        seo: post.seo || {
          title: post.seo_title || post.title,
          description: post.seo_description || '',
          keywords: post.seo_keywords || [],
        },
      }))
    : [];

  const navigationSettings: NavigationSettings = navRes.data
    ? {
        menuItems: navRes.data.menuItems || navRes.data.menu_items || [],
        socialLinks: navRes.data.socialLinks || navRes.data.social_links || [],
      }
    : DEFAULT_NAVIGATION;

  return { products, categories, heroContent, navigationSettings, blogPosts };
}
