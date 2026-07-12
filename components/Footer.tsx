import React from 'react';
import { Instagram, Facebook, Mail, Lock, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onAdminClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const { t, lang } = useLanguage();

  return (
    <footer className="pt-16 pb-8 border-t bg-white border-slate-200">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-wider text-slate-900">
              Paket<span className="text-red-600">Shop</span>
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              {t('footer_desc')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-slate-900">{t('footer_categories')}</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href={`/${lang}/catalog?category=chiqindi-paketlari`} className="hover:text-red-600 transition-colors">Chiqindi paketlari</a></li>
              <li><a href={`/${lang}/catalog?category=salfetka-va-qogoz`} className="hover:text-red-600 transition-colors">Salfetka va qog‘oz</a></li>
              <li><a href={`/${lang}/catalog?category=zip-paketlar`} className="hover:text-red-600 transition-colors">Zip-Lock paketlar</a></li>
              <li><a href={`/${lang}/catalog?category=ovqat-konteynerlari`} className="hover:text-red-600 transition-colors">Konteynerlar va idishlar</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-slate-900">{t('footer_help')}</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href={`/${lang}/delivery`} className="hover:text-red-600 transition-colors">Yetkazib berish</a></li>
              <li><a href={`/${lang}/payment`} className="hover:text-red-600 transition-colors">To‘lov usullari</a></li>
              <li><a href={`/${lang}/faq`} className="hover:text-red-600 transition-colors">FAQ</a></li>
              <li><a href={`/${lang}/about`} className="hover:text-red-600 transition-colors">Biz haqimizda</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-slate-900">{t('footer_contact')}</h4>

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <a href="tel:+998996448444" className="flex items-center gap-3 text-sm group text-slate-600">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-100 group-hover:bg-red-50 transition-colors">
                  <Phone size={14} className="text-red-600" />
                </div>
                <span className="group-hover:text-red-600 transition-colors">+998 99 644 84 44</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-100">
                  <MapPin size={14} className="text-red-600" />
                </div>
                <span>Toshkent sh., O'zbekiston</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-100">
                  <Clock size={14} className="text-red-600" />
                </div>
                <span>Dush–Shan: 09:00 – 20:00</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white transition-all">
                <Instagram size={16} />
              </a>
              <a href="https://t.me/paketshopuz" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white transition-all">
                <Send size={16} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white transition-all">
                <Facebook size={16} />
              </a>
              <a href="mailto:support@paketshop.uz" className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white transition-all">
                <Mail size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-xs border-slate-200 text-slate-500">
          <p>&copy; 2026 PaketShop.uz. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-6 mt-4 md:mt-0 items-center">
            <a href={`/${lang}/privacy`} className="hover:text-red-600 transition-colors">Maxfiylik siyosati</a>
            <a href={`/${lang}/terms`} className="hover:text-red-600 transition-colors">Foydalanish shartlari</a>
            {/* Secret Admin Link */}
            {onAdminClick && (
              <button onClick={onAdminClick} className="flex items-center gap-1 hover:text-red-600 transition-colors ml-4 opacity-50 hover:opacity-100">
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
