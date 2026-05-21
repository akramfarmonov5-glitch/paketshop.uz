'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, HeroContent, NavigationSettings, BlogPost } from '../types';
import { supabase, hasSupabaseCredentials } from '../lib/supabaseClient';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, DEFAULT_HERO_CONTENT, DEFAULT_NAVIGATION } from '../constants';
import { slugify } from '../lib/slugify';
import { getLocalizedText } from '../lib/i18nUtils';

interface GlobalContextType {
  products: Product[];
  categories: Category[];
  heroContent: HeroContent;
  navigationSettings: NavigationSettings;
  blogPosts: BlogPost[];
  isLoading: boolean;
  setProducts: (p: Product[]) => void;
  setCategories: (c: Category[]) => void;
  setHeroContent: (h: HeroContent) => void;
  setNavigationSettings: (n: NavigationSettings) => void;
  setBlogPosts: (b: BlogPost[]) => void;
}

const GlobalContext = createContext<GlobalContextType>({} as GlobalContextType);

export const useGlobalData = () => useContext(GlobalContext);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [navigationSettings, setNavigationSettings] = useState<NavigationSettings>(DEFAULT_NAVIGATION);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!hasSupabaseCredentials) {
          setProducts(MOCK_PRODUCTS);
          setCategories(MOCK_CATEGORIES);
          setIsLoading(false);
          return;
        }

        const [
          productsRes,
          categoriesRes,
          heroRes,
          blogRes,
          navRes,
        ] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('categories').select('*'),
          supabase.from('hero_content').select('*').single(),
          supabase.from('blog_posts').select('*').order('date', { ascending: false }),
          supabase.from('navigation_settings').select('*').single(),
        ]);

        if (productsRes.data && productsRes.data.length > 0) {
          const mappedProducts = productsRes.data.map(p => ({
            ...p,
            formattedPrice: new Intl.NumberFormat('uz-UZ').format(Number(p.price)) + ' UZS',
            shortDescription: p.description || '',
            specs: p.specifications || [],
            videoUrl: p.videoUrl || ''
          }));
          setProducts(mappedProducts as Product[]);
        }

        if (categoriesRes.data && categoriesRes.data.length > 0) {
          const mappedCategories = categoriesRes.data.map(c => ({
            ...c,
            slug: c.slug || slugify(getLocalizedText(c.name, 'uz'))
          }));
          setCategories(mappedCategories as Category[]);
        }

        if (heroRes.data) {
          const heroData = heroRes.data;
          setHeroContent({
            badge: heroData.badge || 'Yangi Mavsum',
            title: heroData.title || 'Premium Collection',
            description: heroData.description || '',
            buttonText: heroData.buttonText || heroData.button_text || 'Sotib olish',
            images: heroData.images || [],
          });
        }

        if (blogRes.data) {
          const mappedPosts = blogRes.data.map((post) => ({
            ...post,
            seo: post.seo || {
              title: post.seo_title || post.title,
              description: post.seo_description || '',
              keywords: post.seo_keywords || [],
            },
          }));
          setBlogPosts(mappedPosts as BlogPost[]);
        }

        if (navRes.data) {
          const navData = navRes.data;
          setNavigationSettings({
            menuItems: navData.menuItems || navData.menu_items || [],
            socialLinks: navData.socialLinks || navData.social_links || [],
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <GlobalContext.Provider value={{
      products, categories, heroContent, navigationSettings, blogPosts, isLoading,
      setProducts, setCategories, setHeroContent, setNavigationSettings, setBlogPosts
    }}>
      {children}
    </GlobalContext.Provider>
  );
}
