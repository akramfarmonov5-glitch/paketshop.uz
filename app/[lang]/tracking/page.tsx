'use client';
import OrderTracker from '../../../components/OrderTracker';
import { useRouter } from 'next/navigation';

export default function TrackingPage() {
  const router = useRouter();
  return <OrderTracker onBack={() => router.push('/')} />;
}
