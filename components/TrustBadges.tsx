import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, CreditCard, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const TrustBadges: React.FC = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const badges = [
    {
      icon: Truck,
      title: t('trust_delivery_title'),
      description: t('trust_delivery_desc'),
      gradient: 'from-blue-500 to-cyan-400',
      bgGlow: 'bg-blue-500/10',
    },
    {
      icon: ShieldCheck,
      title: t('trust_quality_title'),
      description: t('trust_quality_desc'),
      gradient: 'from-emerald-500 to-green-400',
      bgGlow: 'bg-emerald-500/10',
    },
    {
      icon: CreditCard,
      title: t('trust_payment_title'),
      description: t('trust_payment_desc'),
      gradient: 'from-violet-500 to-purple-400',
      bgGlow: 'bg-violet-500/10',
    },
    {
      icon: RefreshCw,
      title: t('trust_return_title'),
      description: t('trust_return_desc'),
      gradient: 'from-amber-500 to-yellow-400',
      bgGlow: 'bg-amber-500/10',
    },
  ];

  return (
    <section className={`py-12 md:py-20 transition-colors duration-300 ${isDark ? 'bg-dark-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="inline-block px-3 py-1 mb-4 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-gold-400 border border-gold-500/30 rounded-full bg-gold-500/10">
            {t('trust_badge_label')}
          </span>
          <h2 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>
            {t('trust_title')} <span className="text-gold-400">{t('trust_title_highlight')}</span>
          </h2>
        </motion.div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`relative group p-5 md:p-8 rounded-2xl md:rounded-3xl border text-center transition-all duration-300 overflow-hidden ${
                isDark
                  ? 'bg-dark-800 border-white/5 hover:border-white/15'
                  : 'bg-light-card border-light-border hover:border-gray-300 hover:shadow-xl'
              }`}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 ${badge.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`} />

              {/* Icon */}
              <div className={`relative z-10 w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-2xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-lg`}>
                <badge.icon size={24} className="text-white md:w-7 md:h-7" strokeWidth={1.8} />
              </div>

              {/* Text */}
              <h3 className={`relative z-10 font-bold text-sm md:text-lg mb-1 md:mb-2 ${isDark ? 'text-white' : 'text-light-text'}`}>
                {badge.title}
              </h3>
              <p className={`relative z-10 text-[11px] md:text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-light-muted'}`}>
                {badge.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
