'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import { dedupeWishlist, isSameWishlistProduct } from '../lib/domain/wishlist';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (product: Product | number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (product: Product | number) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { user } = useAuth();

  // Load from local storage or DB
  useEffect(() => {
    let localWishlist: Product[] = [];
    const saved = typeof window !== 'undefined'
      ? localStorage.getItem('paketshop_wishlist')
      : null;
    if (saved) {
      try {
        localWishlist = dedupeWishlist(JSON.parse(saved) as Product[]);
      } catch (error) {
        console.error('Failed to parse wishlist', error);
      }
    }

    if (user) {
      setWishlist(localWishlist);
      supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const ids = data.map(w => w.product_id);
            supabase.from('products').select('*').in('id', ids).then((res) => {
              if (res.data) {
                setWishlist((current) => {
                  const merged = [...current];
                  for (const product of res.data as Product[]) {
                    if (!merged.some((item) => isSameWishlistProduct(item, product))) {
                      merged.push(product);
                    }
                  }
                  return dedupeWishlist(merged);
                });
              }
            });
          }
        });
    } else {
      setWishlist(localWishlist);
    }
  }, [user]);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('paketshop_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = async (product: Product) => {
    setWishlist((prev) => {
      if (!prev.some((item) => isSameWishlistProduct(item, product))) {
        return [...prev, product];
      }
      return prev;
    });

    if (user && product.id > 0) {
      await supabase.from('wishlists').insert([{ user_id: user.id, product_id: product.id }]);
    }
  };

  const removeFromWishlist = async (product: Product | number) => {
    const productId = typeof product === 'number' ? product : product.id;
    setWishlist((prev) => prev.filter((item) => (
      typeof product === 'number'
        ? item.id !== product
        : !isSameWishlistProduct(item, product)
    )));
    
    if (user && productId > 0) {
      await supabase.from('wishlists').delete().match({ user_id: user.id, product_id: productId });
    }
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product)) {
      removeFromWishlist(product);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (product: Product | number) => {
    return wishlist.some((item) => (
      typeof product === 'number'
        ? item.id === product
        : isSameWishlistProduct(item, product)
    ));
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
