import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import CategoryGrid from './components/CategoryGrid';
import Footer from './components/Footer';
import TrustBadges from './components/TrustBadges';
import Testimonials from './components/Testimonials';
import PromoBanner from './components/PromoBanner';
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
import SEOHead from './components/SEOHead';
import InstallPWA from './components/InstallPWA';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, DEFAULT_HERO_CONTENT, DEFAULT_NAVIGATION } from './constants';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { supabase } from './lib/supabaseClient';
import { Product, Category, HeroContent, NavigationSettings, BlogPost } from './types';
import { productSlug, getIdFromSlug, blogSlug, getBlogIdFromSlug, slugify } from './lib/slugify';

const BASE_URL = 'https://paketshop.uz';

type Route =
  | { name: 'HOME' }
  | { name: 'PRODUCT'; productId: number }
  | { name: 'CATEGORY'; categorySlug: string }
  | { name: 'CHECKOUT' }
  | { name: 'ADMIN' }
  | { name: 'TRACKING' }
  | { name: 'WISHLIST' }
  | { name: 'BLOG_POST'; postId: string };

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
    default:
      return '/';
  }
}

const AppContent: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>(parseRouteFromURL);
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

  const navigateToHome = () => navigate({ name: 'HOME' });
  const navigateToProduct = (id: number) => navigate({ name: 'PRODUCT', productId: id });
  const navigateToCheckout = () => navigate({ name: 'CHECKOUT' });
  const navigateToAdmin = () => navigate({ name: 'ADMIN' });
  const navigateToTracking = () => navigate({ name: 'TRACKING' });
  const navigateToWishlist = () => navigate({ name: 'WISHLIST' });
  const navigateToBlogPost = (id: string) => navigate({ name: 'BLOG_POST', postId: id });

  const [activeCategory, setActiveCategory] = useState<string>('All');

  const handleCategorySelect = (categoryName: string) => {
    setActiveCategory(categoryName);
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

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('paketshop_admin_session', 'active');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('paketshop_admin_session');
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
            title={`${product.name} - ${product.category} sotib olish`}
            description={`${product.name} - ${product.shortDescription}. Narxi: ${product.formattedPrice}. PaketShop.uz dan buyurtma bering. Bepul yetkazib berish!`}
            keywords={[product.name, product.category, 'sotib olish', 'narxi', 'PaketShop', 'online shop', 'uzbekistan']}
            canonical={`${BASE_URL}/product/${slug}`}
            ogImage={product.image}
            ogType="product"
            product={product}
            breadcrumbs={[
              { name: 'Bosh sahifa', url: BASE_URL },
              { name: product.category, url: `${BASE_URL}/category/${slugify(product.category)}` },
              { name: product.name, url: `${BASE_URL}/product/${slug}` }
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
            title={post.seo?.title || post.title}
            description={post.seo?.description || post.content.substring(0, 160)}
            keywords={post.seo?.keywords || [post.title, 'blog', 'PaketShop']}
            canonical={`${BASE_URL}/blog/${slug}`}
            ogImage={post.image}
            ogType="article"
            blogPost={post}
            breadcrumbs={[
              { name: 'Bosh sahifa', url: BASE_URL },
              { name: 'Blog', url: `${BASE_URL}/` },
              { name: post.title, url: `${BASE_URL}/blog/${slug}` }
            ]}
          />
        );
      }
    }

    if (currentRoute.name === 'CATEGORY') {
      const cat = categories.find(c => slugify(c.name) === currentRoute.categorySlug || c.slug === currentRoute.categorySlug);
      if (cat) {
        return (
          <SEOHead
            title={`${cat.name} - Online Sotib Olish`}
            description={cat.description || `${cat.name} kategoriyasidagi sifatli mahsulotlar. PaketShop.uz dan buyurtma bering!`}
            keywords={[cat.name, 'sotib olish', 'narxi', 'PaketShop', 'uzbekistan']}
            canonical={`${BASE_URL}/category/${cat.slug}`}
            ogImage={cat.image}
            category={cat}
            breadcrumbs={[
              { name: 'Bosh sahifa', url: BASE_URL },
              { name: cat.name, url: `${BASE_URL}/category/${cat.slug}` }
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

    if (currentRoute.name === 'CATEGORY') {
      const cat = categories.find(c => slugify(c.name) === currentRoute.categorySlug || c.slug === currentRoute.categorySlug);
      if (cat) {
        setActiveCategory(cat.name);
      }
    }

    return (
      <main className="pb-20">
        <Hero content={heroContent} />
        <TrustBadges />
        <CategoryGrid
          categories={categories}
          onSelectCategory={handleCategorySelect}
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
        <BlogGrid posts={blogPosts} onPostClick={navigateToBlogPost} />
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

      <InstallPWA />
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