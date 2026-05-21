'use client';
import Checkout from '../../../components/Checkout';
import { useParams, useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const lang = String(params?.lang || 'uz');

  return <Checkout onBack={() => router.push(`/${lang}`)} />;
}
