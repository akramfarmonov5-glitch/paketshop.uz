import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

interface ProductCardProps {
  product: Product;
  onNavigate: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { isDark } = useTheme();

  const isLiked = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
    if (!isLiked) {
      showToast(`${product.name} sevimlilarga qo'shildi`, 'success');
    } else {
      showToast(`${product.name} sevimlilardan olib tashlandi`, 'info');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    showToast(`${product.name} savatchaga qo'shildi`, 'success');
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`group relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg flex flex-col transition-colors duration-300 ${isDark ? 'bg-dark-800 border border-white/5' : 'bg-white border border-light-border'}`}
    >
      {/* Image Container */}
      <div
        onClick={onNavigate}
        className="relative aspect-[3/4] w-full overflow-hidden bg-gray-900 cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Overlay Buttons - Mobile: Always visible (translate-x-0), Desktop: Visible on hover */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col gap-2 translate-x-0 md:translate-x-12 md:group-hover:translate-x-0 transition-transform duration-300 z-10">
          <button
            onClick={handleWishlistClick}
            className={`p-2 md:p-3 backdrop-blur-md rounded-full transition-all shadow-lg ${isLiked
                ? 'bg-gold-400 text-black scale-110'
                : 'bg-black/40 text-white hover:bg-gold-400 hover:text-black border border-white/10'
              }`}
          >
            <Heart size={16} className={`md:w-[18px] md:h-[18px] ${isLiked ? 'fill-black' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-6 flex flex-col flex-grow">
        <div className="flex-grow cursor-pointer" onClick={onNavigate}>
          <span className={`text-[9px] md:text-xs uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-light-muted'}`}>{product.category}</span>
          <h3 className={`text-sm md:text-lg font-medium mt-0.5 md:mt-1 group-hover:text-gold-400 transition-colors line-clamp-1 ${isDark ? 'text-white' : 'text-light-text'}`}>
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between mt-2 md:mt-4">
          <span className="text-gold-400 font-semibold text-xs md:text-lg">
            {product.formattedPrice}
          </span>

          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-2 w-7 h-7 md:w-auto md:h-auto md:px-4 md:py-2 border rounded-full text-sm font-medium transition-all duration-300 ${isDark ? 'bg-white/5 hover:bg-white text-white hover:text-black border-white/10' : 'bg-light-card hover:bg-gold-400 text-light-text hover:text-black border-light-border'}`}
            aria-label="Add to cart"
          >
            <Plus size={14} className="md:w-[16px] md:h-[16px]" />
            <span className="hidden md:inline">Savatga</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;