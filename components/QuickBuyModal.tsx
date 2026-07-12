import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import * as fpixel from '../lib/fpixel';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../lib/i18nUtils';

interface QuickBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  quantity: number;
}

const QuickBuyModal: React.FC<QuickBuyModalProps> = ({ isOpen, onClose, product, quantity }) => {
  const { lang } = useLanguage();

  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formStartedAt] = useState(() => Date.now());

  const saleUnit = product.saleUnit || (product.itemsPerPackage && product.itemsPerPackage > 1 ? 'PACK' : 'PIECE');
  const saleQuantity = saleUnit === 'PACK' ? Math.max(1, Math.round(quantity / Math.max(1, product.itemsPerPackage || 1))) : quantity;
  const unitPrice = product.catalogId || saleUnit !== 'PACK' ? product.price : product.price * Math.max(1, product.itemsPerPackage || 1);
  const total = unitPrice * saleQuantity;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerType: 'individual',
          customerName: formData.firstName,
          phone: formData.phone,
          region: 'Toshkent',
          deliveryMethod: 'manager_confirmation',
          paymentMethod: 'cash',
          locale: lang === 'ru' ? 'ru' : 'uz',
          items: [{ productId: product.catalogId || String(product.id), quantity: saleQuantity, saleUnit }],
          website: '',
          startedAt: formStartedAt,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Buyurtma so'rovini yuborib bo'lmadi");

      fpixel.trackPurchase(result.orderNumber, result.total, [product.catalogId || product.id.toString()], 'UZS');
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setTimeout(() => setIsSuccess(false), 500);
      }, 3000);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Buyurtma so'rovini yuborib bo'lmadi");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isLoading && !isSuccess ? onClose : undefined}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-xl bg-white border border-slate-200"
        >
          <div className="p-4 md:p-6 border-b flex justify-between items-center border-slate-100">
            <h2 className="font-bold text-lg md:text-xl text-slate-900">
              Tezkor xarid
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 rounded-full transition-colors hover:bg-slate-100 text-slate-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 md:p-6">
            {!isSuccess ? (
              <>
                <div className="flex gap-4 p-4 rounded-xl mb-6 bg-slate-50 border border-slate-100">
                  <div className="w-16 aspect-[4/5] rounded-lg bg-white shrink-0 overflow-hidden border border-slate-200">
                    <img src={product.image} alt={getLocalizedText(product.name, lang)} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm line-clamp-2 text-slate-900 leading-tight">{getLocalizedText(product.name, lang)}</h3>
                    <p className="text-xs mt-1 text-slate-500 font-medium">Miqdor: {saleQuantity} {saleUnit.toLowerCase()}</p>
                    <p className="text-red-600 font-bold mt-1 max-w-full truncate">{formatPrice(total)}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">{error}</p>}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Ismingiz</label>
                    <input
                      required
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all bg-white border-slate-200 text-slate-900 placeholder-slate-400 font-medium"
                      placeholder="Ismingizni kiriting"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Telefon raqamingiz</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">+998</span>
                      <input
                        required
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full border rounded-xl pl-16 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all bg-white border-slate-200 text-slate-900 placeholder-slate-400 font-medium"
                        placeholder="90 123 45 67"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-red-600 text-white font-bold text-base py-3.5 rounded-xl hover:bg-red-700 transition-all disabled:opacity-70 mt-6 flex justify-center items-center gap-2 relative overflow-hidden group shadow-lg shadow-red-600/20"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Yuborilmoqda...</span>
                      </div>
                    ) : (
                      <>
                        <span>Sotib olish</span>
                        <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-3 flex justify-center items-center gap-1.5 font-medium">
                    <ShieldCheck size={14} className="text-red-600" /> Operatorlarimiz tez orada aloqaga chiqishadi.
                  </p>
                </form>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">Buyurtma yuborildi</h3>
                <p className="text-slate-500 text-sm font-medium">Siz bilan tez orada bog'lanamiz.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickBuyModal;
