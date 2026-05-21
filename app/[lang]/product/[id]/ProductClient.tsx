'use client';

import { useGlobalData } from '../../../../context/GlobalContext';
import ProductDetail from '../../../../components/ProductDetail';
import { useRouter, useParams } from 'next/navigation';
import { ProductDetailSkeleton } from '../../../../components/Skeleton';
import { productSlug } from '../../../../lib/slugify';
import { Product, Category } from '../../../../types';

interface ProductClientProps {
  id: string;
  initialProducts?: Product[];
  initialCategories?: Category[];
}

export default function ProductClient({ id, initialProducts, initialCategories }: ProductClientProps) {
  const globalData = useGlobalData();
  const products = initialProducts || globalData.products;
  const categories = initialCategories || globalData.categories;
  const isLoading = initialProducts ? false : globalData.isLoading;
  
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'uz';

  if (isLoading) return <ProductDetailSkeleton />;
  
  let productId = id;
  if (isNaN(Number(id)) && id.includes('-')) {
    const parts = id.split('-');
    productId = parts[parts.length - 1];
  }

  const product = products.find(p => p.id === Number(productId));
  
  if (!product) {
    return <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center text-center">Mahsulot topilmadi</div>;
  }

  const handleProductSelect = (pid: number) => {
    const targetProduct = products.find(p => p.id === pid);
    if (targetProduct) {
      const activeLang = String(lang || 'uz');
      router.push(`/${activeLang}/product/${productSlug(targetProduct, activeLang)}`);
    } else {
      router.push(`/${lang}/product/${pid}`);
    }
  };

  return <ProductDetail product={product} allProducts={products} categories={categories} onProductSelect={handleProductSelect} onBack={() => router.push(`/${lang}`)} onCheckout={() => router.push(`/${lang}/checkout`)} />;
}
