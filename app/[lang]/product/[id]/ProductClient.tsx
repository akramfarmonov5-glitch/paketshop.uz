'use client';

import { useGlobalData } from '../../../../context/GlobalContext';
import ProductDetail from '../../../../components/ProductDetail';
import { useRouter, useParams } from 'next/navigation';
import { ProductDetailSkeleton } from '../../../../components/Skeleton';

export default function ProductClient({ id }: { id: string }) {
  const { products, categories, isLoading } = useGlobalData();
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

  return <ProductDetail product={product} allProducts={products} categories={categories} onProductSelect={(pid) => router.push(`/${lang}/product/${pid}`)} onBack={() => router.push(`/${lang}`)} onCheckout={() => router.push(`/${lang}/checkout`)} />;
}
