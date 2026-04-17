import React from 'react';
import { Instagram, Twitter, Facebook, Mail, Lock, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onAdminClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <footer className={`pt-16 pb-8 border-t transition-colors duration-300 ${isDark ? 'bg-dark-900 border-white/10' : 'bg-light-card border-light-border'}`}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div className="space-y-4">
            <h3 className={`text-2xl font-bold tracking-wider ${isDark ? 'text-white' : 'text-light-text'}`}>
              Paket<span className="text-gold-400">Shop</span>
            </h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-light-muted'}`}>
              {t('footer_desc')}
            </p>
          </div>

          <div>
            <h4 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-light-text'}`}>{t('footer_categories')}</h4>
            <ul className={`space-y-3 text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
              <li><a href="#!" className="hover:text-gold-400 transition-colors">Chiqindi paketlari</a></li>
              <li><a href="#!" className="hover:text-gold-400 transition-colors">Salfetka va lattalar</a></li>
              <li><a href="#!" className="hover:text-gold-400 transition-colors">Zip-Lock paketlar</a></li>
              <li><a href="#!" className="hover:text-gold-400 transition-colors">Konteynerlar va idishlar</a></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-light-text'}`}>{t('footer_help')}</h4>
            <ul className={`space-y-3 text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
              <li><a href="#!" className="hover:text-gold-400 transition-colors">Yetkazib berish</a></li>
              <li><a href="#!" className="hover:text-gold-400 transition-colors">To'lov usullari</a></li>
              <li><a href="#!" className="hover:text-gold-400 transition-colors">Qaytarish siyosati</a></li>
              <li><a href="#!" className="hover:text-gold-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold mb-6 ${isDark ? 'text-white' : 'text-light-text'}`}>{t('footer_contact')}</h4>

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <a href="tel:+998901234567" className={`flex items-center gap-3 text-sm group ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-light-bg'}`}>
                  <Phone size={14} className="text-gold-400" />
                </div>
                <span className="group-hover:text-gold-400 transition-colors">+998 90 123 45 67</span>
              </a>
              <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-light-bg'}`}>
                  <MapPin size={14} className="text-gold-400" />
                </div>
                <span>Toshkent sh., O'zbekiston</span>
              </div>
              <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-light-bg'}`}>
                  <Clock size={14} className="text-gold-400" />
                </div>
                <span>Dush–Shan: 09:00 – 20:00</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-gold-400 hover:text-black transition-all ${isDark ? 'bg-white/5 text-gray-400' : 'bg-light-bg text-light-muted'}`}>
                <Instagram size={16} />
              </a>
              <a href="https://t.me/paketshopuz" target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-gold-400 hover:text-black transition-all ${isDark ? 'bg-white/5 text-gray-400' : 'bg-light-bg text-light-muted'}`}>
                <Send size={16} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-gold-400 hover:text-black transition-all ${isDark ? 'bg-white/5 text-gray-400' : 'bg-light-bg text-light-muted'}`}>
                <Facebook size={16} />
              </a>
              <a href="mailto:support@paketshop.uz" className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-gold-400 hover:text-black transition-all ${isDark ? 'bg-white/5 text-gray-400' : 'bg-light-bg text-light-muted'}`}>
                <Mail size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center text-xs ${isDark ? 'border-white/5 text-gray-600' : 'border-light-border text-light-muted'}`}>
          <p>&copy; 2026 PaketShop.uz. {t('all_rights_reserved')}.</p>
          <div className="flex gap-6 mt-4 md:mt-0 items-center">
            <a href="#!" className="hover:text-gold-400 transition-colors">Maxfiylik siyosati</a>
            <a href="#!" className="hover:text-gold-400 transition-colors">Foydalanish shartlari</a>
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