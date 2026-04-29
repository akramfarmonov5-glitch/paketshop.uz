'use client';
import { useGlobalData } from '../../../../context/GlobalContext';
import FeaturedProducts from '../../../../components/FeaturedProducts';
import { useParams, useRouter } from 'next/navigation';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug;
  const lang = params?.lang || 'uz';
  const { products, categories, isLoading } = useGlobalData();
  const router = useRouter();

  return (
    <div className="pt-24 pb-12">
      <FeaturedProducts products={products} categories={categories} activeCategory={String(slug)} onNavigateToProduct={(id) => router.push(`/${lang}/product/${id}`)} isLoading={isLoading} />
    </div>
  );
}
