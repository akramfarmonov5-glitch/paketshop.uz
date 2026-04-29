'use client';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminLogin from '../../../components/admin/AdminLogin';
import { useAuth } from '../../../context/AuthContext';
import { useGlobalData } from '../../../context/GlobalContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { products, setProducts, categories, setCategories, heroContent, setHeroContent, navigationSettings, setNavigationSettings, blogPosts, setBlogPosts } = useGlobalData();
  const router = useRouter();
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [isAdminChecking, setIsAdminChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdminChecking(false);
      return;
    }
    setIsAdminChecking(true);
    import('../../../lib/admin').then(({ isAdminUser }) => isAdminUser(user.id))
      .then(allowed => setIsAdminAuthorized(allowed))
      .catch(() => setIsAdminAuthorized(false))
      .finally(() => setIsAdminChecking(false));
  }, [user]);

  if (authLoading || isAdminChecking) return <div className="min-h-screen pt-24 text-center">Tekshirilmoqda...</div>;

  if (!user) return <AdminLogin onBack={() => router.push('/')} />;
  
  if (!isAdminAuthorized) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <h2>Sizda admin huquqi yo'q.</h2>
        <button onClick={() => { signOut(); router.push('/'); }}>Chiqish</button>
      </div>
    );
  }

  return <AdminLayout onLogout={async () => { await signOut(); router.push('/'); }} products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} heroContent={heroContent} setHeroContent={setHeroContent} navigationSettings={navigationSettings} setNavigationSettings={setNavigationSettings} blogPosts={blogPosts} setBlogPosts={setBlogPosts} />;
}
