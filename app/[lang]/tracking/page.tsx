'use client';
import OrderTracker from '../../../components/OrderTracker';
import { useParams, useRouter } from 'next/navigation';

export default function TrackingPage() {
  const router = useRouter();
  const params = useParams();
  const lang = String(params?.lang || 'uz');

  return <OrderTracker onBack={() => router.push(`/${lang}`)} />;
}
