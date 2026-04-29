'use client';
import Wishlist from '../../../components/Wishlist';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const router = useRouter();
  return <Wishlist onBack={() => router.push('/')} onNavigateToProduct={(id) => router.push('/product/' + id)} />;
}
