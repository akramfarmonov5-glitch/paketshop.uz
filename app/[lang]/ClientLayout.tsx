'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CartSidebar from '../../components/CartSidebar';
import MobileNav from '../../components/MobileNav';
import SearchModal from '../../components/SearchModal';
import AuthModal from '../../components/AuthModal';
import AIChatAssistant from '../../components/AIChatAssistant';
import InstallPWA from '../../components/InstallPWA';
import MetaPixel from '../../components/MetaPixel';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useGlobalData } from '../../context/GlobalContext';
import { usePathname, useRouter } from 'next/navigation';

export default function ClientLayout({ children, lang }: { children: React.ReactNode, lang?: string }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { toggleCart } = useCart();
  const { user } = useAuth();
  const { products, categories, navigationSettings } = useGlobalData();
  const pathname = usePathname() || '/';
  const router = useRouter();

  const isCheckout = pathname.includes('/checkout');
  const isAdmin = pathname.includes('/admin');
  const isTracking = pathname.includes('/tracking');
  const isBlogPost = pathname.includes('/blog/');
  const isWishlist = pathname.includes('/wishlist');
  const isProfile = pathname.includes('/profile');

  const hideNavAndFooter = isCheckout || isAdmin || isTracking;
  const hideFooter = hideNavAndFooter || isBlogPost || isWishlist;

  const navigateToHome = () => router.push('/');
  const navigateToProduct = (id: number) => {
    // Topamiz va slug orqali otamiz
    const product = products.find(p => p.id === id);
    if (product) router.push(`/product/${id}`); // Actually should use slug, but using id for simplicity first
  };
  const navigateToWishlist = () => router.push('/wishlist');
  const navigateToTracking = () => router.push('/tracking');
  const navigateToAdmin = () => router.push('/admin');

  const handleProfileClick = () => {
    if (user) {
      router.push('/profile');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <MetaPixel />
      
      {!hideNavAndFooter && (
        <Navbar
          onNavigateHome={navigateToHome}
          navigationSettings={navigationSettings}
          onProfileClick={handleProfileClick}
          onSearchClick={() => setIsSearchOpen(true)}
          onWishlistClick={navigateToWishlist}
          onTrackingClick={navigateToTracking}
        />
      )}

      {children}

      {!isAdmin && <CartSidebar onCheckout={() => router.push('/checkout')} />}

      {!hideNavAndFooter && (
        <MobileNav
          onNavigateHome={navigateToHome}
          onCartClick={toggleCart}
          onSearchClick={() => setIsSearchOpen(true)}
          onProfileClick={handleProfileClick}
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

      {!hideFooter && (
        <Footer onAdminClick={navigateToAdmin} />
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <InstallPWA />
    </>
  );
}
