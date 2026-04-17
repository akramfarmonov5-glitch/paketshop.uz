import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const PromoBanner: React.FC = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  // Countdown: 7 days from now, resets every week
  const getTargetDate = () => {
    const now = new Date();
    const target = new Date(now);
    // Set target to next Sunday midnight
    target.setDate(now.getDate() + (7 - now.getDay()));
    target.setHours(23, 59, 59, 0);
    return target.getTime();
  };

  const [targetDate] = useState(getTargetDate);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, targetDate - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const scrollToProducts = () => {
    const el = document.getElementById('featured-products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const timeBlocks = [
    { value: timeLeft.days, label: t('promo_days') },
    { value: timeLeft.hours, label: t('promo_hours') },
    { value: timeLeft.minutes, label: t('promo_minutes') },
    { value: timeLeft.seconds, label: t('promo_seconds') },
  ];

  return (
    <section className="py-8 md:py-14">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-50" />

          {/* Floating decorations */}
          <div className="absolute top-4 right-10 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-4 left-10 w-32 h-32 bg-yellow-300/10 rounded-full blur-3xl" />

          <div className="relative z-10 px-6 py-8 md:px-12 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            {/* Left - Text */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full mb-3 backdrop-blur-sm">
                <Zap size={14} className="text-yellow-300" />
                <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-wider">{t('promo_label')}</span>
              </div>
              <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
                {t('promo_title')}
              </h3>
              <p className="text-white/80 text-sm md:text-base max-w-md">
                {t('promo_desc')}
              </p>
            </div>

            {/* Center - Countdown */}
            <div className="flex gap-3 md:gap-4">
              {timeBlocks.map((block, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-white/15 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 flex items-center justify-center">
                    <span className="text-white text-xl md:text-3xl font-bold tabular-nums">
                      {String(block.value).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-white/70 text-[9px] md:text-xs mt-1.5 font-medium">{block.label}</span>
                </div>
              ))}
            </div>

            {/* Right - CTA */}
            <button
              onClick={scrollToProducts}
              className="flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-white text-red-600 font-bold rounded-full hover:bg-yellow-300 hover:text-black transition-all duration-300 transform hover:scale-105 shadow-xl text-sm md:text-base shrink-0"
            >
              <ShoppingBag size={18} />
              {t('promo_shop')}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PromoBanner;
