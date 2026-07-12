import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Product, Category } from '../types';
import { Filter, X, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { ProductSkeleton } from './Skeleton';
import { getLocalizedText } from '../lib/i18nUtils';
import { getCategoryDisplayName, getCategorySlug, getProductCategoryKey } from '../lib/categoryUtils';

interface FeaturedProductsProps {
    products: Product[];
    categories: Category[];
    onNavigateToProduct: (id: number) => void;
    activeCategory?: string;
    isLoading?: boolean;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products, categories, onNavigateToProduct, activeCategory, isLoading }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Sync internal state with prop
    useEffect(() => {
        if (activeCategory) {
            setSelectedCategory(activeCategory);
        }
    }, [activeCategory]);
    
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<string>('newest');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const { lang, t } = useLanguage();

    // Derive active products based on filter and sorting
    const filteredProducts = products.filter(p => {
        const pCat = getProductCategoryKey(p.category, categories);
        const matchesCategory = selectedCategory === 'All' || pCat === selectedCategory;
        const pName = getLocalizedText(p.name, lang).toLowerCase();
        const pDesc = getLocalizedText(p.shortDescription, lang).toLowerCase();
        const matchesSearch = pName.includes(searchQuery.toLowerCase()) ||
            pDesc.includes(searchQuery.toLowerCase());
        const minP = minPrice ? parseInt(minPrice) : 0;
        const maxP = maxPrice ? parseInt(maxPrice) : Infinity;
        const matchesPrice = p.price >= minP && p.price <= maxP;
        return matchesCategory && matchesSearch && matchesPrice;
    }).sort((a, b) => {
        if (sortOrder === 'price-asc') return a.price - b.price;
        if (sortOrder === 'price-desc') return b.price - a.price;
        return b.id - a.id; // default: newest
    });

    return (
        <section id="featured-products" className="py-12 md:py-24 scroll-mt-20 bg-slate-50 transition-colors duration-300">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header with Search and Filter */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-12 gap-4">
                    <div className="space-y-2 w-full md:w-auto">
                        <h2 className="text-2xl md:text-4xl font-bold text-slate-900">
                            Bizning <span className="text-red-600">Mahsulotlar</span>
                        </h2>
                        <p className="text-sm md:text-base max-w-md text-slate-600">
                            Eng yaxshi sifatdagi ulgurji qadoqlash materiallari.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-red-600 focus:outline-none transition-colors"
                            />
                        </div>

                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="md:hidden flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-full text-sm text-slate-700 hover:bg-slate-50 shrink-0"
                        >
                            <Filter size={16} />
                            {t('filter')}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

                    {/* Sidebar Filter (Desktop) */}
                    <div className="hidden md:block w-64 shrink-0 sticky top-28 h-fit">
                        <div className="space-y-8 bg-white p-6 rounded-2xl border border-slate-200">
                            {/* Categories */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                                    <Filter size={18} className="text-red-600" />
                                    {t('footer_categories')}
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('All')}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex justify-between items-center ${selectedCategory === 'All' ? 'bg-red-50 text-red-600 font-bold border border-red-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                    >
                                        <span>{t('all_categories')}</span>
                                        {selectedCategory === 'All' && <Check size={16} />}
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(getCategorySlug(cat))}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm border ${selectedCategory === getCategorySlug(cat)
                                                    ? 'border-red-200 bg-red-50 text-red-600'
                                                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                }`}
                                        >
                                            {getLocalizedText(cat.name, lang)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort Order */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 text-slate-900">
                                    {t('sort_by')}
                                </h3>
                                <select 
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-red-600 transition-colors cursor-pointer text-slate-900"
                                >
                                    <option value="newest">{t('sort_newest')}</option>
                                    <option value="price-asc">{t('sort_price_asc')}</option>
                                    <option value="price-desc">{t('sort_price_desc')}</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 text-slate-900">
                                    {t('price_range')}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        placeholder={t('min_price')}
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-slate-900"
                                    />
                                    <span className="text-slate-400">-</span>
                                    <input 
                                        type="number" 
                                        placeholder={t('max_price')}
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <>
                                {filteredProducts.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <p className="text-slate-500 text-lg">
                                            {searchQuery ? t('no_products_found') : t('no_products_found')}
                                        </p>
                                        <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="mt-4 text-red-600 underline font-bold">
                                            {t('view_all')}
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div
                                        layout
                                        className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8"
                                    >
                                        <AnimatePresence>
                                            {filteredProducts.map((product) => (
                                                <motion.div
                                                    key={product.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <ProductCard
                                                        product={product}
                                                        onNavigate={() => onNavigateToProduct(product.id)}
                                                        categories={categories}
                                                    />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] md:hidden bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setIsFilterOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute left-0 top-0 bottom-0 w-[80%] max-w-sm border-r p-6 flex flex-col bg-white border-slate-200 shadow-xl"
                        >
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h3 className="text-xl font-bold text-slate-900">{t('filter')}</h3>
                                <button onClick={() => setIsFilterOpen(false)} className="text-slate-500 hover:text-slate-900">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-8 overflow-y-auto max-h-[calc(100vh-140px)] pr-2 custom-scrollbar">
                                {/* Categories */}
                                <div>
                                    <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-slate-500">{t('footer_categories')}</h4>
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => { setSelectedCategory('All'); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedCategory === 'All' ? 'bg-red-50 text-red-600 font-bold border border-red-100' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {t('all_categories')}
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => { setSelectedCategory(getCategorySlug(cat)); setIsFilterOpen(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedCategory === getCategorySlug(cat) ? 'bg-red-50 text-red-600 font-bold border border-red-100' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                {getCategoryDisplayName(cat.name, categories, lang)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort Order */}
                                <div>
                                    <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-slate-500">{t('sort_by')}</h4>
                                    <select 
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-red-600 transition-colors text-slate-900"
                                    >
                                        <option value="newest">{t('sort_newest')}</option>
                                        <option value="price-asc">{t('sort_price_asc')}</option>
                                        <option value="price-desc">{t('sort_price_desc')}</option>
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-slate-500">{t('price_range')}</h4>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            placeholder={t('min_price')}
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-slate-900"
                                        />
                                        <span className="text-slate-400">-</span>
                                        <input 
                                            type="number" 
                                            placeholder={t('max_price')}
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors text-slate-900"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => setIsFilterOpen(false)}
                                        className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20"
                                    >
                                        {t('apply')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default FeaturedProducts;
