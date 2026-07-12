'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { trackAddToCart } from '../lib/fpixel';
import { getLocalizedText } from '../lib/i18nUtils';

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  toggleCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const productKey = (product: Pick<Product, 'id' | 'catalogId'>) => product.catalogId || String(product.id);

function quoteUnitPrice(product: Product): number {
  const packSize = Math.max(1, product.itemsPerPackage || 1);
  const legacyPackMultiplier = !product.catalogId && (product.saleUnit || 'PACK') === 'PACK' ? packSize : 1;
  return Math.max(0, Number(product.price || 0) * legacyPackMultiplier);
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from local storage on mount (optional persistence)
  useEffect(() => {
    const savedCart = (typeof window !== 'undefined' ? localStorage.getItem('paketshop_cart') : null);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart) as Array<CartItem & { quoteUnitPrice?: number }>;
        setCart(parsed.map((item) => {
          if (Number.isFinite(item.quoteUnitPrice)) return item as CartItem;
          const packSize = Math.max(1, item.itemsPerPackage || 1);
          return {
            ...item,
            quantity: Math.max(item.minimumOrderQuantity || 1, Math.round(Number(item.quantity || packSize) / packSize)),
            quoteUnitPrice: quoteUnitPrice(item),
          };
        }));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('paketshop_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    const minimum = Math.max(1, product.minimumOrderQuantity || 1);
    const step = Math.max(1, product.orderStep || 1);
    const key = productKey(product);
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => productKey(item) === key);
      if (existingItem) {
        return prevCart.map((item) =>
          productKey(item) === key ? { ...item, quantity: item.quantity + step } : item
        );
      }
      return [...prevCart, { ...product, quantity: minimum, quoteUnitPrice: quoteUnitPrice(product) }];
    });
    
    // Pixel Tracking
    trackAddToCart({
      id: product.id,
      name: getLocalizedText(product.name, 'uz'),
      price: product.price,
      category: getLocalizedText(product.category, 'uz'),
    });
    
    setIsCartOpen(true); // Open cart when adding item
  };

  const removeFromCart = (productId: string | number) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => productKey(item) !== String(productId));
      if (newCart.length === 0) {
        setIsCartOpen(false);
      }
      return newCart;
    });
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    const current = cart.find((item) => productKey(item) === String(productId));
    const minimum = Math.max(1, current?.minimumOrderQuantity || 1);
    if (quantity < minimum) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) => prevCart.map((item) => {
      if (productKey(item) !== String(productId)) return item;
      const step = Math.max(1, item.orderStep || 1);
      const normalizedQuantity = minimum + Math.max(0, Math.round((quantity - minimum) / step)) * step;
      return { ...item, quantity: normalizedQuantity };
    }));
  };

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const closeCart = () => setIsCartOpen(false);
  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + item.quoteUnitPrice * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleCart,
        closeCart,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
