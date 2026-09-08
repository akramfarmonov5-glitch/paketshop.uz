import React, { useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, ArrowLeft, AlertCircle, LucideIcon } from 'lucide-react';
import { getLocalizedText } from '../lib/i18nUtils';

interface OrderItem {
  id?: string;
  name: any;
  sku?: string;
  quantity: number;
  saleUnit?: string;
  unitPrice?: number | null;
  lineTotal?: number | null;
}

interface Order {
  id: string;
  number?: string;
  created_at?: string;
  createdAt?: string;
  date: string;
  status?: string;
  total: number;
  paymentMethod?: string;
  deliveryMethod?: string;
  phone?: string;
  customerName?: string;
  region?: string;
  address?: string;
  items?: OrderItem[];
}

interface OrderTrackerProps {
  onBack: () => void;
  lang?: string;
}

const STATUS_MAP: Record<
  string,
  { labelUz: string; labelRu: string; icon: LucideIcon; badgeClass: string }
> = {
  NEW: { labelUz: 'Qabul qilindi', labelRu: 'Принят', icon: Clock, badgeClass: 'text-amber-700 bg-amber-50 border-amber-200' },
  CONTACTED: { labelUz: 'Bog‘lanildi', labelRu: 'Связались', icon: Clock, badgeClass: 'text-blue-700 bg-blue-50 border-blue-200' },
  PRICE_SENT: { labelUz: 'Narx yuborildi', labelRu: 'Цена отправлена', icon: Clock, badgeClass: 'text-blue-700 bg-blue-50 border-blue-200' },
  WAITING_CUSTOMER: { labelUz: 'Mijoz javobi kutilmoqda', labelRu: 'Ожидание клиента', icon: Clock, badgeClass: 'text-amber-700 bg-amber-50 border-amber-200' },
  CONFIRMED: { labelUz: 'Tasdiqlandi', labelRu: 'Подтвержден', icon: CheckCircle, badgeClass: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  PAYMENT_PENDING: { labelUz: 'To‘lov kutilmoqda', labelRu: 'Ожидает оплаты', icon: Clock, badgeClass: 'text-amber-700 bg-amber-50 border-amber-200' },
  PAID: { labelUz: 'To‘landi', labelRu: 'Оплачен', icon: CheckCircle, badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  PREPARING: { labelUz: 'Tayyorlanmoqda', labelRu: 'Комплектуется', icon: Package, badgeClass: 'text-purple-700 bg-purple-50 border-purple-200' },
  READY_FOR_PICKUP: { labelUz: 'Olib ketishga tayyor', labelRu: 'Готов к выдаче', icon: Package, badgeClass: 'text-teal-700 bg-teal-50 border-teal-200' },
  SHIPPED: { labelUz: 'Yetkazilmoqda', labelRu: 'В пути / Доставляется', icon: Truck, badgeClass: 'text-blue-700 bg-blue-50 border-blue-200' },
  DELIVERED: { labelUz: 'Yetkazib berildi', labelRu: 'Доставлен', icon: CheckCircle, badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  CANCELLED: { labelUz: 'Bekor qilindi', labelRu: 'Отменен', icon: AlertCircle, badgeClass: 'text-red-700 bg-red-50 border-red-200' },
  LOST: { labelUz: 'Yo‘qotilgan', labelRu: 'Утерян', icon: AlertCircle, badgeClass: 'text-slate-700 bg-slate-100 border-slate-300' },
};

const UNIT_LABELS: Record<string, { uz: string; ru: string }> = {
  PACK: { uz: 'qadoq', ru: 'упак.' },
  CARTON: { uz: 'korobka', ru: 'кор.' },
  PIECE: { uz: 'dona', ru: 'шт.' },
  ROLL: { uz: 'rulon', ru: 'рулон' },
  KILOGRAM: { uz: 'kg', ru: 'кг' },
};

const OrderTracker: React.FC<OrderTrackerProps> = ({ onBack, lang = 'uz' }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isRu = lang === 'ru';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setLoading(true);
    setSearched(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/order-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanQuery }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isRu ? 'Ошибка при поиске' : 'Qidirishda xatolik'));
      }

      setOrders(data.orders || []);
    } catch (error: any) {
      console.error('Order tracking search error:', error);
      setErrorMessage(error?.message || (isRu ? 'Qidirishda xatolik yuz berdi' : 'Xatolik yuz berdi'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (statusCode?: string) => {
    const code = (statusCode || 'NEW').toUpperCase();
    if (STATUS_MAP[code]) {
      return {
        label: isRu ? STATUS_MAP[code].labelRu : STATUS_MAP[code].labelUz,
        Icon: STATUS_MAP[code].icon,
        badgeClass: STATUS_MAP[code].badgeClass,
      };
    }
    return {
      label: statusCode || (isRu ? 'Обрабатывается' : 'Ko‘rib chiqilmoqda'),
      Icon: Package,
      badgeClass: 'text-slate-700 bg-slate-100 border-slate-200',
    };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString(isRu ? 'ru-RU' : 'uz-UZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 text-slate-900">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-red-600 mb-8 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} />
          <span>{isRu ? 'Назад на главную' : 'Bosh sahifaga qaytish'}</span>
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-slate-900 tracking-tight">
            {isRu ? 'Отслеживание заказа' : 'Buyurtmani kuzatish'}
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-base">
            {isRu
              ? 'Введите номер телефона или номер заказа (PS-...), чтобы узнать актуальный статус доставки.'
              : 'Buyurtma holatini tekshirish uchun xarid vaqtida ko‘rsatilgan telefon raqamingizni yoki buyurtma kodini (PS-...) kiriting.'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm mb-10">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isRu ? '+998 90 123 45 67 или PS-2026...' : '+998 90 123 45 67 yoki PS-2026...'}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-4 text-base text-slate-900 focus:bg-white focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all font-medium placeholder-slate-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shrink-0"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Search size={18} />
                  <span>{isRu ? 'Проверить' : 'Kuzatish'}</span>
                </>
              )}
            </button>
          </form>
          {errorMessage && (
            <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5 font-medium">
              <AlertCircle size={16} />
              {errorMessage}
            </p>
          )}
        </div>

        {searched && !loading && (
          <div className="space-y-6">
            {orders && orders.length > 0 ? (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="text-red-600" size={22} />
                  {isRu ? `Найденные заказы (${orders.length})` : `Topilgan buyurtmalar (${orders.length})`}
                </h2>
                {orders.map((order) => {
                  const status = getStatusInfo(order.status);
                  const StatusIcon = status.Icon;

                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-slate-200 rounded-3xl p-6 md:p-7 hover:shadow-md transition-all shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                        <div>
                          <span className="text-xs text-slate-400 block mb-1 font-bold uppercase tracking-wider">
                            {isRu ? 'Номер заказа' : 'Buyurtma raqami'}
                          </span>
                          <span className="font-mono text-base md:text-lg text-slate-900 font-black">
                            {order.number || `#${order.id.slice(0, 10)}`}
                          </span>
                        </div>
                        <div className={`inline-flex items-center gap-2 border px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold ${status.badgeClass}`}>
                          <StatusIcon size={16} />
                          <span>{status.label}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500 mb-5 bg-slate-50 p-4 rounded-2xl">
                        <div>
                          <span className="text-slate-400 block">{isRu ? 'Дата оформления:' : 'Sana:'}</span>
                          <span className="font-semibold text-slate-800 text-sm">
                            {formatDate(order.createdAt || order.created_at || order.date)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">{isRu ? 'Способ оплаты:' : 'To‘lov usuli:'}</span>
                          <span className="font-semibold text-slate-800 text-sm">{order.paymentMethod || 'Kelishiladi'}</span>
                        </div>
                        {order.deliveryMethod && (
                          <div className="sm:col-span-2">
                            <span className="text-slate-400 block">{isRu ? 'Доставка:' : 'Yetkazib berish:'}</span>
                            <span className="font-semibold text-slate-800 text-sm">
                              {order.deliveryMethod} {order.region ? `(${order.region})` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Items */}
                      <div className="space-y-2.5 mb-5">
                        <span className="text-xs font-bold uppercase text-slate-400 block tracking-wider">
                          {isRu ? 'Товары в заказе:' : 'Buyurtmadagi mahsulotlar:'}
                        </span>
                        {Array.isArray(order.items) && order.items.length > 0 ? (
                          order.items.map((item: OrderItem, idx: number) => {
                            const unit = item.saleUnit ? UNIT_LABELS[item.saleUnit]?.[isRu ? 'ru' : 'uz'] || item.saleUnit : '';
                            return (
                              <div
                                key={item.id || idx}
                                className="flex justify-between items-center text-sm py-2 border-b border-slate-50 last:border-0"
                              >
                                <div className="text-slate-800 font-medium">
                                  <span>{getLocalizedText(item.name, lang)}</span>
                                  {item.sku && <span className="text-xs text-slate-400 ml-2 font-mono">({item.sku})</span>}
                                </div>
                                <div className="text-slate-900 font-bold shrink-0 ml-4">
                                  {item.quantity} {unit}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            {isRu ? 'Список товаров уточняется менеджером' : 'Mahsulotlar ro‘yxati menejer tomonidan aniqlanmoqda'}
                          </p>
                        )}
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-slate-500 font-semibold text-sm">
                          {isRu ? 'Итоговая сумма:' : 'Jami summa:'}
                        </span>
                        <span className="text-lg md:text-xl font-black text-slate-900">
                          {order.total > 0 ? `${new Intl.NumberFormat('uz-UZ').format(order.total)} UZS` : (isRu ? 'Уточняется' : 'Kelishiladi')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                <Package size={44} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {isRu ? 'Заказы не найдены' : 'Buyurtmalar topilmadi'}
                </h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  {isRu
                    ? 'По указанному номеру или коду заказов не обнаружено. Проверьте правильность ввода.'
                    : 'Ushbu telefon raqam yoki buyurtma kodiga oid buyurtma topilmadi. Raqamni to‘g‘ri kiritganingizni tekshiring.'}
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
