import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

interface CartSidebarProps {
  onCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ onCheckout }) => {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { isDark } = useTheme();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 h-full w-full md:w-[450px] border-l z-[70] shadow-2xl flex flex-col transition-colors duration-300 ${isDark ? 'bg-dark-900 border-white/10' : 'bg-white border-light-border'}`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b backdrop-blur-md ${isDark ? 'border-white/10 bg-dark-900/50' : 'border-light-border bg-white/50'}`}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-gold-400" />
                <h2 className={`text-xl font-bold tracking-wide ${isDark ? 'text-white' : 'text-light-text'}`}>Savatcha</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-white/10 text-gray-300' : 'bg-light-card text-light-muted'}`}>
                  {cart.length} ta mahsulot
                </span>
              </div>
              <button
                onClick={toggleCart}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-light-card text-light-muted hover:text-light-text'}`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-white/5' : 'bg-light-card'}`}>
                    <ShoppingBag size={32} className={isDark ? 'text-gray-600' : 'text-light-muted'} />
                  </div>
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>Savatchangiz bo'sh</p>
                  <button onClick={toggleCart} className="text-gold-400 hover:text-gold-500 underline underline-offset-4">
                    Xaridni davom ettirish
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 group"
                  >
                    <div className="w-24 h-32 rounded-xl overflow-hidden bg-gray-800 border border-white/5 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className={`font-medium line-clamp-1 ${isDark ? 'text-white' : 'text-light-text'}`}>{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>{item.category}</p>
                      </div>

                      <div className="flex items-end justify-between">
                        <p className="text-gold-400 font-medium">{formatPrice(item.price)}</p>

                        <div className="flex items-center gap-3 bg-white/5 rounded-full px-2 py-1 border border-white/5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className={`p-6 border-t ${isDark ? 'border-white/10 bg-dark-900' : 'border-light-border bg-light-card'}`}>
                <div className="space-y-3 mb-6">
                  <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
                    <span>Mahsulotlar summasi</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-light-muted'}`}>
                    <span>Yetkazib berish</span>
                    <span className="text-green-400">Bepul</span>
                  </div>
                  <div className={`flex justify-between text-xl font-bold pt-4 border-t ${isDark ? 'text-white border-white/5' : 'text-light-text border-light-border'}`}>
                    <span>Jami</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toggleCart();
                    onCheckout();
                  }}
                  className="w-full py-4 bg-gold-400 text-black font-bold rounded-xl hover:bg-gold-500 transition-colors flex items-center justify-center gap-2 group"
                >
                  Buyurtma berish
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;