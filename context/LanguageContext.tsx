'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isSeoLanguage, LOCALE_BY_LANG, SeoLanguage, withLanguagePrefix } from '../lib/seoLanguage';

type Language = SeoLanguage;

interface Translations {
    [key: string]: {
        [key in Language]: string;
    };
}

const translations: Translations = {
    // Navigation
    nav_home: { uz: 'Bosh sahifa', ru: 'Главная' },
    nav_catalog: { uz: 'Katalog', ru: 'Каталог' },
    nav_blog: { uz: 'Blog', ru: 'Блог' },
    nav_tracking: { uz: 'Kuzatish', ru: 'Отслеживание' },
    nav_contact: { uz: 'Bog\'lanish', ru: 'Контакт' },
    nav_wholesale: { uz: 'Ulgurji', ru: 'Оптом' },
    nav_organizations: { uz: 'Tashkilotlarga', ru: 'Организациям' },
    nav_starter_kits: { uz: 'Start to\'plamlar', ru: 'Стартовые наборы' },

    // Hero & General UI
    hero_eyebrow: { uz: 'PaketShop.uz ulgurji katalogi', ru: 'Оптовый каталог PaketShop.uz' },
    hero_title: { uz: 'Bir martalik idishlar va qadoqlash mahsulotlari ulgurji savdosi', ru: 'Оптовая продажа одноразовой посуды и упаковочных материалов' },
    hero_description: { uz: 'Kafe, savdo nuqtalari, tashkilotlar va qayta sotuvchilar uchun ombordagi va buyurtma asosidagi mahsulotlar.', ru: 'Товары со склада и под заказ для кафе, торговых точек, организаций и реселлеров.' },
    view_catalog: { uz: 'Katalogni ko\'rish', ru: 'Открыть каталог' },
    ask_price_telegram: { uz: 'Telegram orqali narx olish', ru: 'Узнать цену в Telegram' },
    add_to_cart: { uz: 'Savatga', ru: 'В корзину' },

    // Footer
    footer_desc: { uz: 'Qadoqlash, bir martalik idishlar va xo\'jalik sarf materiallarini ulgurji yetkazib beramiz.', ru: 'Оптовая поставка упаковки, одноразовой посуды и хозяйственных расходных материалов.' },
    footer_categories: { uz: 'Kategoriyalar', ru: 'Категории' },
    footer_help: { uz: 'Ma\'lumot', ru: 'Информация' },
    footer_contact: { uz: 'Bog\'lanish', ru: 'Контакты' },

    // Product Detail
    tech_specs: { uz: 'Texnik xususiyatlar', ru: 'Технические характеристики' },
    related_products: { uz: 'O\'xshash mahsulotlar', ru: 'Похожие товары' },
    description_label: { uz: 'Tavsif', ru: 'Описание' },
    pack_info: { uz: 'Qadoq ma\'lumoti', ru: 'Информация об упаковке' },
    per_pack: { uz: 'Qadoqda', ru: 'В упаковке' },
    per_carton: { uz: 'Korobkada', ru: 'В коробке' },
    price_per_pack: { uz: '1 qadoq narxi', ru: 'Цена за 1 упаковку' },
    approx_per_piece: { uz: 'Taxminiy 1 dona narxi', ru: 'Примерная цена за 1 шт' },
    ask_price: { uz: 'Narxni aniqlang', ru: 'Уточнить цену' },
    order_via_telegram: { uz: 'Telegram orqali buyurtma', ru: 'Заказать через Telegram' },
    call_us: { uz: 'Telefon qilish', ru: 'Позвонить' },
    stock_confirmed: { uz: 'Qoldiqni menejer tasdiqlaydi', ru: 'Наличие подтверждает менеджер' },

    // Availability statuses
    status_in_stock: { uz: 'Omborda mavjud', ru: 'В наличии' },
    status_low_stock: { uz: 'Kam qoldi', ru: 'Мало' },
    status_check: { uz: 'Qoldiqni aniqlang', ru: 'Уточнить наличие' },
    status_on_order: { uz: 'Buyurtma asosida', ru: 'Под заказ' },
    status_out: { uz: 'Vaqtincha yo\'q', ru: 'Временно нет' },
    status_discontinued: { uz: 'Sotuvdan chiqarilgan', ru: 'Снято с продажи' },

    // Cart & Checkout
    cart_title: { uz: 'Savatcha', ru: 'Корзина' },
    cart_items_count: { uz: 'ta mahsulot', ru: 'товаров' },
    continue_shopping: { uz: 'Xaridni davom ettirish', ru: 'Продолжить покупки' },
    cart_empty: { uz: 'Savatchangiz bo\'sh', ru: 'Ваша корзина пуста' },
    cart_empty_desc: { uz: 'Buyurtma so\'rovi yuborish uchun avval mahsulot tanlang.', ru: 'Выберите товары для отправки запроса на заказ.' },
    checkout_title: { uz: 'Buyurtma so\'rovi', ru: 'Запрос на заказ' },
    total_sum: { uz: 'Jami taxminiy summa', ru: 'Примерная сумма' },

    // Checkout form
    checkout_name: { uz: 'Ism yoki kompaniya nomi', ru: 'Имя или название компании' },
    checkout_phone: { uz: 'Telefon raqam', ru: 'Номер телефона' },
    checkout_telegram: { uz: 'Telegram username (ixtiyoriy)', ru: 'Telegram username (необязательно)' },
    checkout_region: { uz: 'Shahar yoki viloyat', ru: 'Город или область' },
    checkout_delivery_type: { uz: 'Yetkazish turi', ru: 'Тип доставки' },
    checkout_note: { uz: 'Izoh', ru: 'Комментарий' },
    checkout_consent: { uz: 'Ma\'lumotlarim qayta ishlanishiga roziman', ru: 'Согласен на обработку данных' },
    checkout_submit: { uz: 'Buyurtma so\'rovini yuborish', ru: 'Отправить запрос на заказ' },
    checkout_success_title: { uz: 'So\'rovingiz qabul qilindi!', ru: 'Ваш запрос принят!' },
    checkout_success_desc: { uz: 'Menejerlarimiz tez orada siz bilan bog\'lanishadi.', ru: 'Наши менеджеры скоро свяжутся с вами.' },

    // Customer types
    customer_individual: { uz: 'Jismoniy shaxs', ru: 'Физическое лицо' },
    customer_entrepreneur: { uz: 'Yakka tartibdagi tadbirkor', ru: 'Индивидуальный предприниматель' },
    customer_organization: { uz: 'Tashkilot', ru: 'Организация' },
    customer_reseller: { uz: 'Qayta sotuvchi', ru: 'Реселлер' },

    // Delivery types
    delivery_pickup: { uz: 'Do\'kondan olib ketish', ru: 'Самовывоз' },
    delivery_tashkent: { uz: 'Toshkent bo\'yicha kuryer', ru: 'Курьер по Ташкенту' },
    delivery_yandex: { uz: 'Yandex orqali', ru: 'Через Яндекс' },
    delivery_region: { uz: 'Viloyatga kargo', ru: 'Карго в регион' },
    delivery_truck: { uz: 'Yuk mashinasigacha', ru: 'До грузового авто' },
    delivery_individual: { uz: 'Individual kelishuv', ru: 'Индивидуально' },

    // Collection & Filters
    all_categories: { uz: 'Barchasi', ru: 'Все' },
    no_products_found: { uz: 'Mahsulotlar topilmadi.', ru: 'Товары не найдены.' },
    view_all: { uz: 'Barchasini ko\'rish', ru: 'Смотреть все' },
    filter: { uz: 'Filtr', ru: 'Фильтр' },
    search_placeholder: { uz: 'Qidirish...', ru: 'Поиск...' },

    // Sorting & Filtering
    sort_by: { uz: 'Saralash', ru: 'Сортировка' },
    sort_recommended: { uz: 'Tavsiya etilgan', ru: 'Рекомендуемые' },
    sort_bestseller: { uz: 'Ko\'p sotiladigan', ru: 'Популярные' },
    sort_newest: { uz: 'Eng yangilari', ru: 'Сначала новые' },
    sort_price_asc: { uz: 'Narxi arzon', ru: 'Сначала дешёвые' },
    sort_price_desc: { uz: 'Narxi qimmat', ru: 'Сначала дорогие' },
    sort_name_az: { uz: 'Nomi A–Z', ru: 'Название А–Я' },
    price_range: { uz: 'Narx oralig\'i', ru: 'Диапазон цен' },
    min_price: { uz: 'Dan', ru: 'От' },
    max_price: { uz: 'Gacha', ru: 'До' },
    apply: { uz: 'Qo\'llash', ru: 'Применить' },

    // Product Status
    in_stock: { uz: 'Mavjud', ru: 'В наличии' },
    out_of_stock: { uz: 'Mavjud emas', ru: 'Нет в наличии' },

    // Toast Messages
    toast_added_to_cart: { uz: 'Mahsulot savatchaga qo\'shildi', ru: 'Товар добавлен в корзину' },
    toast_added_to_wishlist: { uz: 'Sevimlilarga qo\'shildi', ru: 'Добавлено в избранное' },
    toast_removed_from_wishlist: { uz: 'Sevimlilardan olib tashlandi', ru: 'Удалено из избранного' },
    added_to_cart_desc: { uz: 'savatchaga qo\'shildi', ru: 'добавлен в корзину' },

    // Common
    search: { uz: 'Qidiruv', ru: 'Поиск' },
    wishlist: { uz: 'Sevimlilar', ru: 'Избранное' },
    profile: { uz: 'Profil', ru: 'Профиль' },
    choose_language: { uz: 'Tilni tanlang', ru: 'Выберите язык' },
    follow_us: { uz: 'Bizni kuzating', ru: 'Подписывайтесь' },
    all_rights_reserved: { uz: 'Barcha huquqlar himoyalangan', ru: 'Все права защищены' },
    meta_title: { uz: 'PaketShop.uz | Qadoqlash va bir martalik idishlar ulgurji', ru: 'PaketShop.uz | Упаковка и одноразовая посуда оптом' },
    meta_description: { uz: 'O\'zbekiston bizneslari uchun qadoqlash, bir martalik idishlar va xo\'jalik sarf materiallari ulgurji katalogi.', ru: 'Оптовый каталог упаковки, одноразовой посуды и хозяйственных расходных материалов для бизнеса Узбекистана.' },
    popular_searches: { uz: 'Ommabop qidiruvlar', ru: 'Популярные запросы' },
    search_help: { uz: 'Tanlash uchun Enter, chiqish uchun ESC bosing', ru: 'Нажмите Enter для выбора, ESC для выхода' },
    categories: { uz: 'Kategoriyalar', ru: 'Категории' },
    products: { uz: 'Mahsulotlar', ru: 'Товары' },
    nothing_found: { uz: 'Hech narsa topilmadi.', ru: 'Ничего не найдено.' },

    // Dynamic Category Translations
    'Stakanlar va qopqoqlar': { uz: 'Stakanlar va qopqoqlar', ru: 'Стаканы и крышки' },
    'Bir martalik idishlar': { uz: 'Bir martalik idishlar', ru: 'Одноразовая посуда' },
    'Ovqat konteynerlari': { uz: 'Ovqat konteynerlari', ru: 'Контейнеры для еды' },
    'Sous idishlari': { uz: 'Sous idishlari', ru: 'Соусники' },
    'Kraft paketlar': { uz: 'Kraft paketlar', ru: 'Крафт-пакеты' },
    'Polietilen paketlar': { uz: 'Polietilen paketlar', ru: 'Полиэтиленовые пакеты' },
    'Zip paketlar': { uz: 'Zip paketlar', ru: 'Zip-пакеты' },
    'Chiqindi paketlari': { uz: 'Chiqindi paketlari', ru: 'Мешки для мусора' },
    'Streych plyonkalar': { uz: 'Streych plyonkalar', ru: 'Стрейч-плёнка' },
    'Oziq-ovqat plyonkasi': { uz: 'Oziq-ovqat plyonkasi', ru: 'Пищевая плёнка' },
    'Folga va pergament': { uz: 'Folga va pergament', ru: 'Фольга и пергамент' },
    'Qandolatchilik qadoqlari': { uz: 'Qandolatchilik qadoqlari', ru: 'Кондитерская упаковка' },
    'Bir martalik qoshiq-vilka': { uz: 'Bir martalik qoshiq-vilka', ru: 'Одноразовые приборы' },
    'Salfetka va qog\'oz mahsulotlari': { uz: 'Salfetka va qog\'oz mahsulotlari', ru: 'Салфетки и бумажные товары' },
    'Xo\'jalik sarf materiallari': { uz: 'Xo\'jalik sarf materiallari', ru: 'Хозяйственные расходные материалы' },
    'Bayram mahsulotlari': { uz: 'Bayram mahsulotlari', ru: 'Праздничные товары' },
    'Yangi yil paketlari va qutilari': { uz: 'Yangi yil paketlari va qutilari', ru: 'Новогодние пакеты и коробки' },

    // Breadcrumbs
    breadcrumb_home: { uz: 'Bosh sahifa', ru: 'Главная' },

    // Blog
    read_more: { uz: "O'qish", ru: 'Читать' },
    blog_news: { uz: 'Blog va yangiliklar', ru: 'Блог и новости' },
    blog_subtitle: { uz: 'Soha yangiliklari', ru: 'Новости отрасли' },
    all_articles: { uz: 'Barcha maqolalar', ru: 'Все статьи' },

    // Reviews
    reviews_title: { uz: 'Mijozlar fikri', ru: 'Отзывы клиентов' },
    reviews_count: { uz: 'izoh', ru: 'отзывов' },
    leave_review: { uz: 'Fikr qoldirish', ru: 'Оставить отзыв' },
    cancel: { uz: 'Bekor qilish', ru: 'Отменить' },
    your_name: { uz: 'Sizning ismingiz', ru: 'Ваше имя' },
    your_comment: { uz: 'Izohingiz', ru: 'Ваш комментарий' },
    submit: { uz: 'Yuborish', ru: 'Отправить' },
    no_reviews: { uz: "Hali izohlar qoldirilmagan.", ru: 'Отзывов пока нет.' },

    // Regions/Cities
    city_label: { uz: 'Shahar', ru: 'Город' },
    city_toshkent: { uz: 'Toshkent', ru: 'Ташкент' },
    city_samarqand: { uz: 'Samarqand', ru: 'Самарканд' },
    city_buxoro: { uz: 'Buxoro', ru: 'Бухара' },
    city_andijon: { uz: 'Andijon', ru: 'Андижан' },
    city_fargona: { uz: "Farg'ona", ru: 'Фергана' },
    city_namangan: { uz: 'Namangan', ru: 'Наманган' },
    city_xorazm: { uz: 'Xorazm', ru: 'Хорезм' },
    city_qashqadaryo: { uz: 'Qashqadaryo', ru: 'Кашкадарья' },
    city_surxondaryo: { uz: 'Surxondaryo', ru: 'Сурхандарья' },
    city_jizzax: { uz: 'Jizzax', ru: 'Джизак' },
    city_sirdaryo: { uz: 'Sirdaryo', ru: 'Сырдарья' },
    city_navoiy: { uz: 'Navoiy', ru: 'Навои' },
    city_qoraqalpogiston: { uz: "Qoraqalpog'iston", ru: 'Каракалпакстан' },

    // Quick Buy / B2B actions
    quick_buy: { uz: 'Tez buyurtma', ru: 'Быстрый заказ' },
    items_per_package: { uz: 'Qadoqdagi soni', ru: 'Количество в упаковке' },
    items_per_package_desc: { uz: 'Har bir qadoqda', ru: 'В каждой упаковке' },

    // Error
    error_occurred: { uz: 'Xatolik yuz berdi.', ru: 'Произошла ошибка.' },
};

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lang, setLangState] = useState<Language>(() => {
        const pathLang = (typeof window !== 'undefined' ? window.location.pathname : '/').split('/').filter(Boolean)[0];
        if (isSeoLanguage(pathLang)) return pathLang;
        const saved = (typeof window !== 'undefined' ? localStorage.getItem('paketshop_lang') : null);
        return (saved as Language) || 'uz';
    });

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('paketshop_lang', newLang);
        document.documentElement.lang = newLang;

        const nextPath = withLanguagePrefix((typeof window !== 'undefined' ? window.location.pathname : '/'), newLang);
        const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;
        if (nextUrl !== `${(typeof window !== 'undefined' ? window.location.pathname : '/')}${window.location.search}${window.location.hash}`) {
            window.history.pushState({ lang: newLang }, '', nextUrl);
        }
    };

    const t = (key: string): string => {
        return translations[key]?.[lang] || key;
    };

    useEffect(() => {
        document.documentElement.lang = lang;
        const ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale) {
            ogLocale.setAttribute('content', LOCALE_BY_LANG[lang]);
        }
    }, [lang]);

    useEffect(() => {
        const handlePopState = () => {
            const pathLang = (typeof window !== 'undefined' ? window.location.pathname : '/').split('/').filter(Boolean)[0];
            if (isSeoLanguage(pathLang) && pathLang !== lang) {
                setLangState(pathLang);
                localStorage.setItem('paketshop_lang', pathLang);
                document.documentElement.lang = pathLang;
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
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
