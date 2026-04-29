import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const InstallPWA: React.FC = () => {
  const { isDark } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isAppStandalone = (typeof window !== 'undefined' ? window.matchMedia : function(){return {matches:false}})('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isAppStandalone);

    if (isAppStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for Android/Chrome install prompt
    const isDismissedRecently = () => {
      const dismissedAt = (typeof window !== 'undefined' ? localStorage.getItem('pwa_prompt_dismissed') : null);
      if (!dismissedAt) return false;
      const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      return daysSince < 1; // Show again after 1 day
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Delay showing the prompt slightly so it's not too intrusive on first load
      setTimeout(() => {
        if (!isDismissedRecently()) {
          setShowPrompt(true);
        }
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS we just show it if not dismissed
    if (isIOSDevice && !isAppStandalone) {
      setTimeout(() => {
        if (!isDismissedRecently()) {
          setShowPrompt(true);
        }
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowPrompt(false);
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-24 md:bottom-8 left-0 right-0 md:left-auto md:right-8 mx-auto md:mx-0 z-[90] w-[92vw] max-w-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className={`relative p-5 md:p-6 rounded-3xl shadow-2xl border ${isDark ? 'bg-dark-900/95 border-white/10 shadow-black/50' : 'bg-white/95 border-gray-200 shadow-xl'}`}
        >
          <button
            onClick={handleDismiss}
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${isDark ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <X size={16} />
          </button>

          <div className="flex gap-4 md:gap-5 items-start">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shrink-0 overflow-hidden bg-white flex items-center justify-center p-2 shadow-inner border border-gray-100">
              <img src="/logo-light.png" alt="PaketShop App" className="w-full h-full object-contain" />
            </div>
            
            <div className="flex-1">
              <h3 className={`font-bold text-base md:text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>PaketShop Ilovasi</h3>
              <p className={`text-xs md:text-sm leading-relaxed mb-4 pr-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {isIOS 
                  ? "Tezkor ishlash uchun ilovani o'rnating." 
                  : "Saytni qulay ilova (App) ko'rinishida telefoningizga o'rnating."}
              </p>

              {isIOS ? (
                <div className={`text-xs md:text-sm font-medium p-3 rounded-xl ${isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                  Qo'shish uchun pastdagi <Share size={14} className="inline mx-1" /> tugmani bosib <b>"Ekranga qo'shish"</b> (Add to Home Screen) ni tanlang.
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-gold-400 text-black font-bold text-sm md:text-base py-3 md:py-3.5 rounded-xl hover:bg-gold-500 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                >
                  <Download size={18} />
                  O'rnatish (Tez va bepul)
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InstallPWA;
