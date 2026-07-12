'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Package, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../lib/i18nUtils';
import { saleUnitLabel } from '../lib/domain/catalogMapping';

interface CartSidebarProps { onCheckout: () => void }

const copy = {
  uz: { title: 'Buyurtma ro‘yxati', products: 'mahsulot', empty: 'Ro‘yxat hozircha bo‘sh', catalog: 'Katalogni ko‘rish', piece: 'dona', estimated: 'Taxminiy summa', note: 'Yakuniy narx va qoldiqni menejer tasdiqlaydi.', checkout: 'Buyurtma so‘rovini rasmiylashtirish', remove: 'Mahsulotni olib tashlash' },
  ru: { title: 'Список заказа', products: 'товаров', empty: 'Список пока пуст', catalog: 'Перейти в каталог', piece: 'шт.', estimated: 'Примерная сумма', note: 'Итоговую цену и наличие подтверждает менеджер.', checkout: 'Оформить запрос заказа', remove: 'Удалить товар' },
} as const;

export default function CartSidebar({ onCheckout }: CartSidebarProps) {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { lang } = useLanguage();
  const locale = lang === 'ru' ? 'ru' : 'uz';
  const t = copy[locale];
  const money = (value: number) => `${new Intl.NumberFormat('uz-UZ').format(value)} UZS`;

  useEffect(() => { if (cart.length === 0 && isCartOpen) closeCart(); }, [cart.length, isCartOpen, closeCart]);

  return (
    <AnimatePresence>
      {isCartOpen && <>
        <motion.button type="button" aria-label="Close cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart} className="fixed inset-0 z-[60] cursor-default bg-slate-950/55 backdrop-blur-sm" />
        <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 240 }} className="fixed right-0 top-0 z-[70] flex h-full w-full flex-col border-l border-slate-200 bg-white text-slate-950 shadow-2xl sm:w-[480px]">
          <header className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600"><ShoppingCart size={21} /></span><div><h2 className="text-lg font-black">{t.title}</h2><p className="text-xs text-slate-500">{cart.length} {t.products}</p></div></div>
            <button onClick={closeCart} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950" aria-label="Close"><X size={23} /></button>
          </header>
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {cart.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center"><Package size={48} className="text-slate-300" /><p className="mt-4 font-semibold text-slate-600">{t.empty}</p><button onClick={closeCart} className="mt-4 font-bold text-red-700">{t.catalog}</button></div> : cart.map((item) => {
              const key = item.catalogId || String(item.id);
              const step = Math.max(1, item.orderStep || 1);
              const unit = saleUnitLabel(item.saleUnit || 'PACK', locale);
              const baseUnits = item.saleUnit === 'CARTON' ? item.unitsPerCarton : item.itemsPerPackage;
              return <article key={key} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex gap-4"><img src={item.image} alt={getLocalizedText(item.name, locale)} className="h-24 w-24 shrink-0 rounded-xl bg-slate-100 object-contain" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><p className="font-mono text-xs font-semibold text-slate-500">{item.sku || `PS-${item.id}`}</p><h3 className="mt-1 font-bold leading-5">{getLocalizedText(item.name, locale)}</h3></div><button onClick={() => removeFromCart(key)} className="p-1 text-slate-400 hover:text-red-600" aria-label={t.remove}><Trash2 size={17} /></button></div><p className="mt-2 text-sm text-slate-600">{item.quantity} {unit}{baseUnits ? ` · ${item.quantity * baseUnits} ${t.piece}` : ''}</p><p className="mt-2 font-black">{money(item.quoteUnitPrice * item.quantity)}</p></div></div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs text-slate-500">{item.quoteUnitPrice > 0 ? `${money(item.quoteUnitPrice)} / ${unit}` : t.note}</span><div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1"><button onClick={() => updateQuantity(key, item.quantity - step)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100" aria-label="Minus"><Minus size={15} /></button><span className="min-w-16 text-center text-sm font-bold">{item.quantity} {unit}</span><button onClick={() => updateQuantity(key, item.quantity + step)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100" aria-label="Plus"><Plus size={15} /></button></div></div>
              </article>;
            })}
          </div>
          {cart.length > 0 && <footer className="border-t border-slate-200 bg-slate-50 p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-600">{t.estimated}</span><strong className="text-xl">{money(cartTotal)}</strong></div><p className="mt-2 text-xs leading-5 text-amber-800">{t.note}</p><button onClick={() => { closeCart(); onCheckout(); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 font-bold text-white hover:bg-red-700">{t.checkout}<ArrowRight size={19} /></button></footer>}
        </motion.aside>
      </>}
    </AnimatePresence>
  );
}
