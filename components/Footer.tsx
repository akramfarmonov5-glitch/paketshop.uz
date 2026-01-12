import React from 'react';
import { Instagram, Twitter, Facebook, Mail, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  onAdminClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const { isDark } = useTheme();

  return (
    <footer className={`pt-16 pb-8 border-t transition-colors duration-300 ${isDark ? 'bg-dark-900 border-white/10' : 'bg-light-card border-light-border'}`}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div className="space-y-4">
            <h3 className={`text-2xl font-bold tracking-wider ${isDark ? 'text-white' : 'text-light-text'}`}>
              Paket<span className="text-gold-400">Shop</span>
            </h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-light-muted'}`}>
              Hashamat bu shunchaki ko'rinish emas, bu hayot tarzi. Bizning maqsadimiz sizga eng yaxshisini taqdim etish.
            </p>
          </div>

          <div>
            <h4 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-light-text'}`}>Kategoriyalar</h4>
            <ul className={`space-y-3 text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
              <li><a href="#" className="hover:text-gold-400 transition-colors">Erkaklar</a></li>
              <li><a href="#" className="hover:text-gold-400 transition-colors">Ayollar</a></li>
              <li><a href="#" className="hover:text-gold-400 transition-colors">Soatlar</a></li>
              <li><a href="#" className="hover:text-gold-400 transition-colors">Aksessuarlar</a></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-light-text'}`}>Yordam</h4>
            <ul className={`space-y-3 text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
              <li><a href="#" className="hover:text-gold-400 transition-colors">Yetkazib berish</a></li>
              <li><a href="#" className="hover:text-gold-400 transition-colors">To'lov usullari</a></li>
              <li><a href="#" className="hover:text-gold-400 transition-colors">Qaytarish siyosati</a></li>
              <li><a href="#" className="hover:text-gold-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-light-text'}`}>Biz bilan bog'laning</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-gold-400 hover:text-black transition-all ${isDark ? 'bg-white/5 text-gray-400' : 'bg-light-bg text-light-muted'}`}>
                <Instagram size={18} />
              </a>
              <a href="#" className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-gold-400 hover:text-black transition-all ${isDark ? 'bg-white/5 text-gray-400' : 'bg-light-bg text-light-muted'}`}>
                <Twitter size={18} />
              </a>
              <a href="#" className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-gold-400 hover:text-black transition-all ${isDark ? 'bg-white/5 text-gray-400' : 'bg-light-bg text-light-muted'}`}>
                <Facebook size={18} />
              </a>
            </div>
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
              <Mail size={16} />
              <span>support@paketshop.uz</span>
            </div>
          </div>
        </div>

        <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center text-xs ${isDark ? 'border-white/5 text-gray-600' : 'border-light-border text-light-muted'}`}>
          <p>&copy; 2026 PaketShop.uz. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-6 mt-4 md:mt-0 items-center">
            <a href="#" className="hover:text-gold-400 transition-colors">Maxfiylik siyosati</a>
            <a href="#" className="hover:text-gold-400 transition-colors">Foydalanish shartlari</a>
            {/* Secret Admin Link */}
            {onAdminClick && (
              <button onClick={onAdminClick} className="flex items-center gap-1 hover:text-gold-400 transition-colors ml-4 opacity-50 hover:opacity-100">
                <Lock size={10} />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;