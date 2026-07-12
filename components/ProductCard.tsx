import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart } from 'lucide-react';
import Image from 'next/image';
import { Category, Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../lib/i18nUtils';
import { getCategoryDisplayName } from '../lib/categoryUtils';

interface ProductCardProps {
  product: Product;
  onNavigate: () => void;
  categories?: Category[];
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, categories = [] }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { lang, t } = useLanguage();

  const isLiked = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
    if (!isLiked) {
      showToast(`${getLocalizedText(product.name, lang)} ${t('added_to_wishlist_desc')}`, 'success');
    } else {
      showToast(`${getLocalizedText(product.name, lang)} ${t('removed_from_wishlist_desc')}`, 'info');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    showToast(`${getLocalizedText(product.name, lang)} ${t('added_to_cart_desc')}`, 'success');
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl flex flex-col transition-all duration-300 bg-white border border-slate-200"
    >
      {/* Image Container */}
      <div
        onClick={onNavigate}
        className="relative aspect-[4/5] w-full overflow-hidden bg-slate-50 cursor-pointer"
      >
        <Image
          src={product.image}
          alt={getLocalizedText(product.name, lang)}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority={false}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1.5 z-10">
          {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
            <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] md:text-[11px] font-bold rounded-md uppercase tracking-wider shadow-sm">
              🔥 Bestseller
            </span>
          )}
          {product.price >= 100000 && product.price <= 300000 && (
            <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] md:text-[11px] font-bold rounded-md uppercase tracking-wider shadow-sm">
              ✨ Yangi
            </span>
          )}
        </div>
        
        {/* Overlay Buttons - Mobile: Always visible, Desktop: Visible on hover */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col gap-2 translate-x-0 md:translate-x-12 md:group-hover:translate-x-0 transition-transform duration-300 z-10">
          <button
            onClick={handleWishlistClick}
            className={`p-2 md:p-3 backdrop-blur-md rounded-full transition-all shadow-sm ${isLiked
              ? 'bg-red-600 text-white scale-110'
              : 'bg-white/80 text-slate-700 hover:bg-red-600 hover:text-white border border-slate-200'
              }`}
          >
            <Heart size={16} className={`md:w-[18px] md:h-[18px] ${isLiked ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-5 flex flex-col flex-grow">
        <div className="flex-grow cursor-pointer" onClick={onNavigate}>
          <span className="text-[11px] md:text-xs uppercase tracking-wider text-slate-500 font-medium">
            {getCategoryDisplayName(product.category, categories, lang)}
          </span>
          <h3 className="text-sm md:text-base font-bold mt-1 group-hover:text-red-600 transition-colors line-clamp-2 text-slate-900 leading-tight">
            {getLocalizedText(product.name, lang)}
          </h3>
          {product.itemsPerPackage && product.itemsPerPackage > 1 && (
            <span className="text-xs text-red-600 font-medium mt-1 block">
              ({product.itemsPerPackage} {t('items_per_package_desc')})
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 border-t border-slate-100">
          <span className="text-slate-900 font-black text-sm md:text-lg">
            {product.formattedPrice}
          </span>

          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1.5 w-8 h-8 md:w-auto md:h-auto md:px-4 md:py-2 bg-slate-50 border border-slate-200 rounded-full md:rounded-lg text-sm font-bold text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
            aria-label={t('add_to_cart')}
          >
            <Plus size={16} className="md:w-[16px] md:h-[16px]" />
            <span className="hidden md:inline">Savatga</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
