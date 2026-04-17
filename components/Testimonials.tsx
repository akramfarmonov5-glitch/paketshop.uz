import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface Testimonial {
  id: number;
  name: string;
  city: string;
  rating: number;
  text: { uz: string; ru: string; en: string };
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Aziza Karimova',
    city: 'Toshkent',
    rating: 5,
    text: {
      uz: 'PaketShop dan birinchi marta buyurtma berdim va juda mamnunman! Yetkazib berish tez bo\'ldi, mahsulot sifati ajoyib. Albatta yana xarid qilaman.',
      ru: 'Впервые заказала в PaketShop и очень довольна! Доставка была быстрой, качество товара отличное. Обязательно закажу еще.',
      en: 'First time ordering from PaketShop and I\'m very satisfied! Fast delivery, great product quality. Will definitely order again.',
    },
    avatar: 'https://ui-avatars.com/api/?name=Aziza+K&background=D4A574&color=fff&size=80&bold=true',
  },
  {
    id: 2,
    name: 'Jasur Raximov',
    city: 'Samarqand',
    rating: 5,
    text: {
      uz: 'Narxlari boshqa do\'konlarga nisbatan ancha qulay. Qadoqlash ham juda chiroyli bo\'lgan. Xizmat ko\'rsatish darajasi yuqori!',
      ru: 'Цены значительно выгоднее, чем в других магазинах. Упаковка тоже была очень красивой. Высокий уровень обслуживания!',
      en: 'Prices are much more affordable than other stores. Packaging was very beautiful too. High level of service!',
    },
    avatar: 'https://ui-avatars.com/api/?name=Jasur+R&background=7C3AED&color=fff&size=80&bold=true',
  },
  {
    id: 3,
    name: 'Dilnoza Usmanova',
    city: 'Buxoro',
    rating: 4,
    text: {
      uz: 'Mahsulotlar rasmda ko\'rsatilgandek keldi. Sifatiga hech qanday shikoyatim yo\'q. Yagona kamchilik — yetkazib berish biroz kechikdi, lekin umumiy tajriba yaxshi.',
      ru: 'Товары пришли как на фото. Никаких претензий к качеству. Единственный минус — доставка немного задержалась, но общий опыт хороший.',
      en: 'Products arrived exactly as shown. No complaints about quality. Only minor issue was a slight delivery delay, but overall experience was good.',
    },
    avatar: 'https://ui-avatars.com/api/?name=Dilnoza+U&background=059669&color=fff&size=80&bold=true',
  },
  {
    id: 4,
    name: 'Sardor Aliyev',
    city: 'Namangan',
    rating: 5,
    text: {
      uz: 'Restoran uchun bir martalik idishlar buyurtma berdim. Sifati zo\'r, narxi ham hamyonbop. Katta rahmat PaketShop jamoasiga!',
      ru: 'Заказал одноразовую посуду для ресторана. Отличное качество, доступная цена. Большое спасибо команде PaketShop!',
      en: 'Ordered disposable tableware for our restaurant. Excellent quality, affordable price. Thank you PaketShop team!',
    },
    avatar: 'https://ui-avatars.com/api/?name=Sardor+A&background=DC2626&color=fff&size=80&bold=true',
  },
];

const Testimonials: React.FC = () => {
  const { isDark } = useTheme();
  const { lang, t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, []);

  const item = testimonials[current];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <section className={`py-12 md:py-20 transition-colors duration-300 overflow-hidden ${isDark ? 'bg-black' : 'bg-light-bg'}`}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="inline-block px-3 py-1 mb-4 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-gold-400 border border-gold-500/30 rounded-full bg-gold-500/10">
            {t('testimonials_label')}
          </span>
          <h2 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>
            {t('testimonials_title')} <span className="text-gold-400">{t('testimonials_highlight')}</span>
          </h2>
        </motion.div>

        {/* Slider */}
        <div className="relative max-w-3xl mx-auto">
          {/* Arrows */}
          <button
            onClick={prev}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-14 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
              isDark ? 'bg-white/5 hover:bg-white/15 text-white border border-white/10' : 'bg-white hover:bg-gray-100 text-light-text border border-light-border shadow-lg'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-14 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
              isDark ? 'bg-white/5 hover:bg-white/15 text-white border border-white/10' : 'bg-white hover:bg-gray-100 text-light-text border border-light-border shadow-lg'
            }`}
          >
            <ChevronRight size={20} />
          </button>

          {/* Card */}
          <div className="min-h-[280px] md:min-h-[260px] flex items-center justify-center px-8 md:px-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={item.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className={`w-full p-6 md:p-10 rounded-2xl md:rounded-3xl border text-center relative ${
                  isDark ? 'bg-dark-800 border-white/5' : 'bg-white border-light-border shadow-xl'
                }`}
              >
                {/* Quote icon */}
                <Quote size={40} className={`absolute top-4 right-4 md:top-6 md:right-6 ${isDark ? 'text-white/5' : 'text-gray-100'}`} />

                {/* Avatar */}
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full mx-auto mb-4 ring-2 ring-gold-400/50"
                />

                {/* Stars */}
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < item.rating ? 'text-gold-400 fill-gold-400' : isDark ? 'text-gray-700' : 'text-gray-300'}
                    />
                  ))}
                </div>

                {/* Text */}
                <p className={`text-sm md:text-base leading-relaxed mb-5 italic max-w-lg mx-auto ${isDark ? 'text-gray-300' : 'text-light-muted'}`}>
                  "{item.text[lang as keyof typeof item.text]}"
                </p>

                {/* Name */}
                <p className={`font-bold text-sm md:text-base ${isDark ? 'text-white' : 'text-light-text'}`}>{item.name}</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-light-muted'}`}>{item.city}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-gold-400' : 'w-2 bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
