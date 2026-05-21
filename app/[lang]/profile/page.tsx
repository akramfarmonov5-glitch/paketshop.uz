'use client';
import UserProfile from '../../../components/UserProfile';
import { useRouter, useParams } from 'next/navigation';
import { useGlobalData } from '../../../context/GlobalContext';
import { productSlug } from '../../../lib/slugify';

export default function ProfilePage() {
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

  return <UserProfile onBack={() => router.push(`/${lang}`)} onNavigateToProduct={handleNavigateToProduct} />;
}
