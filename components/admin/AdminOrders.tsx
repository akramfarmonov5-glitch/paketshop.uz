import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { Clock, CheckCircle, Truck, Package, Search, Download, Trash2 } from 'lucide-react';

import { supabase } from '../../lib/supabaseClient';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setOrders(data as Order[]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Kutilmoqda': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'To\'landi': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Yetkazilmoqda': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Yakunlandi': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Kutilmoqda': return Clock;
      case 'To\'landi': return CheckCircle;
      case 'Yetkazilmoqda': return Truck;
      case 'Yakunlandi': return Package;
      default: return Clock;
    }
  };

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    // Optimistic update
    setOrders(prev => prev.map(order =>
      order.id === id ? { ...order, status: newStatus } : order
    ));

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error("Status update failed:", error);
        // Revert if needed
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error('Error deleting order:', err);
      alert("Buyurtmani o'chirishda xatolik yuz berdi");
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';

  const handleExportCSV = () => {
    const headers = ['ID', 'Sana', 'Mijoz', 'Telefon', 'To\'lov turi', 'Summa', 'Holat'];
    const rows = orders.map(o => [
        o.id,
        o.date,
        `"${o.customerName || ''}"`,
        `"${o.phone || ''}"`,
        o.paymentMethod,
        o.total,
        o.status
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buyurtmalar-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Buyurtmalar (CRM)</h2>
          <p className="text-gray-400">Mijozlar buyurtmalarini boshqarish va kuzatish tizimi.</p>
        </div>
        <button 
            onClick={handleExportCSV} 
            disabled={orders.length === 0}
            className="flex items-center gap-2 bg-gold-400 hover:bg-gold-500 text-black px-4 py-2 rounded-xl font-bold transition-colors disabled:opacity-50"
        >
            <Download size={18} />
            Excel yuklab olish
        </button>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-400">ID & Sana</th>
              <th className="p-4 text-sm font-medium text-gray-400">Mijoz</th>
              <th className="p-4 text-sm font-medium text-gray-400">To'lov</th>
              <th className="p-4 text-sm font-medium text-gray-400">Summa</th>
              <th className="p-4 text-sm font-medium text-gray-400">Holat</th>
              <th className="p-4 text-sm font-medium text-gray-400">Boshqaruv</th>
              <th className="p-4 text-sm font-medium text-gray-400 text-center">O'chirish</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-mono text-white text-sm">{order.id}</div>
                    <div className="text-xs text-gray-500">{order.date}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.phone}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded border ${order.paymentMethod === 'Paynet' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 'border-green-500/30 text-green-400 bg-green-500/10'}`}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-white">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                      <StatusIcon size={12} />
                      <span>{order.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                      className="bg-black border border-white/20 text-white text-xs rounded-lg px-2 py-1.5 focus:border-gold-400 outline-none cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <option className="bg-zinc-900 text-white" value="Kutilmoqda">Kutilmoqda</option>
                      <option className="bg-zinc-900 text-white" value="To'landi">To'landi</option>
                      <option className="bg-zinc-900 text-white" value="Yetkazilmoqda">Yetkazilmoqda</option>
                      <option className="bg-zinc-900 text-white" value="Yakunlandi">Yakunlandi</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Buyurtmani o'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;