import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Category } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CategorySkeleton } from './Skeleton';
import { getLocalizedText } from '../lib/i18nUtils';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
  isLoading?: boolean;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onSelectCategory, isLoading }) => {
  const { isDark } = useTheme();
  const { lang, t } = useLanguage();

  return (
    <section className={`py-12 md:py-20 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-light-bg'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end mb-8 md:mb-12">
          <h2 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>
            Kategoriyalar
          </h2>
          <p className={`hidden md:block text-sm max-w-xs text-right ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
            Bizning keng turdagi premium kolleksiyalarimiz bilan tanishing
          </p>
        </div>

        {/* Mobile: grid-cols-3 (3 ustun), Tablet/Desktop: grid-cols-3/4 */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 auto-rows-[160px] md:auto-rows-[300px]">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((i, index) => (
                <div key={i} className={`group relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer border border-white/5 ${
                  index === 0 ? 'col-span-2 row-span-2' : 'col-span-1'
                }`}>
                  <CategorySkeleton />
                </div>
              ))}
            </>
          ) : (
            <>
              {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => onSelectCategory(typeof category.name === 'string' ? category.name : JSON.stringify(category.name))}
              className={`group relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer border border-white/5 ${
                // 1-element (index 0) 2x2 joy egallaydi. 3 ustunli gridda bu 2/3 qismni oladi.
                index === 0 ? 'col-span-2 row-span-2' : 'col-span-1'
                }`}
            >
              {/* Image Background */}
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={getLocalizedText(category.name, lang)}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-3 md:p-8 flex flex-col justify-end items-start">
                <div className="transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-gold-400 text-[11px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2 block">
                    {t('category_collection')}
                  </span>
                  {/* Matn o'lchamlari mobil uchun moslashtirildi */}
                  <h3 className={`font-bold text-white mb-2 md:mb-4 leading-tight ${index === 0 ? 'text-2xl md:text-4xl' : 'text-sm md:text-2xl'}`}>
                    {getLocalizedText(category.name, lang)}
                  </h3>
                  {/* Hidden for UI, but kept for SEO */}
                  <p className="sr-only">
                    {getLocalizedText(category.description, lang)}
                  </p>

                  <div className="inline-flex items-center gap-2 text-white text-xs md:text-sm font-medium group-hover:text-gold-400 transition-colors">
                    <span className="hidden md:inline">{t('view')}</span>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold-400 group-hover:text-black transition-all">
                      <ArrowRight size={12} className="md:w-[14px] md:h-[14px]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;