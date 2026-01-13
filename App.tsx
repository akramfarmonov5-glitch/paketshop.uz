import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import CategoryGrid from './components/CategoryGrid';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import CartSidebar from './components/CartSidebar';
import Checkout from './components/Checkout';
import AIChatAssistant from './components/AIChatAssistant';
import MobileNav from './components/MobileNav';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './components/admin/AdminLogin';
import OrderTracker from './components/OrderTracker';
import BlogGrid from './components/BlogGrid';
import BlogPostDetail from './components/BlogPostDetail';
import Wishlist from './components/Wishlist';
import MetaPixel from './components/MetaPixel';
import SearchModal from './components/SearchModal';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, DEFAULT_HERO_CONTENT, DEFAULT_NAVIGATION } from './constants';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { supabase } from './lib/supabaseClient';
import { Product, Category, HeroContent, NavigationSettings, BlogPost } from './types';

type Route =
  | { name: 'HOME' }
  | { name: 'PRODUCT', productId: number }
  | { name: 'CHECKOUT' }
  | { name: 'ADMIN' }
  | { name: 'TRACKING' }
  | { name: 'WISHLIST' }
  | { name: 'BLOG_POST', postId: string };

const AppContent: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>({ name: 'HOME' });
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [navigationSettings, setNavigationSettings] = useState<NavigationSettings>(DEFAULT_NAVIGATION);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: '2026-yilgi Premium Soatlar Trendi',
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop',
      content: 'Bu yil minimalizm va retro uslubining qaytishi kuzatilmoqda. Hashamatli brendlar yupqa korpuslar va klassik dizaynlarga urg\'u bermoqda. Ranglar palitrasi ko\'proq to\'q ko\'k, yashil va metall tuslarda namoyon bo\'lmoqda.\n\nShuningdek, mexanik soatlar yana urfga kirmoqda. Raqamli texnologiyalar davrida klassik mexanika o\'zining qadrini yo\'qotgani yo\'q, aksincha, haqiqiy san\'at asari sifatida qadrlanmoqda.',
      seo: { title: 'Premium Soatlar 2026', description: 'Eng so\'nggi soat modasi haqida bilib oling.', keywords: ['soat', 'moda', '2026'] },
      date: '2025-05-10'
    },
    {
      id: '2',
      title: 'Charm Sumkalar: Sifat va Uslub',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
      content: 'Haqiqiy charm sumka nafaqat aksessuar, balki investitsiyadir. Italiya charm maktabining an\'analari zamonaviy texnologiyalar bilan uyg\'unlashib, uzoq yillar xizmat qiladigan san\'at asarlarini yaratmoqda.\n\nSifatli charm vaqt o\'tishi bilan yanada chiroyli tusga kiradi. Bu mavsumda katta o\'lchamli va funksional sumkalar trendda.',
      seo: { title: 'Charm Sumkalar 2026', description: 'Sifatli sumka tanlash sirlari.', keywords: ['sumka', 'charm', 'italiya'] },
      date: '2025-05-12'
    }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const { toggleCart } = useCart();

  useEffect(() => {
    const adminSession = localStorage.getItem('paketshop_admin_session');
    if (adminSession === 'active') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const env = import.meta.env || {};
        if (!env.VITE_SUPABASE_URL) {
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
          setProducts(productData as Product[]);
        } else {
          setProducts(MOCK_PRODUCTS);
        }

        // Fetch categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*');

        if (categoryError) throw categoryError;

        if (categoryData && categoryData.length > 0) {
          setCategories(categoryData as Category[]);
        } else {
          setCategories(MOCK_CATEGORIES);
        }

        // Fetch hero content
        const { data: heroData } = await supabase
          .from('hero_content')
          .select('*')
          .single();

        if (heroData) {
          setHeroContent(heroData as HeroContent);
        }

        // Fetch blog posts
        const { data: blogData } = await supabase
          .from('blog_posts')
          .select('*')
          .order('date', { ascending: false });

        if (blogData && blogData.length > 0) {
          setBlogPosts(blogData as BlogPost[]);
        }

        // Fetch navigation settings
        const { data: navData } = await supabase
          .from('navigation_settings')
          .select('*')
          .single();

        if (navData) {
          setNavigationSettings(navData as NavigationSettings);
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

  const navigateToHome = () => {
    setCurrentRoute({ name: 'HOME' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProduct = (id: number) => {
    setCurrentRoute({ name: 'PRODUCT', productId: id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCheckout = () => {
    setCurrentRoute({ name: 'CHECKOUT' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    setCurrentRoute({ name: 'ADMIN' });
  };

  const navigateToTracking = () => {
    setCurrentRoute({ name: 'TRACKING' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToWishlist = () => {
    setCurrentRoute({ name: 'WISHLIST' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBlogPost = (id: string) => {
    setCurrentRoute({ name: 'BLOG_POST', postId: id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (categoryName: string) => {
    const element = document.getElementById('featured-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('paketshop_admin_session', 'active');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('paketshop_admin_session');
    navigateToHome();
  };

  const renderContent = () => {
    if (currentRoute.name === 'ADMIN') {
      if (!isAdminAuthenticated) {
        return (
          <AdminLogin
            onLogin={handleAdminLogin}
            onBack={navigateToHome}
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

    if (currentRoute.name === 'WISHLIST') {
      return <Wishlist onBack={navigateToHome} onNavigateToProduct={navigateToProduct} />;
    }

    if (currentRoute.name === 'PRODUCT') {
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
    }

    if (currentRoute.name === 'BLOG_POST') {
      const post = blogPosts.find(p => p.id === currentRoute.postId);
      if (post) {
        return <BlogPostDetail post={post} onBack={navigateToHome} />;
      }
    }

    return (
      <main className="pb-20">
        <Hero content={heroContent} />
        <CategoryGrid
          categories={categories}
          onSelectCategory={handleCategorySelect}
        />
        <FeaturedProducts
          products={products}
          categories={categories}
          onNavigateToProduct={navigateToProduct}
          isLoading={isLoading}
        />
        <BlogGrid posts={blogPosts} onPostClick={navigateToBlogPost} />
      </main>
    );
  };

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen font-sans selection:bg-gold-400 selection:text-black transition-colors duration-300 ${isDark ? 'dark bg-black text-white' : 'light bg-light-bg text-light-text'}`}>
      <MetaPixel />
      {currentRoute.name !== 'CHECKOUT' && currentRoute.name !== 'ADMIN' && currentRoute.name !== 'TRACKING' && (
        <Navbar
          onNavigateHome={navigateToHome}
          navigationSettings={navigationSettings}
          onProfileClick={navigateToTracking}
          onSearchClick={() => setIsSearchOpen(true)}
          onWishlistClick={navigateToWishlist}
        />
      )}

      {renderContent()}

      {currentRoute.name !== 'ADMIN' && <CartSidebar onCheckout={navigateToCheckout} />}

      {currentRoute.name !== 'CHECKOUT' && currentRoute.name !== 'ADMIN' && currentRoute.name !== 'TRACKING' && (
        <MobileNav
          onNavigateHome={navigateToHome}
          onCartClick={toggleCart}
          onSearchClick={() => setIsSearchOpen(true)}
          onProfileClick={navigateToTracking}
          onWishlistClick={navigateToWishlist}
        />
      )}

      <AIChatAssistant products={products} />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        categories={categories}
        onNavigateToProduct={navigateToProduct}
      />

      {currentRoute.name !== 'CHECKOUT' && currentRoute.name !== 'ADMIN' && currentRoute.name !== 'TRACKING' && currentRoute.name !== 'BLOG_POST' && currentRoute.name !== 'WISHLIST' && (
        <Footer onAdminClick={navigateToAdmin} />
      )}
    </div>
  );
};

import { LanguageProvider } from './context/LanguageContext'; // Added import for LanguageProvider

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