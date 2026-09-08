import React from 'react';
import Link from 'next/link';
import {
  Instagram,
  Facebook,
  Mail,
  Lock,
  Phone,
  MapPin,
  Clock,
  Send,
  Youtube,
  MessageCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_NAVIGATION } from '../constants';
import type { LucideIcon } from 'lucide-react';
import type { NavigationSettings, SocialLink } from '../types';

interface FooterProps {
  onAdminClick?: () => void;
  navigationSettings?: NavigationSettings;
}

const SOCIAL_LINK_META: Record<SocialLink['platform'], { label: string; icon: LucideIcon }> = {
  instagram: { label: 'Instagram', icon: Instagram },
  telegram: { label: 'Telegram', icon: Send },
  facebook: { label: 'Facebook', icon: Facebook },
  youtube: { label: 'YouTube', icon: Youtube },
  twitter: { label: 'Twitter', icon: MessageCircle },
};

const Footer: React.FC<FooterProps> = ({
  onAdminClick,
  navigationSettings = DEFAULT_NAVIGATION,
}) => {
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
              <li><Link href={`/${lang}/catalog?category=chiqindi-paketlari`} className="hover:text-red-600 transition-colors">{lang === 'ru' ? 'Мусорные пакеты' : 'Chiqindi paketlari'}</Link></li>
              <li><Link href={`/${lang}/catalog?category=salfetka-va-qogoz`} className="hover:text-red-600 transition-colors">{lang === 'ru' ? 'Салфетки и бумага' : 'Salfetka va qog‘oz'}</Link></li>
              <li><Link href={`/${lang}/catalog?category=zip-paketlar`} className="hover:text-red-600 transition-colors">{lang === 'ru' ? 'Зип-пакеты' : 'Zip-Lock paketlar'}</Link></li>
              <li><Link href={`/${lang}/catalog?category=ovqat-konteynerlari`} className="hover:text-red-600 transition-colors">{lang === 'ru' ? 'Контейнеры и посуда' : 'Konteynerlar va idishlar'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-slate-900">{t('footer_help')}</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href={`/${lang}/delivery`} className="hover:text-red-600 transition-colors">{lang === 'ru' ? 'Доставка' : 'Yetkazib berish'}</Link></li>
              <li><Link href={`/${lang}/payment`} className="hover:text-red-600 transition-colors">{lang === 'ru' ? 'Способы оплаты' : 'To‘lov usullari'}</Link></li>
              <li><Link href={`/${lang}/faq`} className="hover:text-red-600 transition-colors">FAQ</Link></li>
              <li><Link href={`/${lang}/about`} className="hover:text-red-600 transition-colors">{lang === 'ru' ? 'О нас' : 'Biz haqimizda'}</Link></li>
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
                <span>{lang === 'ru' ? 'г. Ташкент, Узбекистан' : "Toshkent sh., O'zbekiston"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-100">
                  <Clock size={14} className="text-red-600" />
                </div>
                <span>{lang === 'ru' ? 'Пн–Сб: 09:00 – 20:00' : 'Dush–Shan: 09:00 – 20:00'}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {navigationSettings.socialLinks.map((socialLink) => {
                const { label, icon: Icon } = SOCIAL_LINK_META[socialLink.platform];

                return (
                  <a
                    key={socialLink.id}
                    href={socialLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
              <a
                href="mailto:support@paketshop.uz"
                aria-label="Email"
                title="Email"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-red-600 hover:text-white transition-all"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-xs border-slate-200 text-slate-500">
          <div>
            <p>&copy; 2026 PaketShop.uz. {t('all_rights_reserved') || (lang === 'ru' ? 'Все права защищены.' : 'Barcha huquqlar himoyalangan.')}</p>
            <p className="mt-1 text-slate-400">
              {lang === 'ru' ? 'Программное обеспечение и IT-решения: ' : "Dasturiy ta'minot va IT yechimlar: "}
              <a
                href="https://trendoai.uz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 font-semibold hover:underline"
              >
                TrendoAI IT Agentligi
              </a>
            </p>
          </div>
          <div className="flex gap-6 mt-4 md:mt-0 items-center">
            <Link href={`/${lang}/privacy`} className="hover:text-red-600 transition-colors">{lang === 'ru' ? 'Политика конфиденциальности' : 'Maxfiylik siyosati'}</Link>
            <Link href={`/${lang}/terms`} className="hover:text-red-600 transition-colors">{lang === 'ru' ? 'Условия использования' : 'Foydalanish shartlari'}</Link>
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
