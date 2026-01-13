import React from 'react';
import { Home, Search, ShoppingBag, User, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface MobileNavProps {
  onNavigateHome: () => void;
  onSearchClick: () => void;
  onProfileClick: () => void;
  onCartClick: () => void;
  onWishlistClick: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ onNavigateHome, onSearchClick, onProfileClick, onCartClick, onWishlistClick }) => {
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t px-2 py-3 z-40 flex justify-between items-center safe-pb transition-colors duration-300 ${isDark ? 'bg-dark-900/95 border-white/10' : 'bg-white/95 border-light-border'}`}>
      <button onClick={onNavigateHome} className={`flex-1 flex flex-col items-center gap-1 hover:text-gold-400 transition-colors ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
        <Home size={20} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">{t('nav_home')}</span>
      </button>

      <button onClick={onSearchClick} className={`flex-1 flex flex-col items-center gap-1 hover:text-gold-400 transition-colors ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
        <Search size={20} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">{t('search') || 'Qidiruv'}</span>
      </button>

      <button onClick={onWishlistClick} className={`flex-1 relative flex flex-col items-center gap-1 hover:text-gold-400 transition-colors ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
        <div className="relative">
          <Heart size={20} strokeWidth={1.5} />
          {wishlist.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-3.5 h-3.5 text-[9px] font-bold text-black bg-gold-400 rounded-full">
              {wishlist.length}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">{t('wishlist') || 'Sevimlilar'}</span>
      </button>

      <button onClick={onCartClick} className={`flex-1 relative flex flex-col items-center gap-1 hover:text-gold-400 transition-colors ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
        <div className="relative">
          <ShoppingBag size={20} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-3.5 h-3.5 text-[9px] font-bold text-black bg-gold-400 rounded-full animate-bounce">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">{t('cart_title')}</span>
      </button>

      <button onClick={onProfileClick} className={`flex-1 flex flex-col items-center gap-1 hover:text-gold-400 transition-colors ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
        <User size={20} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">{t('profile') || 'Profil'}</span>
      </button>
    </div>
  );
};

export default MobileNav;