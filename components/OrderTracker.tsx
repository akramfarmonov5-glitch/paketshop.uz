import React, { useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, ArrowLeft } from 'lucide-react';
import { hasSupabaseCredentials } from '../lib/supabaseClient';
import { Order } from '../types';

interface OrderTrackerProps {
  onBack: () => void;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ onBack }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setLoading(true);
    setSearched(true);

    try {
      if (!hasSupabaseCredentials) {
        setTimeout(() => {
          if (phoneNumber.includes('901234567')) {
            setOrders([
              {
                id: 'ORD-DEMO-1',
                created_at: new Date().toISOString(),
                status: 'Yetkazilmoqda',
                total: 12500000,
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'Naqd',
                phone: phoneNumber,
                customerName: 'Demo mijoz',
                items: [{ name: 'Midnight Chronograph', quantity: 1 }],
              },
            ]);
          } else {
            setOrders([]);
          }
          setLoading(false);
        }, 1000);
        return;
      }

      const response = await fetch('/api/order-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Tracking API xatosi');
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error('Search error:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Kutilmoqda':
        return <Clock size={20} className="text-yellow-400" />;
      case 'Yetkazilmoqda':
        return <Truck size={20} className="text-blue-400" />;
      case 'Yakunlandi':
        return <CheckCircle size={20} className="text-green-400" />;
      default:
        return <Package size={20} className="text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Bosh sahifaga qaytish</span>
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Buyurtmani Kuzatish</h1>
          <p className="text-gray-400">
            Buyurtma holatini tekshirish uchun xarid vaqtida kiritgan telefon raqamingizni yozing.
          </p>
        </div>

        <div className="bg-zinc-900 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl mb-10">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-lg">+998</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="90 123 45 67"
                className="w-full bg-black border border-white/20 rounded-xl pl-16 pr-4 py-4 text-lg text-white focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gold-400 text-black font-bold py-4 px-8 rounded-xl hover:bg-gold-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
              ) : (
                <>
                  <Search size={20} /> Kuzatish
                </>
              )}
            </button>
          </form>
        </div>

        {searched && !loading && (
          <div className="space-y-6">
            {orders && orders.length > 0 ? (
              <>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="text-gold-400" />
                  Topilgan Buyurtmalar ({orders.length})
                </h2>
                {orders.map((order) => (
                  <div key={order.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-gold-400/30 transition-all">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-white/5 pb-4">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Buyurtma ID</span>
                        <span className="font-mono text-white font-medium">{order.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full w-fit">
                        {getStatusIcon(order.status || 'Kutilmoqda')}
                        <span className="text-sm font-medium">{order.status || 'Kutilmoqda'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block mb-1">Sana</span>
                        <span className="text-sm text-white">{formatDate(order.created_at || order.date)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {Array.isArray(order.items) &&
                        order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-300">
                              {item.name} <span className="text-gray-600">x{item.quantity}</span>
                            </span>
                          </div>
                        ))}

                      <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                        <span className="text-gray-400">Jami to'lov:</span>
                        <span className="text-lg font-bold text-gold-400">
                          {new Intl.NumberFormat('uz-UZ').format(order.total)} UZS
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-12 bg-zinc-900/50 rounded-3xl border border-white/5 border-dashed">
                <Package size={48} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Buyurtmalar topilmadi</h3>
                <p className="text-gray-400 max-w-xs mx-auto">
                  Ushbu raqamga rasmiylashtirilgan buyurtmalar mavjud emas. Raqamni to'g'ri kiritganingizni tekshiring.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracker;
