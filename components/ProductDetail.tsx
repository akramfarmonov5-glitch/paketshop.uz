
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ShoppingBag, ShieldCheck, Truck, Sparkles, Box, Activity, Zap, PlayCircle, X, Youtube, ExternalLink, ArrowRight, Heart } from 'lucide-react';
import { Product } from '../types';
import { GoogleGenAI } from "@google/genai";
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Breadcrumbs from './Breadcrumbs';
import ProductCard from './ProductCard';
import * as fpixel from '../lib/fpixel';

interface ProductDetailProps {
  product: Product;
  allProducts?: Product[];
  onProductSelect?: (id: number) => void;
  onBack: () => void;
  onCheckout: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, allProducts = [], onProductSelect, onBack, onCheckout }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const { lang, t } = useLanguage();
  const [aiDescription, setAiDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const isLiked = isInWishlist(product.id);

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(product.image);
    setIsPlaying(false);

    // Track Facebook Pixel ViewContent
    fpixel.trackViewContent(product);

    // Update dynamic meta tags
    document.title = `${product.name} | PaketShop.uz`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      const localizedDesc = lang === 'uz'
        ? `${product.name} - ${product.category}. Sifatli mahsulotlar PaketShop.uz do'konida.`
        : lang === 'ru'
          ? `${product.name} - ${product.category}. Качественные товары в магазине PaketShop.uz.`
          : `${product.name} - ${product.category}. Quality products at PaketShop.uz store.`;
      metaDescription.setAttribute('content', localizedDesc);
    }

    // Add JSON-LD Product Schema
    const scriptId = `product-schema-${product.id}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const productSchema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": [product.image, ...(product.images || [])],
      "description": aiDescription || product.name,
      "sku": `SKU-${product.id}`,
      "brand": {
        "@type": "Brand",
        "name": "PaketShop"
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "UZS",
        "price": product.price,
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    };

    script.textContent = JSON.stringify(productSchema);

    const generateAIDescription = async () => {
      try {
        const env = import.meta.env || {};
        const apiKey = env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          setAiDescription(`${product.name} - bu ${product.category} olamidagi haqiqiy inqilob. Har bir detalda mukammallik va hashamat ufurib turadi.`);
          setLoading(false);
          return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const languageName = lang === 'uz' ? 'Uzbek (Cyrillic or Latin as common)' : lang === 'ru' ? 'Russian' : 'English';
        const prompt = `Write a short, sophisticated, and persuasive product description for a luxury e-commerce item named "${product.name}" in the "${product.category}" category. The description MUST BE in ${languageName} language. It should feel like an Apple product description: minimalist, impactful, and premium. Focus on craftsmanship and lifestyle. Max 3 sentences.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-09-2025',
          contents: prompt,
        });

        const text = response.text;
        setAiDescription(text || "Ma'lumot yuklanmadi.");
      } catch (error) {
        console.error("AI Error:", error);
        setAiDescription("Eksklyuziv dizayn va yuqori sifat uyg'unligi. Ushbu mahsulot sizning stilingizni yangi darajaga olib chiqadi.");
      } finally {
        setLoading(false);
      }
    };

    generateAIDescription();
  }, [product, lang]);

  const handleAddToCart = () => {
    addToCart(product);
    showToast(t('toast_added_to_cart'), 'success');
    fpixel.trackAddToCart(product);
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
    fpixel.trackAddToCart(product);
    onCheckout();
  };

  const getYoutubeId = (url: string | undefined) => {
    if (!url) return null;
    const cleanUrl = url.trim();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(product.videoUrl);
  const hasVideo = !!videoId;

  const handleOpenVideo = () => {
    setIsPlaying(false);
    setShowVideo(true);
  }

  const handleCloseVideo = () => {
    setShowVideo(false);
    setIsPlaying(false);
  };

  return (
    <div className={`pt-24 pb-20 min-h-screen transition-colors duration-300 ${isDark ? "bg-black text-white" : "bg-light-bg text-light-text"}`}>
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <Breadcrumbs
            onHomeClick={onBack}
            items={[
              { label: product.category, onClick: onBack },
              { label: product.name, active: true }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 mb-20">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7"
          >
            <div className="sticky top-24 md:top-28 space-y-4">
              <div className="aspect-[4/5] w-full rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-dark-800 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/20 to-purple-500/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <img
                  src={activeImage}
                  alt={product.name}
                  className="relative w-full h-full object-cover z-10 transition-opacity duration-300"
                />

                {hasVideo && (
                  <button
                    onClick={handleOpenVideo}
                    className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md pl-3 pr-4 py-2 rounded-full text-white hover:bg-red-600 transition-colors border border-white/10 group/btn"
                  >
                    <PlayCircle size={18} className="text-white group-hover/btn:scale-110 transition-transform md:w-[22px] md:h-[22px]" />
                    <span className="text-xs md:text-sm font-bold tracking-wide">{t('video_review')}</span>
                  </button>
                )}
              </div>

              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-20 md:w-20 md:h-24 shrink-0 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-gold-400 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}

                {hasVideo && (
                  <button
                    onClick={handleOpenVideo}
                    className="w-16 h-20 md:w-20 md:h-24 shrink-0 rounded-lg md:rounded-xl overflow-hidden border-2 border-white/10 bg-dark-800 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all group"
                  >
                    <Youtube size={20} className="text-red-500 group-hover:scale-110 transition-transform md:w-[24px] md:h-[24px]" />
                    <span className="text-[10px] font-medium">VIDEO</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              <span className="text-gold-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
                {product.category}
              </span>
              <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold leading-tight ${isDark ? 'bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400' : 'text-gray-900'}`}>
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <span className={`px-2 py-1 md:px-3 rounded text-[10px] md:text-xs font-medium text-white ${product.stock === 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                  {product.stock === 0 ? t('out_of_stock') : (product.stock ? `${product.stock} ${t('stock_in')}` : t('in_stock'))}
                </span>
                <div className="flex text-gold-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="md:w-[14px] md:h-[14px]" fill="currentColor" />)}
                </div>

                {hasVideo && (
                  <button
                    onClick={handleOpenVideo}
                    className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 md:px-3 rounded hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Youtube size={12} className="md:w-[14px] md:h-[14px]" />
                    {t('video_review')}
                  </button>
                )}
              </div>
              {product.itemsPerPackage && product.itemsPerPackage > 1 && (
                <div className="inline-block">
                  <span className={`px-2 py-1 md:px-3 rounded text-[10px] md:text-xs font-medium border flex items-center gap-2 ${isDark ? 'border-gold-400/30 text-gold-400 bg-gold-400/5' : 'border-gold-500/30 text-gold-600 bg-gold-400/10'}`}>
                    <Box size={12} />
                    {product.itemsPerPackage} {t('items_per_package_desc')}
                  </span>
                </div>
              )}
            </div>

            <div className="py-6 md:py-8 border-t border-white/10 border-b border-white/10 mb-6 md:mb-8">
              <div className="flex items-end justify-between mb-4 md:mb-6">
                <div>
                  <p className="text-gray-400 text-xs mb-1">{t('total_sum')}</p>
                  <p className={`text-2xl md:text-3xl font-light ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.formattedPrice}</p>
                </div>
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-xl border transition-all ${isLiked ? 'bg-gold-400 border-gold-400 text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}
                >
                  <Heart size={22} className={isLiked ? 'fill-black' : ''} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`font-bold py-3 md:py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base border ${isDark ? 'bg-white/5 text-white border-white/10 hover:bg-white hover:text-black' : 'bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200'}`}
                >
                  <ShoppingBag size={18} className="md:w-[20px] md:h-[20px]" />
                  {t('add_to_cart')}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="bg-gold-400 text-black font-bold py-3 md:py-4 rounded-xl hover:bg-gold-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.3)] disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  <Zap size={18} className="md:w-[20px] md:h-[20px]" fill="currentColor" />
                  {t('buy_now')}
                </button>
              </div>
            </div>

            <div className="mb-6 md:mb-8 relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-gold-400 to-transparent rounded-full"></div>
              <div className="pl-4 md:pl-6">
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <Sparkles size={14} className="text-gold-400 animate-pulse md:w-[16px] md:h-[16px]" />
                  <h3 className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-xs md:text-sm font-semibold tracking-wide`}>{t('ai_analysis')}</h3>
                </div>
                {loading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-5/6"></div>
                    <div className="h-4 bg-white/10 rounded w-4/6"></div>
                  </div>
                ) : (
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-base md:text-lg leading-relaxed font-light italic`}>
                    "{aiDescription}"
                  </p>
                )}
              </div>
            </div>

            <div className={`${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200'} rounded-2xl p-4 md:p-6 backdrop-blur-md border`}>
              <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} text-sm font-semibold mb-4 flex items-center gap-2`}>
                <Activity size={16} className="text-gold-400" />
                {t('tech_specs')}
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 md:gap-x-8">
                {product.specs.map((spec, index) => (
                  <div key={index}>
                    <p className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-[10px] md:text-xs uppercase tracking-wider mb-1`}>{spec.label}</p>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'} text-xs md:text-sm font-medium`}>{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 md:mt-8 flex flex-wrap gap-4 items-center justify-between text-gray-400 text-xs md:text-sm px-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-gold-400 md:w-[18px] md:h-[18px]" />
                <span>{t('premium_warranty')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-gold-400 md:w-[18px] md:h-[18px]" />
                <span>{t('free_delivery')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Box size={16} className="text-gold-400 md:w-[18px] md:h-[18px]" />
                <span>{t('eco_package')}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 border-t border-white/10 pt-12"
          >
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-2 block">
                  {t('recommendations')}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
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
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showVideo && videoId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseVideo}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col group"
            >
              <button
                onClick={handleCloseVideo}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                <X size={20} className="md:w-[24px] md:h-[24px]" />
              </button>

              <div className="relative w-full h-full">
                {!isPlaying ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black cursor-pointer group" onClick={() => setIsPlaying(true)}>
                    <img
                      src={activeImage}
                      alt="Video Cover"
                      className="absolute inset-0 w-full h-full object-cover opacity-60 blur-sm group-hover:opacity-40 transition-opacity duration-700"
                    />
                    <div className="z-20 transform group-hover:scale-110 transition-transform duration-300">
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                        <Youtube size={32} className="text-white fill-white md:w-[48px] md:h-[48px]" />
                      </div>
                    </div>
                    <p className="z-20 mt-4 md:mt-6 text-sm md:text-xl font-bold tracking-widest text-white drop-shadow-lg uppercase">{t('video_review')}</p>
                  </div>
                ) : (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0`}
                    title="Product Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  ></iframe>
                )}

                <div className={`absolute bottom-4 left-0 right-0 md:bottom-6 text-center pointer-events-none z-30 transition-opacity duration-500 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                  <a
                    href={product.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto inline-flex items-center gap-2 text-[10px] md:text-xs font-bold text-white bg-black/70 hover:bg-red-600 px-4 py-2 md:px-6 md:py-3 rounded-full backdrop-blur-md transition-all border border-white/10 shadow-lg"
                  >
                    <ExternalLink size={12} className="md:w-[14px] md:h-[14px]" />
                    {t('video_error')}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;

