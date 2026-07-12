'use client';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminLogin from '../../../components/admin/AdminLogin';
import { useGlobalData } from '../../../context/GlobalContext';
import { useParams, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { products, setProducts, categories, setCategories, heroContent, setHeroContent, navigationSettings, setNavigationSettings, blogPosts, setBlogPosts } = useGlobalData();
  const router = useRouter();
  const params = useParams();
  const lang = String(params?.lang || 'uz');
  const homePath = `/${lang}`;
  const isAdminAuthorized = Boolean(session?.user?.roles?.some((role) => ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'SALES_MANAGER', 'WAREHOUSE_VIEWER'].includes(role)));
  if (status === 'loading') return <div className="min-h-screen pt-24 text-center">Tekshirilmoqda...</div>;

  if (!session?.user) return <AdminLogin onBack={() => router.push(homePath)} />;
  
  if (!isAdminAuthorized) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <h2>Sizda admin huquqi yo'q.</h2>
        <button onClick={() => signOut({ callbackUrl: homePath })}>Chiqish</button>
      </div>
    );
  }

  return <AdminLayout onLogout={async () => { await signOut({ callbackUrl: homePath }); }} products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} heroContent={heroContent} setHeroContent={setHeroContent} navigationSettings={navigationSettings} setNavigationSettings={setNavigationSettings} blogPosts={blogPosts} setBlogPosts={setBlogPosts} />;
}
