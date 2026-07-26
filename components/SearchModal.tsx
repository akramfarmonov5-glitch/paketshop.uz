'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Loader2,
  Search,
  SearchX,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import * as fpixel from '../lib/fpixel';
import { moveSearchSelection } from '../lib/searchSelection';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductSearchSuggestion {
  sku: string;
  name: string;
  url: string;
  price: string;
  image: string;
}

interface CategorySearchSuggestion {
  id: string;
  name: string;
  url: string;
  image: string;
}

interface SearchResponse {
  suggestions?: ProductSearchSuggestion[];
  categories?: CategorySearchSuggestion[];
}

interface SearchTarget {
  key: string;
  url: string;
}

const SEARCH_DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [productResults, setProductResults] = useState<ProductSearchSuggestion[]>([]);
  const [categoryResults, setCategoryResults] = useState<CategorySearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();
  const { lang, t } = useLanguage();
  const router = useRouter();
  const trimmedQuery = query.trim();

  const searchTargets = useMemo<SearchTarget[]>(() => [
    ...categoryResults.map((category) => ({
      key: `category-${category.id}`,
      url: category.url,
    })),
    ...productResults.map((product) => ({
      key: `product-${product.sku}`,
      url: product.url,
    })),
  ], [categoryResults, productResults]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setProductResults([]);
      setCategoryResults([]);
      setActiveIndex(-1);
      return;
    }

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 100);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (trimmedQuery.length <= 2) return;
    const trackingTimer = window.setTimeout(
      () => fpixel.trackSearch(trimmedQuery),
      1000,
    );
    return () => window.clearTimeout(trackingTimer);
  }, [trimmedQuery]);

  useEffect(() => {
    setProductResults([]);
    setCategoryResults([]);
    setActiveIndex(-1);
    setSearchError(false);

    if (!isOpen || trimmedQuery.length < MIN_QUERY_LENGTH) {
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const searchTimer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(trimmedQuery)}&lang=${lang}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Search failed with ${response.status}`);

        const payload = await response.json() as SearchResponse;
        if (controller.signal.aborted) return;

        setProductResults(Array.isArray(payload.suggestions) ? payload.suggestions : []);
        setCategoryResults(Array.isArray(payload.categories) ? payload.categories : []);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Search request failed:', error);
        setSearchError(true);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(searchTimer);
      controller.abort();
    };
  }, [isOpen, lang, trimmedQuery]);

  useEffect(() => {
    setActiveIndex(searchTargets.length > 0 ? 0 : -1);
  }, [searchTargets]);

  const popularSuggestions = lang === 'ru'
    ? ['Пакеты', 'Стаканы', 'Контейнеры', 'Салфетки']
    : ['Paketlar', 'Stakanlar', 'Konteynerlar', 'Salfetkalar'];

  const navigateToResult = (url: string) => {
    router.push(url);
    onClose();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => moveSearchSelection(
        current,
        searchTargets.length,
        event.key === 'ArrowDown' ? 1 : -1,
      ));
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const target = searchTargets[activeIndex];
      if (target) navigateToResult(target.url);
    }
  };

  const hasResults = searchTargets.length > 0;
  const showEmptyState = trimmedQuery.length >= MIN_QUERY_LENGTH
    && !isSearching
    && !searchError
    && !hasResults;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-4 md:pt-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'ru' ? 'Поиск' : 'Qidiruv'}
            className={`relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border shadow-2xl ${
              isDark ? 'border-white/10 bg-dark-900' : 'border-light-border bg-white'
            }`}
          >
            <div className={`flex items-center gap-4 border-b p-6 ${
              isDark ? 'border-white/10' : 'border-light-border'
            }`}
            >
              <div className={`flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                isDark
                  ? 'border-white/10 bg-dark-800 text-white focus-within:border-gold-400 focus-within:ring-1 focus-within:ring-gold-400'
                  : 'border-transparent bg-gray-100 text-light-text focus-within:border-gold-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-gold-400'
              }`}
              >
                <Search className={isDark ? 'text-gray-400' : 'text-gray-500'} size={22} />
                <input
                  ref={inputRef}
                  type="search"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-controls="search-results"
                  aria-expanded={hasResults}
                  aria-activedescendant={
                    activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
                  }
                  placeholder={t('search_placeholder')}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  className="w-full flex-1 bg-transparent text-lg placeholder:text-gray-400 focus:outline-none"
                />
                {isSearching && (
                  <Loader2
                    size={18}
                    aria-label={lang === 'ru' ? 'Поиск' : 'Qidirilmoqda'}
                    className="animate-spin text-gold-400"
                  />
                )}
                {query && !isSearching && (
                  <button
                    type="button"
                    aria-label={lang === 'ru' ? 'Очистить поиск' : 'Qidiruvni tozalash'}
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    className={`rounded-full p-1 transition-colors ${
                      isDark
                        ? 'text-gray-400 hover:bg-black/10 hover:text-white'
                        : 'text-gray-500 hover:bg-black/10 hover:text-black'
                    }`}
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>

              <button
                type="button"
                aria-label={lang === 'ru' ? 'Закрыть' : 'Yopish'}
                onClick={onClose}
                className={`shrink-0 rounded-xl p-3 transition-colors ${
                  isDark
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    : 'bg-gray-100 text-light-muted hover:bg-gray-200 hover:text-light-text'
                }`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
              {!trimmedQuery && (
                <div>
                  <h3 className={`mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
                    isDark ? 'text-gray-500' : 'text-light-muted'
                  }`}
                  >
                    <TrendingUp size={14} /> {t('popular_searches')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSuggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setQuery(item)}
                        className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                          isDark
                            ? 'border-white/5 bg-white/5 text-gray-300 hover:bg-gold-400/10 hover:text-gold-400'
                            : 'border-light-border bg-light-card text-light-text hover:bg-gold-400/10 hover:text-gold-400'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {trimmedQuery.length === 1 && (
                <p className={`py-8 text-center text-sm ${
                  isDark ? 'text-gray-500' : 'text-light-muted'
                }`}
                >
                  {lang === 'ru'
                    ? 'Введите минимум 2 символа.'
                    : 'Kamida 2 ta belgi kiriting.'}
                </p>
              )}

              {searchError && (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <SearchX size={32} className="mb-4 text-red-400" />
                  <p className={isDark ? 'text-gray-400' : 'text-light-muted'}>
                    {lang === 'ru'
                      ? 'Поиск временно недоступен. Попробуйте ещё раз.'
                      : 'Qidiruv vaqtincha ishlamayapti. Qayta urinib ko‘ring.'}
                  </p>
                </div>
              )}

              {showEmptyState && (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                    isDark ? 'bg-white/5' : 'bg-gray-100'
                  }`}
                  >
                    <SearchX size={32} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                  </div>
                  <h3 className={`mb-2 text-lg font-bold ${
                    isDark ? 'text-white' : 'text-light-text'
                  }`}
                  >
                    {t('nothing_found')}
                  </h3>
                  <p className={`max-w-xs text-sm ${
                    isDark ? 'text-gray-500' : 'text-light-muted'
                  }`}
                  >
                    {lang === 'ru'
                      ? 'Попробуйте другое слово или откройте каталог.'
                      : 'Boshqa so‘z bilan qidiring yoki katalogdan foydalaning.'}
                  </p>
                </div>
              )}

              {hasResults && (
                <div id="search-results" role="listbox" className="space-y-8">
                  {categoryResults.length > 0 && (
                    <section aria-labelledby="search-categories-title">
                      <h3
                        id="search-categories-title"
                        className={`mb-3 text-xs font-bold uppercase tracking-widest ${
                          isDark ? 'text-gray-500' : 'text-light-muted'
                        }`}
                      >
                        {t('categories')}
                      </h3>
                      <div className="space-y-2">
                        {categoryResults.map((category, index) => (
                          <button
                            key={category.id}
                            id={`search-result-${index}`}
                            type="button"
                            role="option"
                            aria-selected={activeIndex === index}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => navigateToResult(category.url)}
                            className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                              activeIndex === index
                                ? isDark ? 'bg-white/10' : 'bg-light-card'
                                : isDark ? 'hover:bg-white/5' : 'hover:bg-light-card'
                            }`}
                          >
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-800">
                              <img
                                src={category.image || '/logo.png'}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span className={`font-medium transition-colors ${
                              isDark ? 'text-white' : 'text-light-text'
                            }`}
                            >
                              {category.name}
                            </span>
                            <ArrowRight
                              size={16}
                              className={`ml-auto ${
                                activeIndex === index
                                  ? 'text-gold-400'
                                  : isDark ? 'text-gray-600' : 'text-light-muted'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {productResults.length > 0 && (
                    <section aria-labelledby="search-products-title">
                      <h3
                        id="search-products-title"
                        className={`mb-3 text-xs font-bold uppercase tracking-widest ${
                          isDark ? 'text-gray-500' : 'text-light-muted'
                        }`}
                      >
                        {t('products')}
                      </h3>
                      <div className="space-y-2">
                        {productResults.map((product, productIndex) => {
                          const index = categoryResults.length + productIndex;
                          return (
                            <button
                              key={`${product.sku}-${product.url}`}
                              id={`search-result-${index}`}
                              type="button"
                              role="option"
                              aria-selected={activeIndex === index}
                              onMouseEnter={() => setActiveIndex(index)}
                              onClick={() => navigateToResult(product.url)}
                              className={`flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors ${
                                activeIndex === index
                                  ? isDark ? 'bg-white/10' : 'bg-light-card'
                                  : isDark ? 'hover:bg-white/5' : 'hover:bg-light-card'
                              }`}
                            >
                              <div className={`aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-lg border ${
                                isDark
                                  ? 'border-white/5 bg-gray-800'
                                  : 'border-light-border bg-light-card'
                              }`}
                              >
                                <img
                                  src={product.image || '/logo.png'}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className={`truncate font-medium ${
                                  isDark ? 'text-white' : 'text-light-text'
                                }`}
                                >
                                  {product.name}
                                </h4>
                                <p className={`text-xs ${
                                  isDark ? 'text-gray-500' : 'text-light-muted'
                                }`}
                                >
                                  {product.sku}
                                </p>
                              </div>
                              <span className="shrink-0 text-right text-sm font-bold text-gold-400">
                                {product.price}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 bg-black/20 p-4 text-center text-xs text-gray-500">
              <span className="hidden md:inline">
                {lang === 'ru'
                  ? '↑/↓ — выбор, Enter — открыть, ESC — закрыть'
                  : '↑/↓ — tanlash, Enter — ochish, ESC — yopish'}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
