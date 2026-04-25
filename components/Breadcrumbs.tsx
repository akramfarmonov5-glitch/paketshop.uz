import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../lib/i18nUtils';

interface BreadcrumbsProps {
  items: { label: any; onClick?: () => void; active?: boolean }[];
  onHomeClick: () => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onHomeClick }) => {
  const { lang, t } = useLanguage();
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
      <button 
        onClick={() => window.history.back()}
        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors mr-3 bg-white/5 px-2 py-1 rounded-md"
      >
        <ArrowLeft size={14} />
        <span>{t('back_button') || 'Orqaga'}</span>
      </button>

      <button 
        onClick={onHomeClick}
        className="flex items-center gap-1 hover:text-gold-400 transition-colors"
      >
        <Home size={14} />
        <span>{t('breadcrumb_home')}</span>
      </button>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="mx-2 text-gray-700" />
          <button
            onClick={item.onClick}
            disabled={item.active}
            className={`${
              item.active 
                ? 'text-white font-medium cursor-default' 
                : 'hover:text-gold-400 transition-colors'
            }`}
          >
            {getLocalizedText(item.label, lang)}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;