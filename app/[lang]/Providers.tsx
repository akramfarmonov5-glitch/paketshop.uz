'use client';

import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';
import { LanguageProvider } from '../../context/LanguageContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { WishlistProvider } from '../../context/WishlistContext';
import { CartProvider } from '../../context/CartContext';
import { GlobalProvider } from '../../context/GlobalContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import AttributionTracker from '../../components/AttributionTracker';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children, lang }: { children: React.ReactNode; lang?: string }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <AttributionTracker />
        <LanguageProvider initialLang={lang}>
          <ThemeProvider>
            <GlobalProvider>
              <ToastProvider>
                <AuthProvider>
                  <WishlistProvider>
                    <CartProvider>
                      {children}
                    </CartProvider>
                  </WishlistProvider>
                </AuthProvider>
              </ToastProvider>
            </GlobalProvider>
          </ThemeProvider>
        </LanguageProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
