'use client';
import { useCallback } from 'react';
import UserProfile from '../../../components/UserProfile';
import { useRouter, useParams } from 'next/navigation';
import { useGlobalData } from '../../../context/GlobalContext';
import { productSlug } from '../../../lib/slugify';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'uz';
  const { products } = useGlobalData();

  const handleNavigateToProduct = useCallback((id: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const activeLang = String(lang || 'uz');
      router.push(`/${activeLang}/product/${productSlug(product, activeLang)}`);
    } else {
      router.push(`/${lang}/product/${id}`);
    }
  }, [lang, products, router]);
  const handleBack = useCallback(() => router.push(`/${lang}`), [lang, router]);

  return <UserProfile onBack={handleBack} onNavigateToProduct={handleNavigateToProduct} />;
}
