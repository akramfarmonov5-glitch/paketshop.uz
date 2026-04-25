import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { hasSupabaseCredentials, supabase } from '../lib/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import * as fpixel from '../lib/fpixel';

interface QuickBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  quantity: number;
}

const QuickBuyModal: React.FC<QuickBuyModalProps> = ({ isOpen, onClose, product, quantity }) => {
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    firstName: '',
    phone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const total = product.price * quantity;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveOrderToDatabase = async (orderId: string, dateStr: string) => {
    if (!hasSupabaseCredentials) return;

    try {
      const { error } = await supabase.from('orders').insert({
        id: orderId,
        customerName: formData.firstName,
        phone: formData.phone,
        total,
        status: 'Kutilmoqda',
        date: dateStr,
        paymentMethod: 'Naqd',
        items: [
          {
            id: product.id,
            name: product.name,
            quantity,
            price: product.price,
          },
        ],
      });

      if (error) {
        console.error('Error saving quick order to Supabase:', error);
      }
    } catch (e) {
      console.error('Supabase quick order error:', e);
    }
  };

  const sendTelegramNotification = async () => {
    const message = `
<b>TEZKOR BUYURTMA</b>

<b>Ism:</b> ${formData.firstName}
<b>Telefon:</b> ${formData.phone}
<b>Tolov:</b> Operator aniqlaydi

<b>Mahsulot:</b>
1. ${product.name} (x${quantity}) - ${formatPrice(total)}

<b>Jami:</b> ${formatPrice(total)}
    `.trim();

    try {
      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
    } catch (error) {
      console.error('Failed to send Telegram message', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const orderId = `QORD-${Date.now()}`;
    const dateStr = new Date().toISOString().split('T')[0];

    await saveOrderToDatabase(orderId, dateStr);
    await sendTelegramNotification();
    fpixel.trackPurchase(orderId, total, [product.id.toString()], 'UZS');

    setIsLoading(false);
    setIsSuccess(true);

    setTimeout(() => {
      onClose();
      setTimeout(() => setIsSuccess(false), 500);
    }, 3000);
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
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ${
            isDark ? 'bg-dark-900 border border-white/10' : 'bg-white border border-light-border'
          }`}
        >
          <div className={`p-4 md:p-6 border-b flex justify-between items-center ${isDark ? 'border-white/10' : 'border-light-border'}`}>
            <h2 className={`font-bold text-lg md:text-xl ${isDark ? 'text-white' : 'text-light-text'}`}>
              Tezkor xarid
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-light-muted'}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 md:p-6">
            {!isSuccess ? (
              <>
                <div className={`flex gap-4 p-4 rounded-xl mb-6 ${isDark ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                  <div className="w-16 h-16 rounded-lg bg-gray-800 shrink-0 overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className={`font-medium text-sm line-clamp-1 ${isDark ? 'text-white' : 'text-light-text'}`}>{product.name}</h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>Soni: {quantity} ta</p>
                    <p className="text-gold-400 font-bold mt-1 max-w-full truncate">{formatPrice(total)}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Ismingiz</label>
                    <input
                      required
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-400/50 transition-all ${isDark ? 'bg-dark-800 border-white/10 text-white placeholder-gray-600' : 'bg-white border-gray-200 text-light-text placeholder-gray-400'}`}
                      placeholder="Ismingizni kiriting"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Telefon raqamingiz</label>
                    <div className="relative">
                      <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>+998</span>
                      <input
                        required
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full border rounded-xl pl-16 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-400/50 transition-all ${isDark ? 'bg-dark-800 border-white/10 text-white placeholder-gray-600' : 'bg-white border-gray-200 text-light-text placeholder-gray-400'}`}
                        placeholder="90 123 45 67"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gold-400 text-black font-bold text-base py-3.5 rounded-xl hover:bg-gold-500 transition-all disabled:opacity-70 mt-6 flex justify-center items-center gap-2 relative overflow-hidden group"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        <span>Yuborilmoqda...</span>
                      </div>
                    ) : (
                      <>
                        <span>Sotib olish</span>
                        <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-3 flex justify-center items-center gap-1.5">
                    <ShieldCheck size={14} /> Operatorlarimiz tez orada aloqaga chiqishadi.
                  </p>
                </form>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-light-text'}`}>Buyurtma yuborildi</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-light-muted'} text-sm`}>Siz bilan tez orada bog'lanamiz.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickBuyModal;
