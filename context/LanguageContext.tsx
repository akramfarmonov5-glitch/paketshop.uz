import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'uz' | 'ru' | 'en';

interface Translations {
    [key: string]: {
        [key in Language]: string;
    };
}

const translations: Translations = {
    // Navigation
    nav_home: { uz: 'Bosh sahifa', ru: 'Главная', en: 'Home' },
    nav_catalog: { uz: 'Katalog', ru: 'Каталог', en: 'Catalog' },
    nav_blog: { uz: 'Blog', ru: 'Блог', en: 'Blog' },
    nav_tracking: { uz: 'Kuzatish', ru: 'Отслеживание', en: 'Tracking' },
    nav_contact: { uz: 'Bog\'lanish', ru: 'Kontakt', en: 'Contact' },

    // Hero & General UI
    hero_title_suffix: { uz: 'Olamiga Xush Kelibsiz', ru: 'Добро Пожаловать', en: 'Welcome' },
    shop_now: { uz: 'Hozir Xarid Qilish', ru: 'Купить Сейчас', en: 'Shop Now' },
    add_to_cart: { uz: 'Savatga', ru: 'В Корзину', en: 'Add to Cart' },

    // Footer
    footer_desc: { uz: 'Hashamat bu shunchaki ko\'rinish emas, bu hayot tarzi. Bizning maqsadimiz sizga eng yaxshisini taqdim etish.', ru: 'Роскошь — это не просто вид, это образ жизни. Наша цель — предоставить вам лучшее.', en: 'Luxury is not just a look, it is a lifestyle. Our goal is to provide you with the best.' },
    footer_categories: { uz: 'Kategoriyalar', ru: 'Категории', en: 'Categories' },
    footer_help: { uz: 'Yordam', ru: 'Помощь', en: 'Help' },
    footer_contact: { uz: 'Bog\'lanish', ru: 'Контакты', en: 'Contact Us' },

    // Product Detail
    tech_specs: { uz: 'Texnik Xususiyatlar', ru: 'Технические Характеристики', en: 'Technical Specs' },
    related_products: { uz: 'O\'xshash Mahsulotlar', ru: 'Похожие Tovarlar', en: 'Related Products' },
    ai_analysis: { uz: 'GEMINI AI TAHLILI', ru: 'АНАЛИЗ GEMINI AI', en: 'GEMINI AI ANALYSIS' },
    video_review: { uz: 'VIDEO SHARH', ru: 'ВИДЕО ОБЗОР', en: 'VIDEO REVIEW' },

    // Cart & Checkout
    cart_title: { uz: 'Savatcha', ru: 'Корзина', en: 'Cart' },
    cart_empty: { uz: 'Savatchangiz bo\'sh', ru: 'Ваша корзина пуста', en: 'Your cart is empty' },
    checkout_title: { uz: 'Rasmiylashtirish', ru: 'Оформление', en: 'Checkout' },
    total_sum: { uz: 'Jami summa', ru: 'Итоговая сумма', en: 'Total Amount' },

    // Collection & Filters
    premium_collection: { uz: 'Premium To\'plam', ru: 'Премиум Коллекция', en: 'Premium Collection' },
    collection_desc: { uz: 'Eksklyuziv dizayn va yuqori sifat uyg\'unligi.', ru: 'Сочетание эксклюзивного дизайна и высокого качества.', en: 'A combination of exclusive design and high quality.' },
    all_categories: { uz: 'Barchasi', ru: 'Все', en: 'All' },
    no_products_found: { uz: 'Mahsulotlar topilmadi.', ru: 'Товары не найдены.', en: 'No products found.' },
    view_all: { uz: 'Barchasini ko\'rish', ru: 'Посмотреть все', en: 'View All' },
    filter: { uz: 'Filtr', ru: 'Фильтр', en: 'Filter' },
    search_placeholder: { uz: 'Qidirish...', ru: 'Поиск...', en: 'Search...' },

    // Product Status & Features
    stock_in: { uz: 'dona', ru: 'шт', en: 'pcs' },
    in_stock: { uz: 'Mavjud', ru: 'В наличии', en: 'In Stock' },
    out_of_stock: { uz: 'Mavjud emas', ru: 'Нет в наличии', en: 'Out of Stock' },
    buy_now: { uz: 'Hozir olish', ru: 'Купить сейчас', en: 'Buy Now' },
    premium_warranty: { uz: 'Premium Kafolat', ru: 'Премиум Гарантия', en: 'Premium Warranty' },
    free_delivery: { uz: 'Bepul Yetkazish', ru: 'Бесплатная Доставка', en: 'Free Delivery' },
    eco_package: { uz: 'Eko-qadoq', ru: 'Эко-упаковка', en: 'Eco-package' },
    recommendations: { uz: 'Tavsiyalar', ru: 'Рекомендации', en: 'Recommendations' },
    video_error: { uz: 'Agar video ishlamasa, YouTube orqali ko\'ring', ru: 'Если video ne ishlayotgan bo\'lsa, YouTube da ko\'ring', en: 'If video doesn\'t work, watch on YouTube' },

    // Toast Messages
    toast_added_to_cart: { uz: 'Mahsulot savatchaga qo\'shildi', ru: 'Товар добавлен в корзину', en: 'Product added to cart' },
    toast_added_to_wishlist: { uz: 'Sevimlilarga qo\'shildi', ru: 'Добавлено в избранное', en: 'Added to wishlist' },
    toast_removed_from_wishlist: { uz: 'Sevimlilardan olib tashlandi', ru: 'Удалено из избранного', en: 'Removed from wishlist' },

    // Missing Keys
    search: { uz: 'Qidiruv', ru: 'Поиск', en: 'Search' },
    wishlist: { uz: 'Sevimlilar', ru: 'Избранное', en: 'Wishlist' },
    profile: { uz: 'Profil', ru: 'Профиль', en: 'Profile' },
    choose_language: { uz: 'Tilni tanlang', ru: 'Выберите язык', en: 'Choose Language' },
    theme_light: { uz: 'Yorug\' tema', ru: 'Светлая тема', en: 'Light Theme' },
    theme_dark: { uz: 'Qorong\'u tema', ru: 'Темная тема', en: 'Dark Theme' },
    follow_us: { uz: 'Bizni kuzating', ru: 'Подписывайтесь на нас', en: 'Follow Us' },
    all_rights_reserved: { uz: 'Barcha huquqlar himoyalangan', ru: 'Все права защищены', en: 'All rights reserved' },
    meta_title: { uz: 'PaketShop.uz | Online Do\'kon - O\'zbekistondagi Sifatli Mahsulotlar', ru: 'PaketShop.uz | Онлайн Магазин - Качественные Товары в Узбекистане', en: 'PaketShop.uz | Online Store - Quality Products in Uzbekistan' },
    meta_description: { uz: 'PaketShop.uz - O\'zbekistondagi ishonchli onlayn do\'kon. Soatlar, sumkalar, parfyumeriya va boshqa sifatli mahsulotlar.', ru: 'PaketShop.uz - надежный онлайн-магазин в Узбекистане. Часы, сумки, парфюмерия и другие качественные товары.', en: 'PaketShop.uz - reliable online store in Uzbekistan. Watches, bags, perfumes and other quality products.' },
    premium_series: { uz: 'Premium Seriya', ru: 'Премиум Серия', en: 'Premium Series' },
    limited_edition: { uz: 'Maxsus Nashr', ru: 'Лимитированная Серия', en: 'Limited Edition' },
    collection_2026: { uz: '2026 To\'plami', ru: 'Коллекция 2026', en: '2026 Collection' },
    popular_searches: { uz: 'Ommabop qidiruvlar', ru: 'Популярные запросы', en: 'Popular searches' },
    search_help: { uz: 'Tanlash uchun Enter, chiqish uchun ESC bosing', ru: 'Нажмите Enter для выбора, ESC для выхода', en: 'Press Enter to select, ESC to exit' },
    categories: { uz: 'Kategoriyalar', ru: 'Категории', en: 'Categories' },
    products: { uz: 'Mahsulotlar', ru: 'Товары', en: 'Products' },
    nothing_found: { uz: 'Hech narsa topilmadi.', ru: 'Ничего не найдено.', en: 'Nothing found.' },
};

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lang, setLangState] = useState<Language>(() => {
        const saved = localStorage.getItem('paketshop_lang');
        return (saved as Language) || 'uz';
    });

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('paketshop_lang', newLang);
        document.documentElement.lang = newLang;
    };

    const t = (key: string): string => {
        return translations[key]?.[lang] || key;
    };

    useEffect(() => {
        document.documentElement.lang = lang;

        // Update SEO Meta Tags
        const title = t('meta_title');
        const desc = t('meta_description');

        if (title) {
            document.title = title;
            const metaTitle = document.querySelector('meta[name="title"]');
            if (metaTitle) metaTitle.setAttribute('content', title);
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.setAttribute('content', title);
            const twitterTitle = document.querySelector('meta[property="twitter:title"]');
            if (twitterTitle) twitterTitle.setAttribute('content', title);
        }

        if (desc) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', desc);
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.setAttribute('content', desc);
            const twitterDesc = document.querySelector('meta[property="twitter:description"]');
            if (twitterDesc) twitterDesc.setAttribute('content', desc);
        }

        // Update og:locale
        const ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale) {
            const localeMap = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_US' };
            ogLocale.setAttribute('content', localeMap[lang]);
        }
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
