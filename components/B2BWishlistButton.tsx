'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import type { Product } from '@/types';

interface B2BWishlistButtonProps {
  product: Product;
  locale: 'uz' | 'ru';
  variant?: 'icon' | 'button';
  className?: string;
}

export default function B2BWishlistButton({
  product,
  locale,
  variant = 'icon',
  className = '',
}: B2BWishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const isSaved = isInWishlist(product);
  const label = isSaved
    ? (locale === 'ru' ? 'Сохранено' : 'Saqlangan')
    : (locale === 'ru' ? 'Сохранить' : 'Saqlash');

  const handleClick = () => {
    toggleWishlist(product);
    showToast(
      isSaved
        ? (locale === 'ru' ? 'Удалено из сохранённых' : 'Saqlanganlardan olib tashlandi')
        : (locale === 'ru' ? 'Добавлено в сохранённые' : 'Saqlanganlarga qo‘shildi'),
      isSaved ? 'info' : 'success',
    );
  };

  if (variant === 'button') {
    return (
      <button
        type="button"
        aria-pressed={isSaved}
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition ${
          isSaved
            ? 'border-red-600 bg-red-50 text-red-700'
            : 'border-slate-300 bg-white text-slate-800 hover:border-red-500 hover:text-red-700'
        } ${className}`}
      >
        <Heart size={17} className={isSaved ? 'fill-current' : ''} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSaved}
      onClick={handleClick}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
        isSaved
          ? 'border-red-600 bg-red-600 text-white'
          : 'border-slate-200 bg-white/95 text-slate-700 hover:border-red-500 hover:bg-red-600 hover:text-white'
      } ${className}`}
    >
      <Heart size={18} className={isSaved ? 'fill-current' : ''} />
    </button>
  );
}
