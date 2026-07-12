'use client';
import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Phone, Send, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NavbarProps {
  onNavigateHome: () => void;
  navigationSettings?: any;
  onProfileClick?: () => void;
  onSearchClick?: () => void;
  onWishlistClick?: () => void;
  onTrackingClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigateHome, onSearchClick }) => {
  const { cartCount, toggleCart } = useCart();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const languages = [
    { code: 'uz' as const, label: 'UZ' },
    { code: 'ru' as const, label: 'RU' },
  ];

  const navLinks = [
    { path: 'catalog', label: t('nav_catalog') },
    { path: 'wholesale', label: t('nav_wholesale') },
    { path: 'organizations', label: t('nav_organizations') },
    { path: 'starter-kits', label: t('nav_starter_kits') },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="border-b border-slate-100 bg-slate-50 text-xs text-slate-600">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <span>{lang === 'ru' ? 'Пн–Сб, 09:00–20:00' : 'Dush–Sha, 09:00–20:00'}</span>
          <div className="flex items-center gap-4">
            <a href="tel:+998996448444" className="flex items-center gap-1 font-medium hover:text-red-700">
              <Phone size={13} />+998 99 644 84 44
            </a>
            <a href="https://t.me/paketshopuz" target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium hover:text-red-700">
              <Send size={13} />Telegram
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href={`/${lang}`} onClick={onNavigateHome} className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900">
              Paket<span className="text-red-600">Shop</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={`/${lang}/${link.path}`}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-red-700"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search bar (desktop) */}
          <button
            onClick={onSearchClick}
            className="hidden flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400 hover:border-red-300 sm:flex lg:max-w-md"
          >
            <Search size={18} />
            {t('search_placeholder')}
          </button>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex rounded-lg border border-slate-200 text-sm font-bold">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    router.push(`/${l.code}${window.location.pathname.replace(/^\/(uz|ru)/, '')}`);
                  }}
                  className={`px-2.5 py-1.5 transition-colors ${
                    lang === l.code
                      ? 'bg-red-600 text-white'
                      : 'text-slate-600 hover:text-red-700'
                  } ${l.code === 'uz' ? 'rounded-l-lg' : 'rounded-r-lg'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Mobile search */}
            <button
              onClick={onSearchClick}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 sm:hidden"
              aria-label={t('search')}
            >
              <Search size={22} />
            </button>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100"
              aria-label={t('cart_title')}
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-200 px-5 py-4">
              <span className="text-lg font-black text-slate-900">
                Paket<span className="text-red-600">Shop</span>
              </span>
            </div>
            <div className="px-3 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={`/${lang}/${link.path}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 font-semibold text-slate-800 hover:bg-slate-100"
                >
                  {link.label}
                  <ChevronRight size={18} className="text-slate-400" />
                </Link>
              ))}
              <hr className="my-3 border-slate-100" />
              <Link
                href={`/${lang}/delivery`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-100"
              >
                {lang === 'ru' ? 'Доставка' : 'Yetkazish'}
                <ChevronRight size={16} className="text-slate-400" />
              </Link>
              <Link
                href={`/${lang}/payment`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-100"
              >
                {lang === 'ru' ? 'Оплата' : "To'lov"}
                <ChevronRight size={16} className="text-slate-400" />
              </Link>
              <Link
                href={`/${lang}/about`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-100"
              >
                {lang === 'ru' ? 'О нас' : 'Biz haqimizda'}
                <ChevronRight size={16} className="text-slate-400" />
              </Link>
              <Link
                href={`/${lang}/contact`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-100"
              >
                {lang === 'ru' ? 'Контакты' : "Bog'lanish"}
                <ChevronRight size={16} className="text-slate-400" />
              </Link>
            </div>
            <div className="border-t border-slate-100 px-5 py-4">
              <a
                href="tel:+998996448444"
                className="flex items-center gap-2 text-sm font-bold text-slate-800"
              >
                <Phone size={16} className="text-red-600" />
                +998 99 644 84 44
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
