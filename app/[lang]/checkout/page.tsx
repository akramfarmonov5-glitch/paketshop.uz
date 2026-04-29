'use client';
import Checkout from '../../../components/Checkout';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  return <Checkout onBack={() => router.push('/')} />;
}
