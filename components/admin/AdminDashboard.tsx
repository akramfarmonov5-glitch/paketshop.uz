import React, { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, DollarSign, Package } from 'lucide-react';

interface DashboardData {
  totalSales: number;
  orderCount: number;
  customerCount: number;
  productCount: number;
  sales: Array<{ date: string; sales: number }>;
  categories: Array<{ id: string; name: string; count: number }>;
}

const emptyDashboard: DashboardData = {
  totalSales: 0,
  orderCount: 0,
  customerCount: 0,
  productCount: 0,
  sales: [],
  categories: [],
};

const AdminDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void fetch('/api/admin/dashboard')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Statistika yuklanmadi');
        if (active) setDashboard(result);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Statistika yuklanmadi');
      });
    return () => { active = false; };
  }, []);

  const salesData = useMemo(() => dashboard.sales.map((entry) => ({
    name: new Date(`${entry.date}T00:00:00Z`).toLocaleDateString('uz-UZ', { weekday: 'short', timeZone: 'UTC' }),
    sales: entry.sales,
  })), [dashboard.sales]);

  const formatPrice = (price: number) => {
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M UZS`;
    if (price >= 1_000) return `${(price / 1_000).toFixed(1)}K UZS`;
    return `${price} UZS`;
  };

  const stats = [
    { label: 'Jami Savdo', value: formatPrice(dashboard.totalSales), icon: DollarSign },
    { label: 'Mijozlar', value: dashboard.customerCount, icon: Users },
    { label: 'Buyurtmalar', value: dashboard.orderCount, icon: TrendingUp },
    { label: 'Faol mahsulotlar', value: dashboard.productCount, icon: Package },
  ];

  return (
    <div className="min-h-screen space-y-8 bg-slate-50 p-4 text-slate-900 animate-fade-in md:p-8">
      <div>
        <h2 className="mb-2 text-3xl font-bold text-slate-900">Boshqaruv Paneli</h2>
        <p className="font-medium text-slate-500">Prisma bazasidagi joriy ko‘rsatkichlar.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 w-fit rounded-xl bg-red-50 p-3">
              <stat.icon className="text-red-600" size={24} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{stat.label}</h3>
            <p className="mt-1 text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-slate-900">Haftalik savdo</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }} />
                <Area type="monotone" dataKey="sales" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-slate-900">Kategoriyalar bo‘yicha</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
