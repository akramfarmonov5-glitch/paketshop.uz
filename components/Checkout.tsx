import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Truck, Send, Wallet, Banknote, X, Smartphone, ExternalLink, Ticket, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import * as fpixel from '../lib/fpixel';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

interface CheckoutProps {
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onBack }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paynet' | 'cash'>('paynet');
  const [showPaynetModal, setShowPaynetModal] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: 'Toshkent',
  });

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const PAYNET_URL = "https://app.paynet.uz/?m=49156&i=4805742d-d76c-4b39-8c02-8ddf1c450f33&branchId=&actTypeId=144";
  const PAYNET_QR_IMAGE = "/images/paynet-qr.jpg";
  const QR_FALLBACK = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(PAYNET_URL)}&color=000000&bgcolor=ffffff`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsCheckingPromo(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const code = promoCode.trim().toUpperCase();
    if (code === 'PAKET2026') {
      const discount = cartTotal * 0.1;
      setDiscountAmount(discount);
      setAppliedPromo(code);
      showToast("Promo kod muvaffaqiyatli qo'llanildi!", "success");
    } else if (code === 'ADMIN') {
      const discount = cartTotal * 0.5;
      setDiscountAmount(discount);
      setAppliedPromo(code);
      showToast("Maxsus chegirma qo'llanildi!", "success");
    } else {
      showToast("Bunday promo kod mavjud emas.", "error");
      setDiscountAmount(0);
      setAppliedPromo('');
    }
    setIsCheckingPromo(false);
  };

  const handleRemovePromo = () => {
    setDiscountAmount(0);
    setAppliedPromo('');
    setPromoCode('');
  };

  const saveOrderToDatabase = async () => {
    const env = import.meta.env || {};
    if (!env.VITE_SUPABASE_URL) return;

    const orderId = `ORD-${Date.now()}`;
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
      const { error } = await supabase.from('orders').insert({
        id: orderId,
        "customerName": `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        total: finalTotal,
        status: 'Kutilmoqda',
        date: dateStr,
        "paymentMethod": paymentMethod === 'paynet' ? 'Paynet' : 'Naqd'
        // address, city, items columns currently missing in DB, skipping for now
      });

      if (error) {
        console.error("Error saving order to Supabase:", error);
        showToast("Buyurtmani saqlashda xatolik: " + error.message, "error");
      }
    } catch (e) {
      console.error("Supabase error:", e);
    }
  };

  const sendTelegramNotification = async () => {
    const env = import.meta.env || {};
    const token = env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = env.VITE_TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn("Telegram credentials not found.");
      return;
    }

    const itemsList = cart.map((item, index) =>
      `${index + 1}. ${item.name} (x${item.quantity}) - ${new Intl.NumberFormat('uz-UZ').format(item.price * item.quantity)} UZS`
    ).join('\n');

    const totalFormatted = new Intl.NumberFormat('uz-UZ').format(finalTotal) + ' UZS';
    const discountInfo = appliedPromo ? `\n🏷 <b>Promo:</b> ${appliedPromo} (-${new Intl.NumberFormat('uz-UZ').format(discountAmount)} UZS)` : '';
    const paymentLabel = paymentMethod === 'paynet' ? '📲 Paynet (Onlayn)' : '💵 Naqd (Yetkazilganda)';

    const message = `
📦 <b>YANGI BUYURTMA! (PaketShop)</b>

👤 <b>Mijoz:</b> ${formData.firstName} ${formData.lastName}
📞 <b>Tel:</b> ${formData.phone}
📍 <b>Manzil:</b> ${formData.city}, ${formData.address}

💳 <b>To'lov turi:</b> ${paymentLabel}

🛒 <b>Mahsulotlar:</b>
${itemsList}

------------------
${discountInfo}
💰 <b>JAMI TO'LOV:</b> ${totalFormatted}
    `;

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
      });
    } catch (error) {
      console.error("Failed to send Telegram message", error);
    }
  };

  const completeOrder = async () => {
    await saveOrderToDatabase();

    const orderId = `ORD-${Date.now()}`;
    fpixel.trackPurchase(orderId, finalTotal, 'UZS');

    setShowPaynetModal(false);
    setIsLoading(false);
    setIsSuccess(true);
    clearCart();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await sendTelegramNotification();

    if (paymentMethod === 'paynet') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      if (isMobile) {
        window.open(PAYNET_URL, '_blank');
        setTimeout(completeOrder, 2000);
      } else {
        setShowPaynetModal(true);
        setIsLoading(false);
        return;
      }
    } else {
      setTimeout(completeOrder, 1500);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
  };

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className={`min-h-screen pt-24 pb-12 flex flex-col items-center justify-center text-center px-6 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-light-bg'}`}>
        <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-light-text'}`}>Savatchangiz bo'sh</h2>
        <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>Buyurtma berish uchun avval mahsulot tanlang.</p>
        <button onClick={onBack} className={`px-8 py-3 rounded-full transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-light-card text-light-text hover:bg-gray-200'}`}>
          Do'konga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 relative transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-light-bg text-light-text'}`}>
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <button onClick={onBack} className={`flex items-center gap-2 mb-8 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-light-muted hover:text-light-text'}`}>
          <ArrowLeft size={18} />
          <span>Do'konga qaytish</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-light-text'}`}>Buyurtmani rasmiylashtirish</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>Ismingiz</label>
                  <input required name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} className={`w-full border rounded-lg px-4 py-3 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all ${isDark ? 'bg-dark-800 border-white/10 text-white' : 'bg-white border-light-border text-light-text'}`} placeholder="Aziz" />
                </div>
                <div className="space-y-2">
                  <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>Familiyangiz</label>
                  <input required name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} className={`w-full border rounded-lg px-4 py-3 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all ${isDark ? 'bg-dark-800 border-white/10 text-white' : 'bg-white border-light-border text-light-text'}`} placeholder="Rahimov" />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>Telefon raqam</label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-light-muted'}`}>+998</span>
                  <input required name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className={`w-full border rounded-lg pl-16 pr-4 py-3 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all ${isDark ? 'bg-dark-800 border-white/10 text-white' : 'bg-white border-light-border text-light-text'}`} placeholder="90 123 45 67" />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>Shahar</label>
                <select name="city" value={formData.city} onChange={handleInputChange} className={`w-full border rounded-lg px-4 py-3 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all appearance-none ${isDark ? 'bg-dark-800 border-white/10 text-white' : 'bg-white border-light-border text-light-text'}`}>
                  <option className={isDark ? 'bg-zinc-900 text-white' : 'bg-white text-light-text'} value="Toshkent">Toshkent</option>
                  <option className={isDark ? 'bg-zinc-900 text-white' : 'bg-white text-light-text'} value="Samarqand">Samarqand</option>
                  <option className={isDark ? 'bg-zinc-900 text-white' : 'bg-white text-light-text'} value="Buxoro">Buxoro</option>
                  <option className={isDark ? 'bg-zinc-900 text-white' : 'bg-white text-light-text'} value="Andijon">Andijon</option>
                  <option className={isDark ? 'bg-zinc-900 text-white' : 'bg-white text-light-text'} value="Farg'ona">Farg'ona</option>
                  <option className={isDark ? 'bg-zinc-900 text-white' : 'bg-white text-light-text'} value="Namangan">Namangan</option>
                  <option className={isDark ? 'bg-zinc-900 text-white' : 'bg-white text-light-text'} value="Xorazm">Xorazm</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>Manzil</label>
                <input required name="address" type="text" value={formData.address} onChange={handleInputChange} className={`w-full border rounded-lg px-4 py-3 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all ${isDark ? 'bg-dark-800 border-white/10 text-white' : 'bg-white border-light-border text-light-text'}`} placeholder="Amir Temur ko'chasi, 15-uy" />
              </div>

              <div className="pt-2">
                <label className={`text-sm mb-2 block ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>Promo kod (Agar bo'lsa)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-light-muted'}`} size={18} />
                    <input
                      type="text"
                      value={promoCode}
                      disabled={!!appliedPromo}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Kodini kiriting"
                      className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:border-gold-400 focus:outline-none disabled:opacity-50 ${isDark ? 'bg-dark-800 border-white/10 text-white' : 'bg-white border-light-border text-light-text'}`}
                    />
                  </div>
                  {!appliedPromo ? (
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={!promoCode || isCheckingPromo}
                      className={`px-6 rounded-lg font-medium transition-colors disabled:opacity-50 ${isDark ? 'bg-white/10 hover:bg-gold-400 hover:text-black text-white' : 'bg-light-card hover:bg-gold-400 hover:text-black text-light-text'}`}
                    >
                      {isCheckingPromo ? <Loader2 className="animate-spin" size={20} /> : "Qo'llash"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 rounded-lg font-medium transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
                {appliedPromo && (
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Kod qo'llanildi! Siz {formatPrice(discountAmount)} tejadingiz.
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>To'lov usuli</label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setPaymentMethod('paynet')} className={`relative p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${paymentMethod === 'paynet' ? 'bg-gold-500/10 border-gold-400 text-gold-400 ring-1 ring-gold-400' : isDark ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20' : 'bg-light-card border-light-border text-light-muted hover:bg-gray-200'}`}>
                    <Wallet size={24} />
                    <span className="font-medium text-sm">Paynet (Onlayn)</span>
                    {paymentMethod === 'paynet' && <motion.div layoutId="check" className="absolute top-2 right-2 w-2 h-2 bg-gold-400 rounded-full" />}
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('cash')} className={`relative p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${paymentMethod === 'cash' ? 'bg-gold-500/10 border-gold-400 text-gold-400 ring-1 ring-gold-400' : isDark ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20' : 'bg-light-card border-light-border text-light-muted hover:bg-gray-200'}`}>
                    <Banknote size={24} />
                    <span className="font-medium text-sm">Naqd (Qabulda)</span>
                    {paymentMethod === 'cash' && <motion.div layoutId="check" className="absolute top-2 right-2 w-2 h-2 bg-gold-400 rounded-full" />}
                  </button>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={isLoading} className="w-full bg-gold-400 text-black font-bold text-lg py-4 rounded-xl hover:bg-gold-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>Jarayonda...</span>
                    </div>
                  ) : (
                    <>
                      <span>{paymentMethod === 'paynet' ? "To'lash" : "Buyurtma berish"}</span>
                      <span className="text-sm font-normal">({formatPrice(finalTotal)})</span>
                      <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
                  <ShieldCheck size={16} /> Xavfsiz to'lov va ma'lumotlar himoyasi
                </p>
              </div>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`border rounded-2xl p-8 h-fit sticky top-28 ${isDark ? 'bg-dark-900 border-white/10' : 'bg-white border-light-border shadow-sm'}`}>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-light-text'}`}>Buyurtma tarkibi</h3>
            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className={`w-16 h-20 rounded-lg overflow-hidden shrink-0 ${isDark ? 'bg-gray-800' : 'bg-light-card'}`}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>{item.name}</h4>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>{item.category}</p>
                    <div className="flex justify-between mt-2">
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-light-muted'}`}>x{item.quantity}</span>
                      <span className="text-sm font-medium text-gold-400">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={`space-y-3 pt-6 border-t ${isDark ? 'border-white/10' : 'border-light-border'}`}>
              <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
                <span>Mahsulotlar</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Chegirma</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className={`flex justify-between ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
                <span>Yetkazib berish</span>
                <span className="text-green-400">Bepul</span>
              </div>
              <div className={`flex justify-between text-xl font-bold pt-4 border-t ${isDark ? 'text-white border-white/5' : 'text-light-text border-light-border'}`}>
                <span>Jami to'lov</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-light-card border-light-border'}`}>
                <Truck className="text-gold-400 mb-2" size={24} />
                <span className={`text-xs text-center ${isDark ? 'text-gray-300' : 'text-light-muted'}`}>Tezkor yetkazish</span>
              </div>
              <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-light-card border-light-border'}`}>
                <CreditCard className="text-gold-400 mb-2" size={24} />
                <span className={`text-xs text-center ${isDark ? 'text-gray-300' : 'text-light-muted'}`}>Qulay to'lov</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showPaynetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaynetModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-dark-900 border border-gold-400/30 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.1)] flex flex-col items-center">
              <button onClick={() => setShowPaynetModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-gold-400/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-gold-400/30">
                <Smartphone size={32} className="text-gold-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Paynet orqali to'lash</h2>
              <p className="text-gray-400 text-sm mb-6">To'lovni amalga oshirish uchun QR kodni skanerlang.</p>
              <div className="p-4 bg-white rounded-2xl mb-6 shadow-xl">
                <img src={PAYNET_QR_IMAGE} alt="Paynet QR Code" className="w-48 h-48 object-contain" onError={(e) => { e.currentTarget.src = QR_FALLBACK; }} />
              </div>
              <div className="flex flex-col gap-3 w-full">
                <button onClick={completeOrder} className="w-full bg-gold-400 text-black font-bold py-3.5 rounded-xl hover:bg-gold-500 transition-colors">To'lov qildim</button>
                <a href={PAYNET_URL} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors text-sm"><ExternalLink size={16} /> Havolani ochish</a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-dark-900 border border-white/10 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} className="text-green-500" /></div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Buyurtmangiz qabul qilindi!</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">Rahmat, {formData.firstName}! Menejerlarimiz tez orada <b>{formData.phone}</b> raqami orqali siz bilan bog'lanishadi.</p>
              <button onClick={onBack} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors">Bosh sahifaga qaytish</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;