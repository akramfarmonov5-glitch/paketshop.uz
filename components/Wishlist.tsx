import React from 'react';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from './ProductCard';
import type { Product } from '../types';

interface WishlistProps {
  onBack: () => void;
  onNavigateToProduct: (product: Product) => void;
}

const Wishlist: React.FC<WishlistProps> = ({ onBack, onNavigateToProduct }) => {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-4 md:px-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Bosh sahifaga qaytish</span>
        </button>

        <div className="flex items-center gap-3 mb-8">
            <Heart size={28} className="text-gold-400 fill-gold-400" />
            <h1 className="text-3xl font-bold">Saqlanganlar</h1>
            <span className="bg-white/10 text-sm px-3 py-1 rounded-full text-gray-300">
                {wishlist.length}
            </span>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/50 rounded-3xl border border-white/5 border-dashed">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Heart size={32} className="text-gray-600" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2">Ro'yxat bo'sh</h2>
             <p className="text-gray-400 max-w-sm mb-6">
               Siz hali hech qanday mahsulotni yoqtirganlarga qo'shmadingiz. Do'konga qaytib, o'zingizga yoqqanini tanlang.
             </p>
             <button 
               onClick={onBack}
               className="bg-gold-400 text-black font-bold px-8 py-3 rounded-full hover:bg-gold-500 transition-colors flex items-center gap-2"
             >
               <ShoppingBag size={18} />
               Do'konga o'tish
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {wishlist.map((product) => (
              <ProductCard 
                key={product.catalogId || product.sku || product.id}
                product={product} 
                onNavigate={() => onNavigateToProduct(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
