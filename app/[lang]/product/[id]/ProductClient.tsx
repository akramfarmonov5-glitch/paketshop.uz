'use client';

import { useGlobalData } from '../../../../context/GlobalContext';
import ProductDetail from '../../../../components/ProductDetail';
import { useRouter } from 'next/navigation';
import { ProductDetailSkeleton } from '../../../../components/Skeleton';

export default function ProductClient({ id }: { id: string }) {
  const { products, categories, isLoading } = useGlobalData();
  const router = useRouter();

  if (isLoading) return <ProductDetailSkeleton />;
  
  const product = products.find(p => p.id === Number(id));
  
  if (!product) {
    return <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center text-center">Mahsulot topilmadi</div>;
  }

  return <ProductDetail product={product} allProducts={products} categories={categories} onProductSelect={(pid) => router.push('/product/' + pid)} onBack={() => router.push('/')} onCheckout={() => router.push('/checkout')} />;
}
