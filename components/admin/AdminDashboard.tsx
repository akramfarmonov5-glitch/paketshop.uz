import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, DollarSign, Package } from 'lucide-react';
import { Product, Order } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface AdminDashboardProps {
  products: Product[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: ordersData } = await supabase.from('orders').select('*');
    if (ordersData) {
      setOrders(ordersData as Order[]);
      const total = ordersData.reduce((acc, order) => acc + Number(order.total || 0), 0);
      setTotalSales(total);
    }
  };

  const processSalesData = () => {
      const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
      }).reverse();

      return last7Days.map(date => {
          const dayOrders = orders.filter(o => o.date && o.date.startsWith(date));
          const dailyTotal = dayOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
          const displayDate = new Date(date).toLocaleDateString('uz-UZ', { weekday: 'short' });
          return { name: displayDate, sales: dailyTotal };
      });
  };

  const salesData = processSalesData();

  const categoryData = [
    { name: 'Soatlar', count: products.filter(p => p.category === 'Soatlar').length },
    { name: 'Sumkalar', count: products.filter(p => p.category === 'Sumkalar').length },
    { name: 'Texno', count: products.filter(p => p.category === 'Texnologiya').length },
    { name: 'Aksessuar', count: products.filter(p => p.category === 'Aksessuarlar').length },
  ];

  const formatPrice = (price: number) => {
      if (price >= 1000000) return (price / 1000000).toFixed(1) + 'M UZS';
      if (price >= 1000) return (price / 1000).toFixed(1) + 'K UZS';
      return price + ' UZS';
  };

  const uniqueCustomers = new Set(orders.map(o => o.phone)).size;

  const stats = [
    { label: 'Jami Savdo', value: formatPrice(totalSales), icon: DollarSign, change: '100%' },
    { label: 'Yangi Mijozlar', value: uniqueCustomers, icon: Users, change: '100%' },
    { label: 'Buyurtmalar', value: orders.length, icon: TrendingUp, change: '100%' },
    { label: 'Mahsulotlar', value: products.length, icon: Package, change: '100%' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Boshqaruv Paneli</h2>
        <p className="text-gray-400">Do'koningizning asosiy ko'rsatkichlari.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gold-400/10 rounded-xl">
                <stat.icon className="text-gold-400" size={24} />
              </div>
              <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Haftalik Sotuvlar</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} axisLine={false} />
                <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#FBBF24' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#FBBF24" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Kategoriyalar Bo'yicha</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} axisLine={false} />
                <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                   cursor={{ fill: '#333' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;