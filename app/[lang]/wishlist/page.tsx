'use client';
import Wishlist from '../../../components/Wishlist';
import { useRouter, useParams } from 'next/navigation';
import { productSlug } from '../../../lib/slugify';
import type { Product } from '../../../types';

export default function WishlistPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'uz';

  const handleNavigateToProduct = (product: Product) => {
    const activeLang = String(lang || 'uz');
    router.push(`/${activeLang}/product/${productSlug(product, activeLang)}`);
  };

  return <Wishlist onBack={() => router.push(`/${lang}`)} onNavigateToProduct={handleNavigateToProduct} />;
}
