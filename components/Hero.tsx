import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HeroContent } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeroProps {
  content?: HeroContent;
}

const Hero: React.FC<HeroProps> = ({ content }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isDark } = useTheme();

  // Fallback if content is missing
  const displayContent = content || {
    badge: "Yangi Mavsum",
    title: "Premium Collection 2026",
    description: "Elegentlik va zamonaviy dizayn uyg'unligi.",
    buttonText: "Sotib olish",
    images: [
      "https://picsum.photos/800/1000?random=1",
      "https://picsum.photos/800/1000?random=2",
      "https://picsum.photos/800/1000?random=3"
    ]
  };

  const images = displayContent.images && displayContent.images.length > 0
    ? displayContent.images
    : ["https://picsum.photos/800/1000"];

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const scrollToProducts = () => {
    const productsSection = document.getElementById('featured-products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-24 md:pt-20 overflow-hidden">
      {/* Background Gradient Spotlights */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-600/10 rounded-full blur-[128px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center z-10">

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6 md:space-y-8 order-2 lg:order-1"
        >
          <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 border border-gold-500/30 rounded-full bg-gold-500/10 backdrop-blur-sm">
            <span className="text-gold-400 text-[10px] md:text-xs font-semibold uppercase tracking-widest">
              {displayContent.badge}
            </span>
          </div>

          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight ${isDark ? 'text-white' : 'text-light-text'}`}>
            {displayContent.title.split(' ').slice(0, 1).join(' ')} <br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDark ? 'from-white to-gray-400' : 'from-amber-600 to-gold-500'}`}>
              {displayContent.title.split(' ').slice(1).join(' ')}
            </span>
          </h1>

          <p className={`text-base md:text-xl max-w-lg font-light leading-relaxed ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
            {displayContent.description}
          </p>

          <div className="flex gap-4 pt-2 md:pt-4">
            <button
              onClick={scrollToProducts}
              className={`flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 text-sm md:text-base ${isDark ? 'bg-white text-black hover:bg-gold-400' : 'bg-gold-500 text-white hover:bg-gold-600'}`}
            >
              {displayContent.buttonText}
              <ArrowRight size={18} />
            </button>
            <button className={`px-6 py-3 md:px-8 md:py-4 border font-medium rounded-full backdrop-blur-sm transition-all duration-300 text-sm md:text-base ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-light-border text-light-text hover:bg-light-card'}`}>
              Batafsil
            </button>
          </div>
        </motion.div>

        {/* Hero Image Slideshow */}
        <div className="relative h-[400px] md:h-[650px] w-full order-1 lg:order-2">
          <div className="absolute inset-0 bg-gradient-to-tr from-gold-400/20 to-purple-500/20 rounded-[2rem] md:rounded-[3rem] blur-xl opacity-50"></div>

          <div className={`relative h-full w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border shadow-2xl ${isDark ? 'border-white/10 bg-dark-900' : 'border-light-border bg-light-card'}`}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                alt={displayContent.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Glass Card Overlay */}
            <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 p-4 md:p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 z-20">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-white text-lg md:text-xl font-semibold">Urban Elite Series</h3>
                  <p className="text-gray-300 text-xs md:text-sm mt-1">Limited Edition</p>
                </div>
                <span className="text-gold-400 font-bold text-sm md:text-lg">Coming Soon</span>
              </div>
            </div>

            {/* Slide Indicators */}
            {images.length > 1 && (
              <div className="absolute top-6 right-6 flex gap-2 z-20">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-gold-400' : 'w-2 bg-white/30 hover:bg-white'}`}
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