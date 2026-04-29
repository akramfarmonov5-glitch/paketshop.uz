import fs from 'fs';
import path from 'path';

const pagesToCreate = {
  'app/product/[id]/page.tsx': `
'use client';
import { useGlobalData } from '../../../context/GlobalContext';
import ProductDetail from '../../../components/ProductDetail';
import { useParams, useRouter } from 'next/navigation';
import { ProductDetailSkeleton } from '../../../components/Skeleton';

export default function ProductPage() {
  const { id } = useParams();
  const { products, categories, isLoading } = useGlobalData();
  const router = useRouter();

  if (isLoading) return <ProductDetailSkeleton />;
  
  const product = products.find(p => p.id === Number(id));
  
  if (!product) {
    return <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center text-center">Mahsulot topilmadi</div>;
  }

  return <ProductDetail product={product} allProducts={products} categories={categories} onProductSelect={(id) => router.push('/product/' + id)} onBack={() => router.push('/')} onCheckout={() => router.push('/checkout')} />;
}
`,
  'app/category/[slug]/page.tsx': `
'use client';
import { useGlobalData } from '../../../context/GlobalContext';
import FeaturedProducts from '../../../components/FeaturedProducts';
import { useParams, useRouter } from 'next/navigation';

export default function CategoryPage() {
  const { slug } = useParams();
  const { products, categories, isLoading } = useGlobalData();
  const router = useRouter();

  return (
    <div className="pt-24 pb-12">
      <FeaturedProducts products={products} categories={categories} activeCategory={String(slug)} onNavigateToProduct={(id) => router.push('/product/' + id)} isLoading={isLoading} />
    </div>
  );
}
`,
  'app/blog/[id]/page.tsx': `
'use client';
import { useGlobalData } from '../../../context/GlobalContext';
import BlogPostDetail from '../../../components/BlogPostDetail';
import { useParams, useRouter } from 'next/navigation';

export default function BlogPostPage() {
  const { id } = useParams();
  const { blogPosts, isLoading } = useGlobalData();
  const router = useRouter();

  if (isLoading) return <div className="min-h-screen pt-24">Yuklanmoqda...</div>;
  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) return <div className="min-h-screen pt-24 text-center">Maqola topilmadi</div>;
  return <BlogPostDetail post={post} onBack={() => router.push('/')} />;
}
`,
  'app/checkout/page.tsx': `
'use client';
import Checkout from '../../components/Checkout';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  return <Checkout onBack={() => router.push('/')} />;
}
`,
  'app/wishlist/page.tsx': `
'use client';
import Wishlist from '../../components/Wishlist';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const router = useRouter();
  return <Wishlist onBack={() => router.push('/')} onNavigateToProduct={(id) => router.push('/product/' + id)} />;
}
`,
  'app/tracking/page.tsx': `
'use client';
import OrderTracker from '../../components/OrderTracker';
import { useRouter } from 'next/navigation';

export default function TrackingPage() {
  const router = useRouter();
  return <OrderTracker onBack={() => router.push('/')} />;
}
`,
  'app/profile/page.tsx': `
'use client';
import UserProfile from '../../components/UserProfile';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  return <UserProfile onBack={() => router.push('/')} onNavigateToProduct={(id) => router.push('/product/' + id)} />;
}
`,
  'app/admin/page.tsx': `
'use client';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLogin from '../../components/admin/AdminLogin';
import { useAuth } from '../../context/AuthContext';
import { useGlobalData } from '../../context/GlobalContext';
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
    import('../../lib/admin').then(({ isAdminUser }) => isAdminUser(user.id))
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
`
};

for (const [filePath, content] of Object.entries(pagesToCreate)) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log('Created: ' + filePath);
}
