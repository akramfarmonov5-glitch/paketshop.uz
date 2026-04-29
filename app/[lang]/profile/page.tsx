'use client';
import UserProfile from '../../../components/UserProfile';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  return <UserProfile onBack={() => router.push('/')} onNavigateToProduct={(id) => router.push('/product/' + id)} />;
}
