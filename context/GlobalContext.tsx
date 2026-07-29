'use client';
import React, { createContext, useContext, useState } from 'react';
import { Product, Category, HeroContent, NavigationSettings, BlogPost } from '../types';
import { DEFAULT_HERO_CONTENT, DEFAULT_NAVIGATION } from '../constants';

interface GlobalContextType {
  products: Product[];
  categories: Category[];
  heroContent: HeroContent;
  navigationSettings: NavigationSettings;
  blogPosts: BlogPost[];
  isLoading: boolean;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setHeroContent: React.Dispatch<React.SetStateAction<HeroContent>>;
  setNavigationSettings: React.Dispatch<React.SetStateAction<NavigationSettings>>;
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

const GlobalContext = createContext<GlobalContextType>({} as GlobalContextType);

export const useGlobalData = () => useContext(GlobalContext);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [navigationSettings, setNavigationSettings] = useState<NavigationSettings>(DEFAULT_NAVIGATION);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  return (
    <GlobalContext.Provider value={{
      products, categories, heroContent, navigationSettings, blogPosts, isLoading: false,
      setProducts, setCategories, setHeroContent, setNavigationSettings, setBlogPosts
    }}>
      {children}
    </GlobalContext.Provider>
  );
}
