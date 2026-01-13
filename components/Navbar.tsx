import React, { useState } from 'react';
import { ShoppingBag, Search, User, Menu, X, ChevronRight, Instagram, Send, Facebook, Youtube, Twitter, Heart, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { NavigationSettings } from '../types';
import { DEFAULT_NAVIGATION } from '../constants';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  onNavigateHome: () => void;
  navigationSettings?: NavigationSettings;
  onProfileClick?: () => void;
  onSearchClick?: () => void;
  onWishlistClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigateHome, navigationSettings = DEFAULT_NAVIGATION, onProfileClick, onSearchClick, onWishlistClick }) => {
  const { cartCount, toggleCart } = useCart();
  const { wishlist } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleMobileLinkClick = () => {
    onNavigateHome();
    setIsMobileMenuOpen(false);
  };

  const languages = [
    { code: 'uz', label: 'UZ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ] as const;

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram size={20} />;
      case 'telegram': return <Send size={20} />;
      case 'facebook': return <Facebook size={20} />;
      case 'youtube': return <Youtube size={20} />;
      case 'twitter': return <Twitter size={20} />;
      default: return <Instagram size={20} />;
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-4 backdrop-blur-md border-b transition-colors duration-300 ${isDark ? 'bg-dark-900/80 border-white/10' : 'bg-white/80 border-light-border'}`}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`md:hidden transition-colors p-1 ${isDark ? 'text-white hover:text-gold-400' : 'text-light-text hover:text-gold-500'}`}
          >
            <Menu size={24} />
          </button>
          <button onClick={onNavigateHome} className={`flex items-center gap-2 text-xl md:text-2xl font-bold tracking-wider ${isDark ? 'text-white' : 'text-light-text'}`}>
            <img src={isDark ? '/logo.png' : '/logo-light.png'} alt="PaketShop" className="w-8 h-8 md:w-9 md:h-9" />
            Paket<span className="text-gold-400">Shop</span>
          </button>
        </div>

        {/* Desktop Links */}
        <div className={`hidden md:flex gap-8 text-sm font-medium tracking-wide ${isDark ? 'text-gray-300' : 'text-light-muted'}`}>
          <button onClick={onNavigateHome} className="hover:text-gold-400 transition-colors">
            {t('nav_home')}
          </button>
          <button onClick={onNavigateHome} className="hover:text-gold-400 transition-colors">
            {t('nav_catalog')}
          </button>
          <button onClick={onNavigateHome} className="hover:text-gold-400 transition-colors">
            {t('nav_blog')}
          </button>
          <button onClick={onNavigateHome} className="hover:text-gold-400 transition-colors">
            {t('nav_tracking')}
          </button>
        </div>

        {/* Desktop Icons */}
        <div className={`hidden md:flex items-center gap-5 ${isDark ? 'text-white' : 'text-light-text'}`}>
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all border ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}`}
            >
              <span className="text-gold-400 uppercase">{lang}</span>
              <ChevronRight size={14} className={`transition-transform duration-300 ${isLangOpen ? 'rotate-90' : 'rotate-0'}`} />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute top-full right-0 mt-2 p-2 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[100px] ${isDark ? 'bg-dark-800/90 border-white/10' : 'bg-white/90 border-gray-200'}`}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${lang === l.code ? 'bg-gold-400 text-black' : isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-300 ${isDark ? 'bg-white/5 hover:bg-white/10 text-yellow-400' : 'bg-light-card hover:bg-gray-200 text-amber-600'}`}
            title={isDark ? t('theme_light') : t('theme_dark')}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button onClick={onSearchClick} className="hover:text-gold-400 transition-colors">
            <Search size={22} strokeWidth={1.5} />
          </button>

          <button onClick={onWishlistClick} className="relative hover:text-gold-400 transition-colors">
            <Heart size={22} strokeWidth={1.5} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-black bg-gold-400 rounded-full">
                {wishlist.length}
              </span>
            )}
          </button>

          <button onClick={onProfileClick} className="hover:text-gold-400 transition-colors">
            <User size={22} strokeWidth={1.5} />
          </button>

          <button
            onClick={toggleCart}
            className="relative cursor-pointer group hover:text-gold-400 transition-colors"
          >
            <ShoppingBag size={22} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-black bg-gold-400 rounded-full animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Spacer */}
        <div className="md:hidden w-8"></div>
      </motion.nav >

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {
          isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm md:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm border-r z-[70] p-6 flex flex-col md:hidden transition-colors duration-300 ${isDark ? 'bg-dark-900 border-white/10' : 'bg-white border-light-border'}`}
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`flex items-center gap-2 text-2xl font-bold tracking-wider ${isDark ? 'text-white' : 'text-light-text'}`}>
                    <img src={isDark ? '/logo.png' : '/logo-light.png'} alt="PaketShop" className="w-8 h-8" />
                    Paket<span className="text-gold-400">Shop</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    {/* Mobile Theme Toggle */}
                    <button
                      onClick={toggleTheme}
                      className={`p-2 rounded-full transition-all ${isDark ? 'bg-white/5 text-yellow-400' : 'bg-light-card text-amber-600'}`}
                    >
                      {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`p-2 rounded-full ${isDark ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-light-card text-light-muted hover:text-light-text'}`}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2 flex-1 overflow-y-auto">
                  <button key="home" onClick={handleMobileLinkClick} className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors group ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-light-card hover:bg-gray-100 text-light-text'}`}>
                    <span className="font-medium">{t('nav_home')}</span>
                    <ChevronRight size={16} className={`${isDark ? 'text-gray-500' : 'text-light-muted'} group-hover:text-gold-400`} />
                  </button>
                  <button key="catalog" onClick={handleMobileLinkClick} className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors group ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-light-card hover:bg-gray-100 text-light-text'}`}>
                    <span className="font-medium">{t('nav_catalog')}</span>
                    <ChevronRight size={16} className={`${isDark ? 'text-gray-500' : 'text-light-muted'} group-hover:text-gold-400`} />
                  </button>
                  <button key="blog" onClick={handleMobileLinkClick} className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors group ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-light-card hover:bg-gray-100 text-light-text'}`}>
                    <span className="font-medium">{t('nav_blog')}</span>
                    <ChevronRight size={16} className={`${isDark ? 'text-gray-500' : 'text-light-muted'} group-hover:text-gold-400`} />
                  </button>
                  <button key="tracking" onClick={handleMobileLinkClick} className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors group ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-light-card hover:bg-gray-100 text-light-text'}`}>
                    <span className="font-medium">{t('nav_tracking')}</span>
                    <ChevronRight size={16} className={`${isDark ? 'text-gray-500' : 'text-light-muted'} group-hover:text-gold-400`} />
                  </button>

                  {/* Mobile Language Switcher */}
                  <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-light-card border-gray-100'}`}>
                    <p className={`text-[10px] uppercase tracking-widest font-bold mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('choose_language') || 'Tilni tanlang'}</p>
                    <div className="flex gap-2">
                      {languages.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => setLang(l.code)}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${lang === l.code ? 'bg-gold-400 text-black shadow-lg shadow-gold-400/20' : isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Social Media & Footer Info */}
                <div className={`mt-6 pt-6 border-t ${isDark ? 'border-white/10' : 'border-light-border'}`}>
                  <p className={`text-xs mb-4 uppercase tracking-widest font-semibold ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>Bizni kuzating</p>
                  <div className="flex gap-4 mb-8">
                    {navigationSettings.socialLinks.map((social) => (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-gold-400 hover:text-black transition-all ${isDark ? 'bg-white/5 text-gray-400' : 'bg-light-card text-light-muted'}`}
                      >
                        {getSocialIcon(social.platform)}
                      </a>
                    ))}
                  </div>

                  <p className={`text-xs text-center ${isDark ? 'text-gray-600' : 'text-light-muted'}`}>
                    &copy; 2026 PaketShop.uz. <br /> Sifatli Onlayn Xaridlar.
                  </p>
                </div>
              </motion.div>
            </>
          )
        }
      </AnimatePresence >
    </>
  );
};

export default Navbar;