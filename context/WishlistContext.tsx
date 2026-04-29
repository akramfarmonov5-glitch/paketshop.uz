'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { user } = useAuth();

  // Load from local storage or DB
  useEffect(() => {
    if (user) {
      supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const ids = data.map(w => w.product_id);
            supabase.from('products').select('*').in('id', ids).then((res) => {
               if (res.data) setWishlist(res.data as Product[]);
            });
          }
        });
    } else {
      const saved = (typeof window !== 'undefined' ? localStorage.getItem('paketshop_wishlist') : null);
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse wishlist", e);
        }
      }
    }
  }, [user]);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('paketshop_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = async (product: Product) => {
    setWishlist((prev) => {
      if (!prev.find(item => item.id === product.id)) {
        return [...prev, product];
      }
      return prev;
    });

    if (user) {
      await supabase.from('wishlists').insert([{ user_id: user.id, product_id: product.id }]);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    
    if (user) {
      await supabase.from('wishlists').delete().match({ user_id: user.id, product_id: productId });
    }
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};