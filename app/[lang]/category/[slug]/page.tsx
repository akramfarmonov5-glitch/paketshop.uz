'use client';
import { useGlobalData } from '../../../../context/GlobalContext';
import FeaturedProducts from '../../../../components/FeaturedProducts';
import { useParams, useRouter } from 'next/navigation';
import { productSlug } from '../../../../lib/slugify';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug;
  const lang = params?.lang || 'uz';
  const { products, categories, isLoading } = useGlobalData();
  const router = useRouter();

  const handleNavigateToProduct = (id: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const activeLang = String(lang || 'uz');
      router.push(`/${activeLang}/product/${productSlug(product, activeLang)}`);
    } else {
      router.push(`/${lang}/product/${id}`);
    }
  };

  return (
    <div className="pt-24 pb-12">
      <FeaturedProducts products={products} categories={categories} activeCategory={String(slug)} onNavigateToProduct={handleNavigateToProduct} isLoading={isLoading} />
    </div>
  );
}
