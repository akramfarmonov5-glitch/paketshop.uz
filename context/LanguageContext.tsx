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
    description_label: { uz: 'Tavsif', ru: 'Описание', en: 'Description' },
    video_review: { uz: 'VIDEO SHARH', ru: 'ВИДЕО ОБЗОР', en: 'VIDEO REVIEW' },

    // Cart & Checkout
    cart_title: { uz: 'Savatcha', ru: 'Корзина', en: 'Cart' },
    cart_items_count: { uz: 'ta mahsulot', ru: 'товаров', en: 'items' },
    continue_shopping: { uz: 'Xaridni davom ettirish', ru: 'Продолжить покупки', en: 'Continue shopping' },
    cart_empty: { uz: 'Savatchangiz bo\'sh', ru: 'Ваша корзина пуста', en: 'Your cart is empty' },
    cart_empty_desc: { uz: 'Buyurtma berish uchun avval mahsulot tanlang.', ru: 'Выберите товары для оформления заказа.', en: 'Select products to checkout.' },
    checkout_title: { uz: 'Rasmiylashtirish', ru: 'Оформление', en: 'Checkout' },
    total_sum: { uz: 'Jami summa', ru: 'Итоговая сумма', en: 'Total Amount' },

    // Checkout specific
    checkout_firstName: { uz: 'Ismingiz', ru: 'Ваше имя', en: 'First Name' },
    checkout_lastName: { uz: 'Familiyangiz', ru: 'Ваша фамилия', en: 'Last Name' },
    checkout_phone: { uz: 'Telefon raqam', ru: 'Номер телефона', en: 'Phone Number' },
    checkout_address: { uz: 'Manzil', ru: 'Адрес', en: 'Address' },
    checkout_promo: { uz: 'Promo kod (Agar bo\'lsa)', ru: 'Промокод (Если есть)', en: 'Promo code (If any)' },
    checkout_promo_placeholder: { uz: 'Kodini kiriting', ru: 'Введите код', en: 'Enter code' },
    checkout_apply: { uz: 'Qo\'llash', ru: 'Применить', en: 'Apply' },
    checkout_payment_method: { uz: 'To\'lov usuli', ru: 'Способ оплаты', en: 'Payment Method' },
    checkout_paynet: { uz: 'Paynet (Onlayn)', ru: 'Paynet (Онлайн)', en: 'Paynet (Online)' },
    checkout_cash: { uz: 'Naqd (Qabulda)', ru: 'Наличными (При получении)', en: 'Cash (On delivery)' },
    checkout_pay: { uz: 'To\'lash', ru: 'Оплатить', en: 'Pay' },
    checkout_order_btn: { uz: 'Buyurtma berish', ru: 'Заказать', en: 'Order' },
    checkout_order_summary: { uz: 'Buyurtma tarkibi', ru: 'Состав заказа', en: 'Order Summary' },
    checkout_products_sum: { uz: 'Mahsulotlar', ru: 'Товары', en: 'Products' },
    checkout_discount: { uz: 'Chegirma', ru: 'Скидка', en: 'Discount' },
    checkout_delivery: { uz: 'Yetkazib berish', ru: 'Доставка', en: 'Delivery' },
    checkout_delivery_free: { uz: 'Bepul', ru: 'Бесплатно', en: 'Free' },
    checkout_total: { uz: 'Jami to\'lov', ru: 'Итого к оплате', en: 'Total payment' },
    checkout_fast_delivery: { uz: 'Tezkor yetkazish', ru: 'Быстрая доставка', en: 'Fast delivery' },
    checkout_easy_payment: { uz: 'Qulay to\'lov', ru: 'Удобная оплата', en: 'Easy payment' },
    checkout_secure_payment: { uz: 'Xavfsiz to\'lov va ma\'lumotlar himoyasi', ru: 'Безопасная оплата и защита данных', en: 'Secure payment and data protection' },
    checkout_back_to_shop: { uz: 'Do\'konga qaytish', ru: 'Вернуться в магазин', en: 'Back to shop' },
    checkout_req_firstName: { uz: 'Ismingizni kiritishingiz shart', ru: 'Необходимо ввести ваше имя', en: 'First name is required' },
    checkout_req_lastName: { uz: 'Familiyangizni kiritishingiz shart', ru: 'Необходимо ввести вашу фамилию', en: 'Last name is required' },
    checkout_req_phone: { uz: 'To\'g\'ri telefon raqam kiriting (kamida 9 ta raqam)', ru: 'Введите правильный номер телефона (не менее 9 цифр)', en: 'Enter a valid phone number (at least 9 digits)' },
    checkout_req_address: { uz: 'Manzilni kiritishingiz shart', ru: 'Необходимо ввести адрес', en: 'Address is required' },
    checkout_req_fill_all: { uz: 'Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring', ru: 'Пожалуйста, заполните все поля правильно', en: 'Please fill in all fields correctly' },
    checkout_promo_success: { uz: 'Promo kod muvaffaqiyatli qo\'llanildi!', ru: 'Промокод успешно применен!', en: 'Promo code applied successfully!' },
    checkout_promo_special: { uz: 'Maxsus chegirma qo\'llanildi!', ru: 'Специальная скидка применена!', en: 'Special discount applied!' },
    checkout_promo_error: { uz: 'Bunday promo kod mavjud emas.', ru: 'Такого промокода не существует.', en: 'Such promo code does not exist.' },
    checkout_promo_applied_1: { uz: 'Kod qo\'llanildi! Siz', ru: 'Код применен! Вы сэкономили', en: 'Code applied! You saved' },
    checkout_promo_applied_2: { uz: 'tejadingiz.', ru: '', en: '' },
    checkout_in_progress: { uz: 'Jarayonda...', ru: 'В процессе...', en: 'In progress...' },
    checkout_paynet_title: { uz: 'Paynet orqali to\'lash', ru: 'Оплата через Paynet', en: 'Payment via Paynet' },
    checkout_paynet_desc: { uz: 'To\'lovni amalga oshirish uchun QR kodni skanerlang.', ru: 'Отсканируйте QR-код для оплаты.', en: 'Scan the QR code to make a payment.' },
    checkout_paynet_btn: { uz: 'To\'lov qildim', ru: 'Я оплатил(а)', en: 'I have paid' },
    checkout_paynet_link: { uz: 'Havolani ochish', ru: 'Открыть ссылку', en: 'Open link' },
    checkout_success_title: { uz: 'Buyurtmangiz qabul qilindi!', ru: 'Ваш заказ принят!', en: 'Your order is accepted!' },
    checkout_success_desc_1: { uz: 'Rahmat,', ru: 'Спасибо,', en: 'Thank you,' },
    checkout_success_desc_2: { uz: 'Menejerlarimiz tez orada', ru: 'Наши менеджеры скоро свяжутся с вами по номеру', en: 'Our managers will contact you soon at' },
    checkout_success_desc_3: { uz: 'raqami orqali siz bilan bog\'lanishadi.', ru: '', en: '' },
    checkout_back_home: { uz: 'Bosh sahifaga qaytish', ru: 'Вернуться на главную', en: 'Back to home' },
    checkout_placeholder_firstname: { uz: 'Aziz', ru: 'Азиз', en: 'Aziz' },
    checkout_placeholder_lastname: { uz: 'Rahimov', ru: 'Рахимов', en: 'Rahimov' },

    // Collection & Filters
    premium_collection: { uz: 'Premium To\'plam', ru: 'Премиум Коллекция', en: 'Premium Collection' },
    collection_desc: { uz: 'Eksklyuziv dizayn va yuqori sifat uyg\'unligi.', ru: 'Сочетание эксклюзивного дизайна и высокого качества.', en: 'A combination of exclusive design and high quality.' },
    all_categories: { uz: 'Barchasi', ru: 'Все', en: 'All' },
    no_products_found: { uz: 'Mahsulotlar topilmadi.', ru: 'Товары не найдены.', en: 'No products found.' },
    view_all: { uz: 'Barchasini ko\'rish', ru: 'Посмотреть все', en: 'View All' },
    filter: { uz: 'Filtr', ru: 'Фильтр', en: 'Filter' },
    search_placeholder: { uz: 'Qidirish...', ru: 'Поиск...', en: 'Search...' },

    // Sorting & Filtering
    sort_by: { uz: 'Saralash', ru: 'Сортировка', en: 'Sort by' },
    sort_newest: { uz: 'Eng yangilari', ru: 'Сначала новые', en: 'Newest first' },
    sort_price_asc: { uz: 'Arzonlari oldin', ru: 'Сначала дешевые', en: 'Price: Low to High' },
    sort_price_desc: { uz: 'Qimmatlari oldin', ru: 'Сначала дорогие', en: 'Price: High to Low' },
    price_range: { uz: 'Narx oralig\'i', ru: 'Диапазон цен', en: 'Price range' },
    min_price: { uz: 'Dan', ru: 'От', en: 'Min' },
    max_price: { uz: 'Gacha', ru: 'До', en: 'Max' },
    apply: { uz: 'Qo\'llash', ru: 'Применить', en: 'Apply' },

    // Product Status & Features
    stock_in: { uz: 'dona', ru: 'шт', en: 'pcs' },
    in_stock: { uz: 'Mavjud', ru: 'В наличии', en: 'In Stock' },
    out_of_stock: { uz: 'Mavjud emas', ru: 'Нет в наличии', en: 'Out of Stock' },
    buy_now: { uz: 'Hozir olish', ru: 'Купить сейчас', en: 'Buy Now' },
    premium_warranty: { uz: 'Premium Kafolat', ru: 'Премиум Гарантия', en: 'Premium Warranty' },
    free_delivery: { uz: 'Bepul Yetkazish', ru: 'Бесплатная Доставка', en: 'Free Delivery' },
    eco_package: { uz: 'Eko-qadoq', ru: 'Эко-упаковка', en: 'Eco-package' },
    recommendations: { uz: 'Tavsiyalar', ru: 'Рекомендации', en: 'Recommendations' },
    video_error: { uz: 'Agar video ishlamasa, YouTube orqali ko\'ring', ru: 'Если видео не работает, посмотрите на YouTube', en: 'If the video doesn\'t work, watch on YouTube' },
    category_collection: { uz: 'Kolleksiya', ru: 'Коллекция', en: 'Collection' },
    view: { uz: 'Ko\'rish', ru: 'Посмотреть', en: 'View' },
    items_per_package: { uz: 'Qadoqdagi soni', ru: 'Колличество в упаковке', en: 'Items per package' },
    items_per_package_desc: { uz: 'Har bir qadoqda', ru: 'В каждой упаковке', en: 'In each package' },

    // Toast Messages
    toast_added_to_cart: { uz: 'Mahsulot savatchaga qo\'shildi', ru: 'Товар добавлен в корзину', en: 'Product added to cart' },
    toast_added_to_wishlist: { uz: 'Sevimlilarga qo\'shildi', ru: 'Добавлено в избранное', en: 'Added to wishlist' },
    toast_removed_from_wishlist: { uz: 'Sevimlilardan olib tashlandi', ru: 'Удалено из избранного', en: 'Removed from wishlist' },
    added_to_cart_desc: { uz: 'savatchaga qo\'shildi', ru: 'добавлен в корзину', en: 'added to cart' },
    added_to_wishlist_desc: { uz: 'sevimlilarga qo\'shildi', ru: 'добавлено в избранное', en: 'added to wishlist' },
    removed_from_wishlist_desc: { uz: 'sevimlilardan olib tashlandi', ru: 'удалено из избранного', en: 'removed from wishlist' },

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

    // Dynamic Category Translations (Fallbacks for Mock/User data)
    'Paketlar (Polietilen va qog\'oz mahsulotlari)': { uz: 'Paketlar (Polietilen va qog\'oz mahsulotlari)', ru: 'Пакеты (Полиэтиленовая и бумажная продукция)', en: 'Bags (Polyethylene and Paper Products)' },
    'Oshxona sarflov materiallari': { uz: 'Oshxona sarflov materiallari', ru: 'Кухонные расходные материалы', en: 'Kitchen Consumables' },
    'Tozalash inventarlari (Cleaning)': { uz: 'Tozalash inventarlari (Cleaning)', ru: 'Инвентарь для уборки (Клининг)', en: 'Cleaning Equipment' },
    'Qog\'oz gigiyenasi': { uz: 'Qog\'oz gigiyenasi', ru: 'Бумажная гигиена', en: 'Paper Hygiene' },
    'Bir martalik idishlar va Konteynerlar': { uz: 'Bir martalik idishlar va Konteynerlar', ru: 'Одноразовая посуда и контейнеры', en: 'Disposable Tableware and Containers' },
    'Oshxona anjomlari va Aksessuarlar': { uz: 'Oshxona anjomlari va Aksessuarlar', ru: 'Кухонные принадлежности и аксессуары', en: 'Kitchen Utensils and Accessories' },
    'Stakanlar (Keng assortiment)': { uz: 'Stakanlar (Keng assortiment)', ru: 'Стаканы (Широкий ассортимент)', en: 'Cups (Wide range)' },
    'Likpachalar': { uz: 'Likpachalar', ru: 'Тарелки', en: 'Plates' },
    'Likopchalar': { uz: 'Likopchalar', ru: 'Тарелки', en: 'Plates' },
    'Maishiy kimyo (Umumiy assortiment)': { uz: 'Maishiy kimyo (Umumiy assortiment)', ru: 'Бытовая химия (Общий ассортимент)', en: 'Household Chemicals (General assortment)' },

    // Trust Badges
    trust_badge_label: { uz: 'Kafolatlar', ru: 'Гарантии', en: 'Guarantees' },
    trust_title: { uz: 'Nima uchun bizni', ru: 'Почему выбирают', en: 'Why choose' },
    trust_title_highlight: { uz: 'tanlashadi?', ru: 'нас?', en: 'us?' },
    trust_delivery_title: { uz: 'Bepul yetkazish', ru: 'Бесплатная доставка', en: 'Free Delivery' },
    trust_delivery_desc: { uz: '1 mln so\'mdan yuqori buyurtmalar uchun butun O\'zbekiston bo\'ylab', ru: 'Для заказов свыше 1 млн сум по всему Узбекистану', en: 'For orders over 1M UZS across Uzbekistan' },
    trust_quality_title: { uz: 'Sifat kafolati', ru: 'Гарантия качества', en: 'Quality Guarantee' },
    trust_quality_desc: { uz: 'Barcha mahsulotlar sertifikatlangan va sifat nazoratidan o\'tgan', ru: 'Вся продукция сертифицирована и прошла контроль качества', en: 'All products are certified and quality controlled' },
    trust_payment_title: { uz: 'Xavfsiz to\'lov', ru: 'Безопасная оплата', en: 'Secure Payment' },
    trust_payment_desc: { uz: 'Payme, Click, Naqd va boshqa qulay usullar', ru: 'Payme, Click, наличные и другие удобные способы', en: 'Payme, Click, Cash and other convenient methods' },
    trust_return_title: { uz: '14 kun qaytarish', ru: 'Возврат 14 дней', en: '14 Day Returns' },
    trust_return_desc: { uz: 'Mahsulot yoqmasa, 14 kun ichida qaytarishingiz mumkin', ru: 'Если товар не подошел, вернуть можно в течение 14 дней', en: 'Return within 14 days if you\'re not satisfied' },

    // Testimonials
    testimonials_label: { uz: 'Mijozlar fikrlari', ru: 'Отзывы клиентов', en: 'Customer Reviews' },
    testimonials_title: { uz: 'Xaridorlarimiz', ru: 'Что говорят', en: 'What our customers' },
    testimonials_highlight: { uz: 'nima deydi?', ru: 'клиенты?', en: 'say?' },

    // Promo Banner
    promo_label: { uz: 'Maxsus aksiya', ru: 'Специальная акция', en: 'Special Offer' },
    promo_title: { uz: 'Katta chegirmalar!', ru: 'Большие скидки!', en: 'Big Discounts!' },
    promo_desc: { uz: 'Tanlangan mahsulotlarga 20% gacha chegirma. Vaqt cheklangan!', ru: 'Скидки до 20% на выбранные товары. Время ограничено!', en: 'Up to 20% off selected products. Limited time!' },
    promo_days: { uz: 'Kun', ru: 'Дней', en: 'Days' },
    promo_hours: { uz: 'Soat', ru: 'Часов', en: 'Hours' },
    promo_minutes: { uz: 'Daqiqa', ru: 'Минут', en: 'Minutes' },
    promo_seconds: { uz: 'Soniya', ru: 'Секунд', en: 'Seconds' },
    promo_shop: { uz: 'Xarid qilish', ru: 'Купить', en: 'Shop Now' },

    'Soatlar': { uz: 'Soatlar', ru: 'Часы', en: 'Watches' },
    'Sumkalar': { uz: 'Sumkalar', ru: 'Сумки', en: 'Bags' },
    'Ko\'zoynaklar': { uz: 'Ko\'zoynaklar', ru: 'Очки', en: 'Glasses' },
    'Aksessuarlar': { uz: 'Aksessuarlar', ru: 'Аксессуары', en: 'Accessories' },

    // Regions/Cities
    city_label: { uz: 'Shahar', ru: 'Город', en: 'City' },
    city_toshkent: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' },
    city_samarqand: { uz: 'Samarqand', ru: 'Самарканд', en: 'Samarkand' },
    city_buxoro: { uz: 'Buxoro', ru: 'Бухара', en: 'Bukhara' },
    city_andijon: { uz: 'Andijon', ru: 'Андижан', en: 'Andijan' },
    city_fargona: { uz: "Farg'ona", ru: 'Фергана', en: 'Fergana' },
    city_namangan: { uz: 'Namangan', ru: 'Наманган', en: 'Namangan' },
    city_xorazm: { uz: 'Xorazm', ru: 'Хорезм', en: 'Khorezm' },
    city_qashqadaryo: { uz: 'Qashqadaryo', ru: 'Кашкадарья', en: 'Kashkadarya' },
    city_surxondaryo: { uz: 'Surxondaryo', ru: 'Сурхандарья', en: 'Surkhandarya' },
    city_jizzax: { uz: 'Jizzax', ru: 'Джизак', en: 'Jizzakh' },
    city_sirdaryo: { uz: 'Sirdaryo', ru: 'Сырдарья', en: 'Syrdarya' },
    city_navoiy: { uz: 'Navoiy', ru: 'Навои', en: 'Navoi' },
    city_qoraqalpogiston: { uz: "Qoraqalpog'iston", ru: 'Каракалпакстан', en: 'Karakalpakstan' },

    // Breadcrumbs
    breadcrumb_home: { uz: 'Bosh sahifa', ru: 'Главная', en: 'Home' },

    // Quick Buy
    quick_buy: { uz: 'Bitta bosishda xarid qilish', ru: 'Купить в один клик', en: 'Quick Buy' },

    // Blog
    read_more: { uz: "O'qish", ru: 'Читать', en: 'Read' },
    blog_news: { uz: 'Blog & Yangiliklar', ru: 'Блог и Новости', en: 'Blog & News' },
    blog_subtitle: { uz: 'Moda Olamidan Xabarlar', ru: 'Новости из Мира Моды', en: 'Fashion World News' },
    all_articles: { uz: 'Barcha maqolalar', ru: 'Все статьи', en: 'All articles' },

    // Reviews
    reviews_title: { uz: 'Mijozlar fikri', ru: 'Отзывы покупателей', en: 'Customer Reviews' },
    reviews_count: { uz: 'izoh', ru: 'отзывов', en: 'reviews' },
    leave_review: { uz: 'Fikr qoldirish', ru: 'Оставить отзыв', en: 'Leave Review' },
    cancel: { uz: 'Bekor qilish', ru: 'Отменить', en: 'Cancel' },
    your_name: { uz: 'Sizning Ismingiz', ru: 'Ваше Имя', en: 'Your Name' },
    enter_name_placeholder: { uz: 'Ismingizni kiriting', ru: 'Введите ваше имя', en: 'Enter your name' },
    rate: { uz: 'Baholang', ru: 'Оцените', en: 'Rate' },
    your_comment: { uz: 'Izohingiz', ru: 'Ваш комментарий', en: 'Your Comment' },
    comment_placeholder: { uz: "Mahsulot haqida fikringiz...", ru: 'Ваше мнение о товаре...', en: 'Your opinion about the product...' },
    submit: { uz: 'Yuborish', ru: 'Отправить', en: 'Submit' },
    no_reviews: { uz: "Hali izohlar qoldirilmagan. Birinchi bo'lib fikr bildiring!", ru: 'Отзывов пока нет. Будьте первым!', en: 'No reviews yet. Be the first to leave one!' },
    review_thanks: { uz: 'Fikringiz uchun rahmat!', ru: 'Спасибо за ваш отзыв!', en: 'Thank you for your review!' },
    error_occurred: { uz: 'Xatolik yuz berdi.', ru: 'Произошла ошибка.', en: 'An error occurred.' },
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
