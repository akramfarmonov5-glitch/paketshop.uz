'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Download, Loader2, RefreshCw, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const statusLabels = {
  NEW: 'Yangi', CONTACTED: 'Bog‘lanildi', PRICE_SENT: 'Narx yuborildi', WAITING_CUSTOMER: 'Mijoz javobi kutilmoqda', CONFIRMED: 'Tasdiqlandi', PAYMENT_PENDING: 'To‘lov kutilmoqda', PAID: 'To‘landi', PREPARING: 'Tayyorlanmoqda', READY_FOR_PICKUP: 'Olib ketishga tayyor', SHIPPED: 'Yetkazilmoqda', DELIVERED: 'Yakunlandi', CANCELLED: 'Bekor qilindi', LOST: 'Yo‘qotildi',
} as const;
type Status = keyof typeof statusLabels;
interface Manager { id: string; name: string | null; email: string }
interface OrderItem { id: string; skuSnapshot: string; nameSnapshotUz: string; quantity: number; saleUnit: string; unitPrice: number | null; lineTotal: number | null }
interface History { id: string; status: Status; note?: string | null; createdAt: string }
interface AdminOrder { id: string; number: string; customerName: string; phone: string; region: string; preferredPaymentMethod?: string | null; total: number | null; status: Status; assignedToId?: string | null; assignedTo?: Manager | null; items: OrderItem[]; history: History[]; createdAt: string }

const statusTone: Record<Status, string> = {
  NEW: 'bg-amber-400/10 text-amber-300', CONTACTED: 'bg-sky-400/10 text-sky-300', PRICE_SENT: 'bg-cyan-400/10 text-cyan-300', WAITING_CUSTOMER: 'bg-orange-400/10 text-orange-300', CONFIRMED: 'bg-blue-400/10 text-blue-300', PAYMENT_PENDING: 'bg-violet-400/10 text-violet-300', PAID: 'bg-indigo-400/10 text-indigo-300', PREPARING: 'bg-purple-400/10 text-purple-300', READY_FOR_PICKUP: 'bg-fuchsia-400/10 text-fuchsia-300', SHIPPED: 'bg-teal-400/10 text-teal-300', DELIVERED: 'bg-emerald-400/10 text-emerald-300', CANCELLED: 'bg-red-400/10 text-red-300', LOST: 'bg-zinc-400/10 text-zinc-300',
};

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async (search = '', status = '') => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/admin/orders?pageSize=100&q=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`, { cache: 'no-store' });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || 'Buyurtmalarni yuklab bo‘lmadi');
      setOrders(result.orders || []); setManagers(result.managers || []);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Xatolik'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const update = async (id: string, patch: { status?: Status; assignedToId?: string | null }) => {
    setUpdating(id);
    try {
      const response = await fetch('/api/admin/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...patch }) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || 'Buyurtma yangilanmadi');
      setOrders((rows) => rows.map((order) => order.id === id ? result.order : order));
      showToast('Buyurtma yangilandi', 'success');
    } catch (updateError) { showToast(updateError instanceof Error ? updateError.message : 'Xatolik', 'error'); }
    finally { setUpdating(''); }
  };

  const exportCsv = () => {
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [['Raqam', 'Sana', 'Mijoz', 'Telefon', 'Hudud', 'Summa', 'Holat', 'Menejer'], ...orders.map((order) => [order.number, order.createdAt, order.customerName, order.phone, order.region, order.total || '', statusLabels[order.status], order.assignedTo?.name || order.assignedTo?.email || ''])];
    const blob = new Blob(['\uFEFF' + rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `buyurtmalar-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-3xl font-bold text-slate-900">Buyurtmalar (CRM)</h2><p className="mt-2 text-slate-500">Prisma orderlari, menejer va to‘liq status tarixi.</p></div><div className="flex gap-2"><button onClick={() => void load(query, filterStatus)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-slate-900"><RefreshCw size={17} />Yangilash</button><button onClick={exportCsv} disabled={!orders.length} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-bold text-black disabled:opacity-50"><Download size={17} />CSV</button></div></header>
    <form onSubmit={(event) => { event.preventDefault(); void load(query, filterStatus); }} className="grid gap-3 sm:grid-cols-[1fr_240px_auto]"><label className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Raqam, mijoz yoki telefon…" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 outline-none" /></label><select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 text-slate-900"><option value="">Barcha holatlar</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="rounded-xl bg-slate-100 px-5 font-semibold text-slate-900">Qidirish</button></form>
    {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">{error}</p>}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-slate-500"><tr><th className="p-4">Raqam / sana</th><th className="p-4">Mijoz</th><th className="p-4">Mahsulotlar</th><th className="p-4">Summa</th><th className="p-4">Menejer</th><th className="p-4">Holat</th></tr></thead><tbody className="divide-y divide-slate-100">
      {loading ? <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="mx-auto animate-spin text-slate-500" /></td></tr> : !orders.length ? <tr><td colSpan={6} className="p-12 text-center text-slate-400">Buyurtmalar topilmadi.</td></tr> : orders.map((order) => <tr key={order.id} className="align-top hover:bg-white/[.03]"><td className="p-4"><p className="font-mono font-semibold text-slate-900">{order.number}</p><p className="mt-1 text-xs text-slate-400">{new Date(order.createdAt).toLocaleString('uz-UZ')}</p><details className="mt-2 text-xs text-slate-500"><summary className="cursor-pointer">Status tarixi</summary><ul className="mt-2 space-y-1">{order.history.map((entry) => <li key={entry.id}>{statusLabels[entry.status]} · {new Date(entry.createdAt).toLocaleString('uz-UZ')}</li>)}</ul></details></td><td className="p-4"><p className="font-semibold text-slate-900">{order.customerName}</p><a href={`tel:${order.phone}`} className="text-xs text-sky-400">{order.phone}</a><p className="mt-1 text-xs text-slate-400">{order.region}</p></td><td className="max-w-xs p-4"><ul className="space-y-1 text-xs text-slate-600">{order.items.map((item) => <li key={item.id}><span className="font-mono text-slate-400">{item.skuSnapshot}</span> — {item.nameSnapshotUz}, {item.quantity} {item.saleUnit.toLowerCase()}</li>)}</ul></td><td className="p-4 font-semibold text-slate-900">{order.total == null ? 'So‘rov' : `${Number(order.total).toLocaleString('uz-UZ')} UZS`}</td><td className="p-4"><select disabled={updating === order.id} value={order.assignedToId || ''} onChange={(event) => void update(order.id, { assignedToId: event.target.value || null })} className="max-w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"><option value="">Biriktirilmagan</option>{managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name || manager.email}</option>)}</select></td><td className="p-4"><span className={`mb-2 block w-fit rounded-full px-2.5 py-1 text-xs ${statusTone[order.status]}`}>{statusLabels[order.status]}</span><select disabled={updating === order.id} value={order.status} onChange={(event) => void update(order.id, { status: event.target.value as Status })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td></tr>)}
    </tbody></table></div></div>
  </div>;
}
