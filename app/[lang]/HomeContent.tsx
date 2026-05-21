'use client';

import React, { useState } from 'react';
import Hero from '../../components/Hero';
import TrustBadges from '../../components/TrustBadges';
import CategoryGrid from '../../components/CategoryGrid';
import PromoBanner from '../../components/PromoBanner';
import FeaturedProducts from '../../components/FeaturedProducts';
import Testimonials from '../../components/Testimonials';
import BlogGrid from '../../components/BlogGrid';
import { useRouter } from 'next/navigation';
import * as fpixel from '../../lib/fpixel';
import { getLocalizedText } from '../../lib/i18nUtils';
import { productSlug } from '../../lib/slugify';
import type { Product, Category, HeroContent, BlogPost } from '../../types';

interface HomeContentProps {
  lang: string;
  products: Product[];
  categories: Category[];
  heroContent: HeroContent;
  blogPosts: BlogPost[];
}

export default function HomeContent({
  lang,
  products,
  categories,
  heroContent,
  blogPosts,
}: HomeContentProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const router = useRouter();

  const handleCategorySelect = (categoryName: string) => {
    setActiveCategory(categoryName);
    const category = categories.find(
      (c) => getLocalizedText(c.name, 'uz') === categoryName || c.slug === categoryName
    );
    if (category) {
      fpixel.trackViewCategory(getLocalizedText(category.name, 'uz'));
    }
    const element = document.getElementById('featured-products');
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const navigateToProduct = (id: number) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      router.push(`/${lang}/product/${productSlug(product, lang)}`);
    } else {
      router.push(`/${lang}/product/${id}`);
    }
  };

  const navigateToBlogPost = (slug: string) => {
    router.push(`/${lang}/blog/${slug}`);
  };

  return (
    <main className="pb-20">
      <Hero content={heroContent} />
      <TrustBadges />
      <CategoryGrid
        categories={categories}
        onSelectCategory={handleCategorySelect}
        isLoading={false}
      />
      <PromoBanner />
      <FeaturedProducts
        products={products}
        categories={categories}
        activeCategory={activeCategory}
        onNavigateToProduct={navigateToProduct}
        isLoading={false}
      />
      <Testimonials />
      <BlogGrid posts={blogPosts} onPostClick={navigateToBlogPost} isLoading={false} />
    </main>
  );
}
