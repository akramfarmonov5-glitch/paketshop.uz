'use client';

import FeaturedProducts from '../../../../components/FeaturedProducts';
import { useRouter } from 'next/navigation';
import { productSlug } from '../../../../lib/slugify';
import type { Product, Category } from '../../../../types';

interface CategoryContentProps {
  lang: string;
  slug: string;
  products: Product[];
  categories: Category[];
}

export default function CategoryContent({
  lang,
  slug,
  products,
  categories,
}: CategoryContentProps) {
  const router = useRouter();

  const handleNavigateToProduct = (id: number) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      router.push(`/${lang}/product/${productSlug(product, lang)}`);
    } else {
      router.push(`/${lang}/product/${id}`);
    }
  };

  return (
    <div className="pt-24 pb-12">
      <FeaturedProducts
        products={products}
        categories={categories}
        activeCategory={slug}
        onNavigateToProduct={handleNavigateToProduct}
        isLoading={false}
      />
    </div>
  );
}
