import React, { useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, ArrowLeft } from 'lucide-react';
import { hasSupabaseCredentials } from '../lib/supabaseClient';
interface OrderItem {
  name: any;
  quantity: number;
}
interface Order {
  id: string;
  created_at?: string;
  date: string;
  status?: string;
  total: number;
  paymentMethod?: string;
  phone?: string;
  customerName?: string;
  items?: OrderItem[];
}
import { getLocalizedText } from '../lib/i18nUtils';

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
        return <Clock size={20} className="text-amber-500" />;
      case 'Yetkazilmoqda':
        return <Truck size={20} className="text-blue-500" />;
      case 'Yakunlandi':
        return <CheckCircle size={20} className="text-emerald-500" />;
      default:
        return <Package size={20} className="text-slate-400" />;
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
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 text-slate-900">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          <span>Bosh sahifaga qaytish</span>
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Buyurtmani Kuzatish</h1>
          <p className="text-slate-600 font-medium">
            Buyurtma holatini tekshirish uchun xarid vaqtida kiritgan telefon raqamingizni yozing.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm mb-10">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">+998</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="90 123 45 67"
                className="w-full bg-white border border-slate-300 rounded-xl pl-16 pr-4 py-4 text-lg text-slate-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all font-medium placeholder-slate-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="text-red-600" />
                  Topilgan Buyurtmalar ({orders.length})
                </h2>
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-xs text-slate-500 block mb-1 font-bold uppercase tracking-wider">Buyurtma ID</span>
                        <span className="font-mono text-slate-900 font-bold">#{order.id.slice(0, 8)}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full w-fit">
                        {getStatusIcon(order.status || 'Kutilmoqda')}
                        <span className="text-sm font-bold text-slate-700">{order.status || 'Kutilmoqda'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block mb-1 font-bold uppercase tracking-wider">Sana</span>
                        <span className="text-sm font-medium text-slate-900">{formatDate(order.created_at || order.date)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {Array.isArray(order.items) &&
                        order.items.map((item: OrderItem, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm font-medium">
                            <span className="text-slate-700">
                              {getLocalizedText(item.name, 'uz')} <span className="text-slate-400 font-bold ml-2">x{item.quantity}</span>
                            </span>
                          </div>
                        ))}

                      <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                        <span className="text-slate-500 font-medium">Jami to'lov:</span>
                        <span className="text-lg font-black text-slate-900">
                          {new Intl.NumberFormat('uz-UZ').format(order.total)} UZS
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                <Package size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Buyurtmalar topilmadi</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">
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
