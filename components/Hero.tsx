import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, ChevronRight } from 'lucide-react';
import { HeroContent } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../lib/i18nUtils';
import Link from 'next/link';

interface HeroProps {
  content?: HeroContent;
}

const Hero: React.FC<HeroProps> = ({ content }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { lang, t } = useLanguage();

  // Fallback if content is missing
  const displayContent = content || {
    badge: "Ulgurji Savdo",
    title: "Qadoqlash Materiallari Ulgurji Savdosi",
    description: "Kafelar, restoranlar va do'konlar uchun sifatli qadoqlash mahsulotlari hamda bir martalik idishlar.",
    buttonText: "Katalogni ko'rish",
    images: [
      "/images/hero-b2b-1.jpg",
      "/images/hero-b2b-2.jpg",
      "/images/hero-b2b-3.jpg"
    ]
  };

  const images = displayContent.images && displayContent.images.length > 0
    ? displayContent.images
    : ["https://picsum.photos/800/1000"];

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const scrollToProducts = () => {
    const productsSection = document.getElementById('featured-products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getLocalizedTitle = () => {
    const titleStr = getLocalizedText(displayContent.title, lang);
    return (
      <span className="text-slate-900">
        {titleStr}
      </span>
    );
  };

  return (
    <section className="relative min-h-screen flex items-center pt-24 md:pt-20 bg-white overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-50 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6 md:space-y-8 order-2 lg:order-1"
        >
          <div className="inline-block px-4 py-2 border border-red-100 rounded-full bg-red-50">
            <span className="text-red-600 text-sm font-bold uppercase tracking-wider">
              {getLocalizedText(displayContent.badge, lang)}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900">
            {getLocalizedTitle()}
          </h1>

          <p className="text-lg md:text-xl max-w-lg leading-relaxed text-slate-600">
            {getLocalizedText(displayContent.description, lang)}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2 md:pt-4">
            <button
              onClick={scrollToProducts}
              className="flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
            >
              {getLocalizedText(displayContent.buttonText, lang)}
              <ShoppingBag size={20} />
            </button>
            <Link
              href={`/${lang}/wholesale`}
              className="flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Hamkorlik
              <ArrowRight size={20} />
            </Link>
          </div>
          
          <div className="pt-8 flex items-center gap-8 text-sm text-slate-500 font-medium">
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                   ✓
                </div>
                <span>Qulay narxlar</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                   ✓
                </div>
                <span>Tezkor yetkazish</span>
             </div>
          </div>
        </motion.div>

        <div className="relative h-[400px] md:h-[600px] w-full order-1 lg:order-2">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-slate-200/50 rounded-[2rem] blur-2xl opacity-50"></div>
          <div className="relative h-full w-full rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl bg-white">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                alt={displayContent.title}
                className="absolute inset-0 w-full h-full object-cover bg-slate-100"
                fetchPriority="high"
                onError={(e) => {
                   // Fallback for missing images
                   (e.target as HTMLImageElement).src = "https://picsum.photos/800/1000?wholesale";
                }}
              />
            </AnimatePresence>

            <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl z-20">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-slate-900 text-xl font-bold">Maxsus Takliflar</h3>
                  <p className="text-slate-500 text-sm mt-1">Ulgurji xaridorlar uchun doimiy chegirmalar</p>
                </div>
                <Link href={`/${lang}/wholesale`} className="text-red-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Batafsil <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {images.length > 1 && (
              <div className="absolute top-6 right-6 flex gap-2 z-20">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-8 bg-red-600' : 'w-2 bg-white/80 hover:bg-white shadow-sm'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;