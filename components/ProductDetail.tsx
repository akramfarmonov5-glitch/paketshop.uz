import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ShoppingBag, ShieldCheck, Truck, Box, Activity, Zap, ExternalLink, Heart } from 'lucide-react';
import { Category, Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import Breadcrumbs from './Breadcrumbs';
import ProductCard from './ProductCard';
import QuickBuyModal from './QuickBuyModal';
import ProductReviews from './ProductReviews';
import * as fpixel from '../lib/fpixel';
import { getLocalizedText } from '../lib/i18nUtils';
import { getCategoryDisplayName, getProductCategoryKey } from '../lib/categoryUtils';

interface ProductDetailProps {
  product: Product;
  allProducts?: Product[];
  categories?: Category[];
  onProductSelect?: (id: number) => void;
  onBack: () => void;
  onCheckout: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, allProducts = [], categories = [], onProductSelect, onBack, onCheckout }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { lang, t } = useLanguage();
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);

  const isLiked = isInWishlist(product.id);
  const productCategoryKey = getProductCategoryKey(product.category, categories);

  const relatedProducts = allProducts
    .filter(p => getProductCategoryKey(p.category, categories) === productCategoryKey && p.id !== product.id)
    .slice(0, 4);

  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(product.image);

    // Track Facebook Pixel ViewContent
    fpixel.trackViewContent({
      ...product,
      name: getLocalizedText(product.name, lang),
      category: getCategoryDisplayName(product.category, categories, lang)
    });

  }, [product, lang, categories]);

  const handleAddToCart = () => {
    addToCart(product);
    showToast(t('toast_added_to_cart'), 'success');
    fpixel.trackAddToCart({
      ...product,
      name: getLocalizedText(product.name, lang),
      category: getCategoryDisplayName(product.category, categories, lang)
    });
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    if (!isLiked) {
      showToast(t('toast_added_to_wishlist'), 'success');
    } else {
      showToast(t('toast_removed_from_wishlist'), 'info');
    }
  };

  const handleBuyNow = () => {
    addToCart(product);
    fpixel.trackAddToCart({
      ...product,
      name: getLocalizedText(product.name, lang),
      category: getCategoryDisplayName(product.category, categories, lang)
    });
    onCheckout();
  };

  return (
    <div className="pt-24 pb-20 min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <Breadcrumbs
            onHomeClick={onBack}
            items={[
              { label: getCategoryDisplayName(product.category, categories, lang), onClick: onBack },
              { label: getLocalizedText(product.name, lang), active: true }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 mb-12">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-6"
          >
            <div className="sticky top-24 md:top-28 space-y-3">
              <div className="aspect-[4/5] w-full rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white relative group">
                <img
                  src={activeImage}
                  alt={getLocalizedText(product.name, lang)}
                  className="relative w-full h-full object-cover z-10 transition-opacity duration-300"
                />
              </div>

              {galleryImages.length > 1 && (
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-red-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
              <span className="text-red-600 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
                {getCategoryDisplayName(product.category, categories, lang)}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
                {getLocalizedText(product.name, lang)}
              </h1>

              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <span className={`px-2 py-1 md:px-3 rounded text-xs md:text-sm font-medium ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {product.stock === 0 ? t('out_of_stock') : (product.stock ? `${product.stock} ${t('stock_in')}` : t('in_stock'))}
                </span>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="md:w-[14px] md:h-[14px]" fill="currentColor" />)}
                </div>
              </div>
              {product.itemsPerPackage && product.itemsPerPackage > 1 && (
                <div className="inline-block mt-2">
                  <span className="px-2 py-1 md:px-3 rounded text-xs md:text-sm font-medium border flex items-center gap-2 border-red-200 text-red-700 bg-red-50">
                    <Box size={14} />
                    {product.itemsPerPackage} {t('items_per_package_desc')}
                  </span>
                </div>
              )}
            </div>

            <div className="py-4 md:py-6 border-t border-slate-200 border-b mb-4 md:mb-6">
              <div className="flex items-end justify-between mb-3 md:mb-4">
                <div>
                  <p className="text-slate-500 text-xs mb-1 font-medium uppercase tracking-wider">{t('total_sum')}</p>
                  <p className="text-3xl md:text-4xl font-bold text-slate-900">{product.formattedPrice}</p>
                </div>
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-xl border transition-all ${isLiked ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200'}`}
                >
                  <Heart size={22} className={isLiked ? 'fill-white' : ''} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="font-bold py-3 md:py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base border bg-white text-slate-900 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm"
                >
                  <ShoppingBag size={18} className="md:w-[20px] md:h-[20px]" />
                  {t('add_to_cart')}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="bg-red-600 text-white font-bold py-3 md:py-4 rounded-xl hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  <ShoppingBag size={18} className="md:w-[20px] md:h-[20px]" />
                  {t('buy_now')}
                </button>
              </div>

              <button
                onClick={() => setIsQuickBuyOpen(true)}
                disabled={product.stock === 0}
                className="w-full py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm md:text-base border-2 border-dashed border-red-300 text-red-600 bg-red-50 hover:bg-red-100"
              >
                <Zap size={18} className="md:w-[20px] md:h-[20px]" fill="currentColor" />
                {t('quick_buy')}
              </button>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-slate-900 text-sm md:text-base font-bold mb-2 md:mb-3">{t('description_label') || 'Tavsif'}</h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                {getLocalizedText(product.shortDescription, lang)}
              </p>
            </div>

            {(product.specs && product.specs.length > 0) && (
              <div className="bg-white border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm border mb-6">
                <h3 className="text-slate-900 text-sm font-bold mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-red-600" />
                  {t('tech_specs')}
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 md:gap-x-8">
                  {product.specs.map((spec, index) => (
                    <div key={index}>
                      <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-wider mb-1">{getLocalizedText(spec.label, lang)}</p>
                      <p className="text-slate-900 text-xs md:text-sm font-bold">{getLocalizedText(spec.value, lang)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 items-center justify-between text-slate-600 text-xs md:text-sm px-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-red-600 md:w-[18px] md:h-[18px]" />
                <span className="font-medium">{t('premium_warranty')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-red-600 md:w-[18px] md:h-[18px]" />
                <span className="font-medium">{t('free_delivery')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Box size={16} className="text-red-600 md:w-[18px] md:h-[18px]" />
                <span className="font-medium">{t('eco_package')}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Reviews */}
        <div className="mt-6 lg:mt-8 border-t border-slate-200 pt-8" id="reviews-section">
          <ProductReviews productId={product.id} />
        </div>

        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 border-t border-slate-200 pt-8"
          >
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-red-600 text-xs font-bold uppercase tracking-widest mb-2 block">
                  {t('recommendations')}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {t('related_products')}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {relatedProducts.map((p) => (
                <motion.div key={p.id} whileHover={{ y: -5 }}>
                  <ProductCard
                    product={p}
                    onNavigate={() => onProductSelect ? onProductSelect(p.id) : null}
                    categories={categories}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <QuickBuyModal
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
        product={product}
        quantity={1}
      />
    </div>
  );
};

export default ProductDetail;
