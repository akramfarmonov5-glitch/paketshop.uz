'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CartSidebar from '../../components/CartSidebar';
import MobileNav from '../../components/MobileNav';
import MetaPixel from '../../components/MetaPixel';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import type { NavigationSettings } from '../../types';

const SearchModal = dynamic(() => import('../../components/SearchModal'), { ssr: false });
const AuthModal = dynamic(() => import('../../components/AuthModal'), { ssr: false });
const AIChatAssistant = dynamic(() => import('../../components/AIChatAssistant'), { ssr: false });
const InstallPWA = dynamic(() => import('../../components/InstallPWA'), { ssr: false });

export default function ClientLayout({
  children,
  lang,
  navigationSettings,
}: {
  children: React.ReactNode;
  lang?: string;
  navigationSettings: NavigationSettings;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { toggleCart } = useCart();
  const { user } = useAuth();
  const pathname = usePathname() || '/';
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const isCheckout = pathname.includes('/checkout');
  const isAdmin = pathname.includes('/admin');
  const isTracking = pathname.includes('/tracking');
  const isBlogPost = pathname.includes('/blog/');
  const isWishlist = pathname.includes('/wishlist');
  const hideNavAndFooter = isCheckout || isAdmin || isTracking;
  const hideFooter = hideNavAndFooter || isBlogPost || isWishlist;

  const navigateToHome = () => router.push(`/${lang || 'uz'}`);
  const navigateToWishlist = () => router.push(`/${lang || 'uz'}/wishlist`);
  const navigateToTracking = () => router.push(`/${lang || 'uz'}/tracking`);
  const navigateToAdmin = () => router.push(`/${lang || 'uz'}/admin`);

  const handleProfileClick = () => {
    if (user) {
      router.push(`/${lang || 'uz'}/profile`);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <ErrorBoundary>
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

      {!isAdmin && <CartSidebar onCheckout={() => router.push(`/${lang || 'uz'}/checkout`)} />}

      {!hideNavAndFooter && (
        <MobileNav
          onNavigateHome={navigateToHome}
          onCartClick={toggleCart}
          onSearchClick={() => setIsSearchOpen(true)}
          onProfileClick={handleProfileClick}
          onWishlistClick={navigateToWishlist}
        />
      )}

      {!isAdmin && <AIChatAssistant />}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {!hideFooter && (
        <Footer
          onAdminClick={navigateToAdmin}
          navigationSettings={navigationSettings}
        />
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {!isAdmin && <InstallPWA />}
    </ErrorBoundary>
  );
}
