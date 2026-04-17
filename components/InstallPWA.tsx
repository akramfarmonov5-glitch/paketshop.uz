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
    const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isAppStandalone);

    if (isAppStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for Android/Chrome install prompt
    const isDismissedRecently = () => {
      const dismissedAt = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissedAt) return false;
      const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      return daysSince < 7; // Show again after 7 days
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Delay showing the prompt slightly so it's not too intrusive on first load
      setTimeout(() => {
        if (!isDismissedRecently()) {
          setShowPrompt(true);
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS we just show it if not dismissed
    if (isIOSDevice) {
      setTimeout(() => {
        if (!isDismissedRecently()) {
          setShowPrompt(true);
        }
      }, 5000);
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
      <div className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-[90] max-w-[320px]">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className={`relative p-4 rounded-2xl shadow-2xl border ${isDark ? 'bg-dark-900/95 border-white/10 shadow-black/50' : 'bg-white/95 border-gray-200 shadow-xl'}`}
        >
          <button
            onClick={handleDismiss}
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${isDark ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100'}`}
          >
            <X size={16} />
          </button>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-black flex items-center justify-center p-1">
              <img src="/logo.png" alt="PaketShop App" className="w-full h-full object-contain" />
            </div>
            
            <div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>PaketShop Ilovasi</h3>
              <p className={`text-[11px] leading-tight mt-1 mb-3 pr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {isIOS 
                  ? "Tezkor ishlash uchun ilovani o'rnating." 
                  : "Saytni qulay ilova (App) ko'rinishida telefoningizga o'rnating."}
              </p>

              {isIOS ? (
                <div className={`text-[10px] font-medium p-2 rounded-lg ${isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                  Qo'shish uchun pastdagi <Share size={12} className="inline mx-1" /> tugmani bosib <b>"Ekranga qo'shish"</b> (Add to Home Screen) ni tanlang.
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-gold-400 text-black font-bold text-xs py-2 rounded-lg hover:bg-gold-500 transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                >
                  <Download size={14} />
                  O'rnatish (O'rnatish tez va bepul)
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
