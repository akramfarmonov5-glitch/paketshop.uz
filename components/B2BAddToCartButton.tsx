'use client';

import { Check, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

export default function B2BAddToCartButton({ product, locale, className = '' }: { product: Product; locale: 'uz' | 'ru'; className?: string }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const disabled = product.availabilityStatus === 'OUT_OF_STOCK' || product.availabilityStatus === 'DISCONTINUED';

  return <button type="button" disabled={disabled} onClick={() => { addToCart(product); setAdded(true); window.setTimeout(() => setAdded(false), 1400); }} className={`inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300 ${className}`}>
    {added ? <Check size={17} /> : <ShoppingCart size={17} />}
    {disabled ? (locale === 'ru' ? 'Нет в наличии' : 'Mavjud emas') : added ? (locale === 'ru' ? 'Добавлено' : 'Qo‘shildi') : (locale === 'ru' ? 'В корзину' : 'Savatga qo‘shish')}
  </button>;
}
