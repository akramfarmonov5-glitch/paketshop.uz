import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react';
import { Product, Category } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  onNavigateToProduct: (id: number) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, products, categories, onNavigateToProduct }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();
  const { t } = useLanguage();

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const filteredProducts = query.trim()
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  const filteredCategories = query.trim()
    ? categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  // Popular searches suggestions
  const suggestions = ['Soatlar', 'Sumkalar', 'Titan', 'Sovg\'a'];

  const handleProductClick = (id: number) => {
    onNavigateToProduct(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-4 md:pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className={`relative w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${isDark ? 'bg-dark-900 border-white/10' : 'bg-white border-light-border'}`}
          >
            {/* Header / Input */}
            <div className={`flex items-center gap-4 p-6 border-b ${isDark ? 'border-white/10' : 'border-light-border'}`}>
              <Search className="text-gold-400" size={24} />
              <input
                ref={inputRef}
                type="text"
                placeholder={t('search_placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`flex-1 bg-transparent text-xl focus:outline-none ${isDark ? 'text-white placeholder:text-gray-600' : 'text-light-text placeholder:text-light-muted'}`}
              />
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-light-card hover:bg-gray-200 text-light-muted hover:text-light-text'}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {!query.trim() && (
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-light-muted'}`}>
                    <TrendingUp size={14} /> {t('popular_searches')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuery(item)}
                        className={`px-4 py-2 border rounded-full text-sm transition-colors ${isDark ? 'bg-white/5 hover:bg-gold-400/10 hover:text-gold-400 border-white/5 text-gray-300' : 'bg-light-card hover:bg-gold-400/10 hover:text-gold-400 border-light-border text-light-text'}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim() && (
                <div className="space-y-8">
                  {filteredProducts.length === 0 && filteredCategories.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      {t('nothing_found')}
                    </div>
                  )}

                  {/* Categories */}
                  {filteredCategories.length > 0 && (
                    <div>
                      <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-light-muted'}`}>{t('categories')}</h3>
                      <div className="space-y-2">
                        {filteredCategories.map(cat => (
                          <div key={cat.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer group ${isDark ? 'hover:bg-white/5' : 'hover:bg-light-card'}`}>
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800">
                              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                            </div>
                            <span className={`font-medium group-hover:text-gold-400 transition-colors ${isDark ? 'text-white' : 'text-light-text'}`}>{cat.name}</span>
                            <ArrowRight size={16} className={`ml-auto group-hover:text-gold-400 ${isDark ? 'text-gray-600' : 'text-light-muted'}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  {filteredProducts.length > 0 && (
                    <div>
                      <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-light-muted'}`}>{t('products')}</h3>
                      <div className="space-y-2">
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            onClick={() => handleProductClick(product.id)}
                            className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer group transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-light-card'}`}
                          >
                            <div className={`w-14 h-16 rounded-lg overflow-hidden border ${isDark ? 'bg-gray-800 border-white/5' : 'bg-light-card border-light-border'}`}>
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-medium group-hover:text-gold-400 transition-colors ${isDark ? 'text-white' : 'text-light-text'}`}>{product.name}</h4>
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-light-muted'}`}>{product.category}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-gold-400">{product.formattedPrice}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/20 text-center text-xs text-gray-500">
              <span className="hidden md:inline">{t('search_help')}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;