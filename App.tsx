import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import CategoryGrid from './components/CategoryGrid';
import Footer from './components/Footer';
import TrustBadges from './components/TrustBadges';
import Testimonials from './components/Testimonials';
import PromoBanner from './components/PromoBanner';
import CartSidebar from './components/CartSidebar';
import MobileNav from './components/MobileNav';
import BlogGrid from './components/BlogGrid';
import MetaPixel from './components/MetaPixel';
import SEOHead from './components/SEOHead';
import InstallPWA from './components/InstallPWA';

// Lazy loaded components (Code Splitting & Performance Optimization)
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const Checkout = lazy(() => import('./components/Checkout'));
const AIChatAssistant = lazy(() => import('./components/AIChatAssistant'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const OrderTracker = lazy(() => import('./components/OrderTracker'));
const BlogPostDetail = lazy(() => import('./components/BlogPostDetail'));
const Wishlist = lazy(() => import('./components/Wishlist'));
const SearchModal = lazy(() => import('./components/SearchModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const UserProfile = lazy(() => import('./components/UserProfile'));
import { useAuth } from './context/AuthContext';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, DEFAULT_HERO_CONTENT, DEFAULT_NAVIGATION } from './constants';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { hasSupabaseCredentials, supabase } from './lib/supabaseClient';
import { Product, Category, HeroContent, NavigationSettings, BlogPost } from './types';
import { productSlug, getIdFromSlug, blogSlug, getBlogIdFromSlug, slugify } from './lib/slugify';
import { getLocalizedText } from './lib/i18nUtils';
import { ProductDetailSkeleton } from './components/Skeleton';
import * as fpixel from './lib/fpixel';

const BASE_URL = 'https://paketshop.uz';

type Route =
  | { name: 'HOME' }
  | { name: 'PRODUCT'; productId: number }
  | { name: 'CATEGORY'; categorySlug: string }
  | { name: 'CHECKOUT' }
  | { name: 'ADMIN' }
  | { name: 'TRACKING' }
  | { name: 'WISHLIST' }
  | { name: 'PROFILE' }
  | { name: 'BLOG_POST'; postId: number };

/**
 * URL dan Route aniqlash
 */
function parseRouteFromURL(): Route {
  const path = window.location.pathname;

  // /product/midnight-chronograph-1
  if (path.startsWith('/product/')) {
    const slug = path.replace('/product/', '');
    const id = getIdFromSlug(slug);
    if (id !== null) return { name: 'PRODUCT', productId: id };
  }

  // /blog/premium-soatlar-2026-yilgi-trendi-1
  if (path.startsWith('/blog/')) {
    const slug = path.replace('/blog/', '');
    const id = getBlogIdFromSlug(slug);
    if (id !== null) return { name: 'BLOG_POST', postId: id };
  }

  // /category/soatlar
  if (path.startsWith('/category/')) {
    const slug = path.replace('/category/', '');
    return { name: 'CATEGORY', categorySlug: slug };
  }

  if (path === '/checkout') return { name: 'CHECKOUT' };
  if (path === '/admin') return { name: 'ADMIN' };
  if (path === '/tracking') return { name: 'TRACKING' };
  if (path === '/wishlist') return { name: 'WISHLIST' };
  if (path === '/profile') return { name: 'PROFILE' };

  return { name: 'HOME' };
}

/**
 * Route dan URL yaratish
 */
function routeToURL(route: Route, products: Product[], blogPosts: BlogPost[]): string {
  switch (route.name) {
    case 'HOME':
      return '/';
    case 'PRODUCT': {
      const product = products.find(p => p.id === route.productId);
      return product ? `/product/${productSlug(product)}` : '/';
    }
    case 'BLOG_POST': {
      const post = blogPosts.find(p => p.id === route.postId);
      return post ? `/blog/${blogSlug(post)}` : '/';
    }
    case 'CATEGORY':
      return `/category/${route.categorySlug}`;
    case 'CHECKOUT':
      return '/checkout';
    case 'ADMIN':
      return '/admin';
    case 'TRACKING':
      return '/tracking';
    case 'WISHLIST':
      return '/wishlist';
    case 'PROFILE':
      return '/profile';
    default:
      return '/';
  }
}

const PageLoader = () => (
  <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-gray-500">Yuklanmoqda...</p>
  </div>
);

const AdminAccessDenied: React.FC<{
  onBack: () => void;
  onSignOut: () => Promise<void>;
}> = ({ onBack, onSignOut }) => (
  <div className="min-h-screen bg-black flex items-center justify-center p-4">
    <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center">
      <h2 className="text-2xl font-bold text-white mb-3">Admin ruxsati topilmadi</h2>
      <p className="text-gray-400 text-sm mb-8">
        Bu akkaunt tizimga kirgan, lekin admin paneldan foydalanish uchun `admin_users`
        jadvalida ruxsat berilmagan.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
        >
          Bosh sahifaga qaytish
        </button>
        <button
          onClick={onSignOut}
          className="flex-1 px-4 py-3 rounded-xl bg-gold-400 text-black font-bold hover:bg-gold-500 transition-colors"
        >
          Chiqish
        </button>
      </div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>(parseRouteFromURL);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [navigationSettings, setNavigationSettings] = useState<NavigationSettings>(DEFAULT_NAVIGATION);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: 1,
      title: '2026-yilgi Premium Soatlar Trendi',
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop',
      content: 'Bu yil minimalizm va retro uslubining qaytishi kuzatilmoqda. Hashamatli brendlar yupqa korpuslar va klassik dizaynlarga urg\'u bermoqda. Ranglar palitrasi ko\'proq to\'q ko\'k, yashil va metall tuslarda namoyon bo\'lmoqda.\n\nShuningdek, mexanik soatlar yana urfga kirmoqda. Raqamli texnologiyalar davrida klassik mexanika o\'zining qadrini yo\'qotgani yo\'q, aksincha, haqiqiy san\'at asari sifatida qadrlanmoqda.',
      seo: { title: 'Premium Soatlar 2026', description: 'Eng so\'nggi soat modasi haqida bilib oling.', keywords: ['soat', 'moda', '2026'] },
      date: '2025-05-10'
    },
    {
      id: 2,
      title: 'Charm Sumkalar: Sifat va Uslub',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
      content: 'Haqiqiy charm sumka nafaqat aksessuar, balki investitsiyadir. Italiya charm maktabining an\'analari zamonaviy texnologiyalar bilan uyg\'unlashib, uzoq yillar xizmat qiladigan san\'at asarlarini yaratmoqda.\n\nSifatli charm vaqt o\'tishi bilan yanada chiroyli tusga kiradi. Bu mavsumda katta o\'lchamli va funksional sumkalar trendda.',
      seo: { title: 'Charm Sumkalar 2026', description: 'Sifatli sumka tanlash sirlari.', keywords: ['sumka', 'charm', 'italiya'] },
      date: '2025-05-12'
    }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [isAdminChecking, setIsAdminChecking] = useState(false);
  const { toggleCart } = useCart();

  // === URL Routing ===
  const navigate = useCallback((route: Route, replace = false) => {
    setCurrentRoute(route);
    const url = routeToURL(route, products, blogPosts);
    if (replace) {
      window.history.replaceState({ route }, '', url);
    } else {
      window.history.pushState({ route }, '', url);
    }
    if (route.name !== 'ADMIN') {
      window.scrollTo(0, 0);
    }
  }, [products, blogPosts]);

  // Browser back/forward tugmalari
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseRouteFromURL());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Birinchi yuklashda URL ni tozalash (agar kerak bo'lsa)
  useEffect(() => {
    const url = routeToURL(currentRoute, products, blogPosts);
    window.history.replaceState({ route: currentRoute }, '', url);
  }, [products, blogPosts]); // products/blogPosts yuklanganidan keyin URL ni to'g'rilash

  useEffect(() => {
    let cancelled = false;

    if (currentRoute.name !== 'ADMIN') {
      setIsAdminChecking(false);
      return () => {
        cancelled = true;
      };
    }

    if (!user) {
      setIsAdminAuthorized(false);
      setIsAdminChecking(false);
      return () => {
        cancelled = true;
      };
    }

    setIsAdminChecking(true);

    import('./lib/admin')
      .then(({ isAdminUser }) => isAdminUser(user.id))
      .then((allowed) => {
        if (!cancelled) {
          setIsAdminAuthorized(allowed);
        }
      })
      .catch((error) => {
        console.error('Admin access check failed:', error);
        if (!cancelled) {
          setIsAdminAuthorized(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsAdminChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentRoute.name, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!hasSupabaseCredentials) {
          console.warn("Supabase credentials missing, using mock data.");
          setProducts(MOCK_PRODUCTS);
          setCategories(MOCK_CATEGORIES);
          setIsLoading(false);
          return;
        }

        // Fetch products
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*');

        if (productError) throw productError;

        if (productData && productData.length > 0) {
          const mappedProducts = productData.map(p => ({
            ...p,
            formattedPrice: new Intl.NumberFormat('uz-UZ').format(Number(p.price)) + ' UZS',
            shortDescription: p.description || '',
            specs: p.specifications || [],
            videoUrl: p.videoUrl || ''
          }));
          setProducts(mappedProducts as Product[]);
        } else {
          setProducts(MOCK_PRODUCTS);
        }

        // Fetch categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*');

        if (categoryError) throw categoryError;

        if (categoryData && categoryData.length > 0) {
          const mappedCategories = categoryData.map(c => ({
            ...c,
            slug: slugify(c.name)
          }));
          setCategories(mappedCategories as Category[]);
        } else {
          setCategories(MOCK_CATEGORIES);
        }

        // Fetch hero content (independent - won't crash other fetches)
        try {
          const { data: heroData } = await supabase
            .from('hero_content')
            .select('*')
            .single();
          if (heroData && (heroData.badge || heroData.title)) {
            setHeroContent({
              badge: heroData.badge || 'Yangi Mavsum',
              title: heroData.title || 'Premium Collection 2026',
              description: heroData.description || '',
              buttonText: heroData.buttonText || heroData.button_text || 'Sotib olish',
              images: heroData.images || [],
            });
          }
        } catch (e) {
          console.warn('Hero content fetch failed, using defaults:', e);
        }

        // Fetch blog posts (independent)
        try {
          const { data: blogData } = await supabase
            .from('blog_posts')
            .select('*')
            .order('date', { ascending: false });
          if (blogData && blogData.length > 0) {
            const mappedPosts = blogData.map((post) => ({
              ...post,
              seo: post.seo || {
                title: post.seo_title || post.title,
                description: post.seo_description || post.content?.substring(0, 160) || '',
                keywords: post.seo_keywords || [],
              },
            }));
            setBlogPosts(mappedPosts as BlogPost[]);
          }
        } catch (e) {
          console.warn('Blog posts fetch failed, using defaults:', e);
        }

        // Fetch navigation settings (independent)
        try {
          const { data: navData } = await supabase
            .from('navigation_settings')
            .select('*')
            .single();
          if (navData) {
            setNavigationSettings({
              menuItems: navData.menuItems || navData.menu_items || [],
              socialLinks: navData.socialLinks || navData.social_links || [],
            });
          }
        } catch (e) {
          console.warn('Navigation settings fetch failed, using defaults:', e);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const navigateToHome = () => navigate({ name: 'HOME' });
  const navigateToProduct = (id: number) => navigate({ name: 'PRODUCT', productId: id });
  const navigateToCheckout = () => navigate({ name: 'CHECKOUT' });
  const navigateToAdmin = () => navigate({ name: 'ADMIN' });
  const navigateToTracking = () => navigate({ name: 'TRACKING' });
  const navigateToWishlist = () => navigate({ name: 'WISHLIST' });
  const navigateToBlogPost = (id: number) => navigate({ name: 'BLOG_POST', postId: id });

  const [activeCategory, setActiveCategory] = useState<string>('All');

  // CATEGORY route uchun activeCategory ni useEffect orqali o'rnatish (render ichida setState oldini olish)
  useEffect(() => {
    if (currentRoute.name === 'CATEGORY') {
      const cat = categories.find(c => slugify(getLocalizedText(c.name, 'uz')) === currentRoute.categorySlug || c.slug === currentRoute.categorySlug);
      if (cat && activeCategory !== getLocalizedText(cat.name, 'uz')) {
        setActiveCategory(getLocalizedText(cat.name, 'uz'));
      }
    }
  }, [currentRoute, categories]);

  const handleCategorySelect = (categoryName: string) => {
    setActiveCategory(categoryName);
    fpixel.trackViewCategory(categoryName);
    // Agar boshqa sahifada bo'lsa, bosh sahifaga qaytib keyin kategoriyaga scroll
    if (currentRoute.name !== 'HOME') {
      navigate({ name: 'HOME' });
      setTimeout(() => {
        const element = document.getElementById('featured-products');
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150);
    } else {
      const element = document.getElementById('featured-products');
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const handleProfileClick = () => {
    if (user) {
      navigate({ name: 'PROFILE' });
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAdminLogout = async () => {
    setIsAdminAuthorized(false);
    await signOut();
    navigateToHome();
  };

  // === SEO Meta Generation ===
  const renderSEO = () => {
    if (currentRoute.name === 'PRODUCT') {
      const product = products.find(p => p.id === currentRoute.productId);
      if (product) {
        const slug = productSlug(product);
        return (
          <SEOHead
            title={`${getLocalizedText(product.name, 'uz')} - ${getLocalizedText(product.category, 'uz')} sotib olish`}
            description={`${getLocalizedText(product.name, 'uz')} - ${getLocalizedText(product.shortDescription, 'uz')}. Narxi: ${product.formattedPrice}. PaketShop.uz dan buyurtma bering. Bepul yetkazib berish!`}
            keywords={[getLocalizedText(product.name, 'uz'), getLocalizedText(product.category, 'uz'), 'sotib olish', 'narxi', 'PaketShop', 'online shop', 'uzbekistan']}
            canonical={`${BASE_URL}/product/${slug}`}
            ogImage={product.image}
            ogType="product"
            product={product}
            breadcrumbs={[
              { name: 'Bosh sahifa', url: BASE_URL },
              { name: getLocalizedText(product.category, 'uz'), url: `${BASE_URL}/category/${slugify(getLocalizedText(product.category, 'uz'))}` },
              { name: getLocalizedText(product.name, 'uz'), url: `${BASE_URL}/product/${slug}` }
            ]}
          />
        );
      }
    }

    if (currentRoute.name === 'BLOG_POST') {
      const post = blogPosts.find(p => p.id === currentRoute.postId);
      if (post) {
        const slug = blogSlug(post);
        return (
          <SEOHead
            title={getLocalizedText(post.seo?.title, 'uz') || getLocalizedText(post.title, 'uz')}
            description={getLocalizedText(post.seo?.description, 'uz') || getLocalizedText(post.content, 'uz').substring(0, 160)}
            keywords={getLocalizedText(post.seo?.keywords, 'uz')?.split(',').map(s=>s.trim()) || [getLocalizedText(post.title, 'uz'), 'blog', 'PaketShop']}
            canonical={`${BASE_URL}/blog/${slug}`}
            ogImage={post.image}
            ogType="article"
            blogPost={post}
            breadcrumbs={[
              { name: 'Bosh sahifa', url: BASE_URL },
              { name: 'Blog', url: `${BASE_URL}/` },
              { name: getLocalizedText(post.title, 'uz'), url: `${BASE_URL}/blog/${slug}` }
            ]}
          />
        );
      }
    }

    if (currentRoute.name === 'CATEGORY') {
      const cat = categories.find(c => slugify(getLocalizedText(c.name, 'uz')) === currentRoute.categorySlug || c.slug === currentRoute.categorySlug);
      if (cat) {
        return (
          <SEOHead
            title={`${getLocalizedText(cat.name, 'uz')} - Online Sotib Olish`}
            description={getLocalizedText(cat.description, 'uz') || `${getLocalizedText(cat.name, 'uz')} kategoriyasidagi sifatli mahsulotlar. PaketShop.uz dan buyurtma bering!`}
            keywords={[getLocalizedText(cat.name, 'uz'), 'sotib olish', 'narxi', 'PaketShop', 'uzbekistan']}
            canonical={`${BASE_URL}/category/${cat.slug}`}
            ogImage={cat.image}
            category={cat}
            breadcrumbs={[
              { name: 'Bosh sahifa', url: BASE_URL },
              { name: getLocalizedText(cat.name, 'uz'), url: `${BASE_URL}/category/${cat.slug}` }
            ]}
          />
        );
      }
    }

    if (currentRoute.name === 'WISHLIST') {
      return (
        <SEOHead
          title="Sevimlilar"
          description="Sizning sevimli mahsulotlaringiz ro'yxati. PaketShop.uz"
          canonical={`${BASE_URL}/wishlist`}
          noindex={true}
        />
      );
    }

    if (currentRoute.name === 'CHECKOUT') {
      return (
        <SEOHead
          title="Buyurtma berish"
          description="PaketShop.uz dan xavfsiz buyurtma bering."
          canonical={`${BASE_URL}/checkout`}
          noindex={true}
        />
      );
    }

    if (currentRoute.name === 'TRACKING') {
      return (
        <SEOHead
          title="Buyurtmani kuzatish"
          description="Buyurtmangiz holatini kuzating. PaketShop.uz"
          canonical={`${BASE_URL}/tracking`}
          noindex={true}
        />
      );
    }

    if (currentRoute.name === 'PROFILE') {
      return (
        <SEOHead
          title="Mening Profilim"
          description="Foydalanuvchi profili. PaketShop.uz"
          canonical={`${BASE_URL}/profile`}
          noindex={true}
        />
      );
    }

    if (currentRoute.name === 'ADMIN') {
      return <SEOHead title="Admin Panel" noindex={true} />;
    }

    // HOME sahifasi uchun default meta taglar (index.html dan keladi)
    return (
      <SEOHead
        title="Online Do'kon - O'zbekistondagi Sifatli Mahsulotlar"
        description="PaketShop.uz - O'zbekistondagi ishonchli onlayn do'kon. Soatlar, sumkalar, parfyumeriya va boshqa sifatli mahsulotlar. Yuqori sifat va qulay narxlar. Bepul yetkazib berish!"
        keywords={['online shop', 'paketshop', 'soatlar', 'sumkalar', 'parfyumeriya', 'online shop uzbekistan', 'sifatli mahsulotlar', 'narxlari', 'sotib olish']}
        canonical={`${BASE_URL}/`}
      />
    );
  };

  const renderContent = () => {
    if (currentRoute.name === 'ADMIN') {
      if (authLoading || isAdminChecking) {
        return <PageLoader />;
      }

      if (!user) {
        return (
          <AdminLogin
            onBack={navigateToHome}
          />
        );
      }

      if (!isAdminAuthorized) {
        return (
          <AdminAccessDenied
            onBack={navigateToHome}
            onSignOut={handleAdminLogout}
          />
        );
      }

      return (
        <AdminLayout
          onLogout={handleAdminLogout}
          products={products}
          setProducts={setProducts}
          categories={categories}
          setCategories={setCategories}
          heroContent={heroContent}
          setHeroContent={setHeroContent}
          navigationSettings={navigationSettings}
          setNavigationSettings={setNavigationSettings}
          blogPosts={blogPosts}
          setBlogPosts={setBlogPosts}
        />
      );
    }

    if (currentRoute.name === 'CHECKOUT') {
      return <Checkout onBack={navigateToHome} />;
    }

    if (currentRoute.name === 'TRACKING') {
      return <OrderTracker onBack={navigateToHome} />;
    }

    if (currentRoute.name === 'PROFILE') {
      return <UserProfile onBack={navigateToHome} onNavigateToProduct={navigateToProduct} />;
    }

    if (currentRoute.name === 'WISHLIST') {
      return <Wishlist onBack={navigateToHome} onNavigateToProduct={navigateToProduct} />;
    }

    if (currentRoute.name === 'PRODUCT') {
      if (isLoading) {
        return <ProductDetailSkeleton />;
      }
      const product = products.find(p => p.id === currentRoute.productId);
      if (product) {
        return (
          <ProductDetail
            product={product}
            allProducts={products}
            onProductSelect={navigateToProduct}
            onBack={navigateToHome}
            onCheckout={navigateToCheckout}
          />
        );
      }
      // 404 — Mahsulot topilmadi
      return (
        <div className={`min-h-screen pt-24 pb-12 flex flex-col items-center justify-center text-center px-6 ${isDark ? 'bg-black' : 'bg-light-bg'}`}>
          <div className={`text-6xl mb-4`}>📦</div>
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-light-text'}`}>Mahsulot topilmadi</h2>
          <p className={`mb-8 max-w-md ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>Kechirasiz, siz qidirayotgan mahsulot mavjud emas yoki o'chirilgan bo'lishi mumkin.</p>
          <button onClick={navigateToHome} className="px-8 py-3 bg-gold-400 text-black font-bold rounded-full hover:bg-gold-500 transition-colors">Bosh sahifaga qaytish</button>
        </div>
      );
    }

    if (currentRoute.name === 'BLOG_POST') {
      const post = blogPosts.find(p => p.id === currentRoute.postId);
      if (post) {
        return <BlogPostDetail post={post} onBack={navigateToHome} />;
      }
      // 404 — Blog post topilmadi
      return (
        <div className={`min-h-screen pt-24 pb-12 flex flex-col items-center justify-center text-center px-6 ${isDark ? 'bg-black' : 'bg-light-bg'}`}>
          <div className={`text-6xl mb-4`}>📝</div>
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-light-text'}`}>Maqola topilmadi</h2>
          <p className={`mb-8 max-w-md ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>Kechirasiz, siz qidirayotgan blog maqolasi mavjud emas.</p>
          <button onClick={navigateToHome} className="px-8 py-3 bg-gold-400 text-black font-bold rounded-full hover:bg-gold-500 transition-colors">Bosh sahifaga qaytish</button>
        </div>
      );
    }

    return (
      <main className="pb-20">
        <Hero content={heroContent} />
        <TrustBadges />
        <CategoryGrid
          categories={categories}
          onSelectCategory={handleCategorySelect}
          isLoading={isLoading}
        />
        <PromoBanner />
        <FeaturedProducts
          products={products}
          categories={categories}
          activeCategory={activeCategory}
          onNavigateToProduct={navigateToProduct}
          isLoading={isLoading}
        />
        <Testimonials />
        <BlogGrid posts={blogPosts} onPostClick={navigateToBlogPost} isLoading={isLoading} />
      </main>
    );
  };

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen font-sans selection:bg-gold-400 selection:text-black transition-colors duration-300 ${isDark ? 'dark bg-black text-white' : 'light bg-light-bg text-light-text'}`}>
      {renderSEO()}
      <MetaPixel />
      {currentRoute.name !== 'CHECKOUT' && currentRoute.name !== 'ADMIN' && currentRoute.name !== 'TRACKING' && (
        <Navbar
          onNavigateHome={navigateToHome}
          navigationSettings={navigationSettings}
          onProfileClick={handleProfileClick}
          onSearchClick={() => setIsSearchOpen(true)}
          onWishlistClick={navigateToWishlist}
          onTrackingClick={navigateToTracking}
        />
      )}

      <Suspense fallback={<PageLoader />}>
        {renderContent()}
      </Suspense>

      {currentRoute.name !== 'ADMIN' && <CartSidebar onCheckout={navigateToCheckout} />}

      {currentRoute.name !== 'CHECKOUT' && currentRoute.name !== 'ADMIN' && currentRoute.name !== 'TRACKING' && (
        <MobileNav
          onNavigateHome={navigateToHome}
          onCartClick={toggleCart}
          onSearchClick={() => setIsSearchOpen(true)}
          onProfileClick={handleProfileClick}
          onWishlistClick={navigateToWishlist}
        />
      )}

      <Suspense fallback={null}>
        <AIChatAssistant products={products} />
      </Suspense>

      <Suspense fallback={null}>
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          products={products}
          categories={categories}
          onNavigateToProduct={navigateToProduct}
        />
      </Suspense>

      {currentRoute.name !== 'CHECKOUT' && currentRoute.name !== 'ADMIN' && currentRoute.name !== 'TRACKING' && currentRoute.name !== 'BLOG_POST' && currentRoute.name !== 'WISHLIST' && (
        <Footer onAdminClick={navigateToAdmin} />
      )}

      <Suspense fallback={null}>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </Suspense>
      <InstallPWA />
    </div>
  );
};

// LanguageProvider import moved to top of file

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ToastProvider>
          <WishlistProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
