'use client';
import Wishlist from '../../../components/Wishlist';
import { useRouter, useParams } from 'next/navigation';
import { useGlobalData } from '../../../context/GlobalContext';
import { productSlug } from '../../../lib/slugify';

export default function WishlistPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'uz';
  const { products } = useGlobalData();

  const handleNavigateToProduct = (id: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const activeLang = String(lang || 'uz');
      router.push(`/${activeLang}/product/${productSlug(product, activeLang)}`);
    } else {
      router.push(`/${lang}/product/${id}`);
    }
  };

  return <Wishlist onBack={() => router.push(`/${lang}`)} onNavigateToProduct={handleNavigateToProduct} />;
}
