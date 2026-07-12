'use client';
import React, { useEffect, useState } from 'react';
import { Archive, Loader2, Plus, RefreshCw } from 'lucide-react';
import { slugify } from '@/lib/slugify';

interface AdminCategoryRecord {
  id: string;
  slugUz: string;
  slugRu: string;
  active: boolean;
  sortOrder: number;
  translations: Array<{ locale: string; name: string }>;
  _count?: { products: number; children: number };
}

export default function AdminCategoriesV2() {
  const [categories, setCategories] = useState<AdminCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nameUz: '', nameRu: '', parentId: '', sortOrder: 0 });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/categories');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Kategoriyalar yuklanmadi');
      setCategories(result.categories);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Xatolik'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    const slugUz = slugify(form.nameUz);
    try {
      const response = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parentId: form.parentId || null, slugUz, slugRu: `${slugUz}-ru`, name: { uz: form.nameUz, ru: form.nameRu }, sortOrder: form.sortOrder, active: true }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Kategoriya saqlanmadi');
      setForm({ nameUz: '', nameRu: '', parentId: '', sortOrder: 0 });
      await load();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Xatolik'); }
    finally { setSaving(false); }
  };

  const archive = async (id: string) => {
    if (!window.confirm('Kategoriyani arxivlashni tasdiqlaysizmi?')) return;
    const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (response.ok) await load(); else setError('Kategoriya arxivlanmadi');
  };

  return <div className="space-y-6">
    <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold">B2B kategoriyalar</h2><p className="text-sm text-gray-400">Prisma, tarjimalar va ichma-ich daraxt</p></div><button onClick={() => void load()} className="rounded-lg border border-white/10 p-2 text-gray-300"><RefreshCw size={18} /></button></div>
    {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-white/10 bg-zinc-900 p-4 md:grid-cols-2 lg:grid-cols-5">
      <input required value={form.nameUz} onChange={(e) => setForm({ ...form, nameUz: e.target.value })} placeholder="O‘zbekcha nom" className="rounded-xl border border-white/10 bg-black px-3 py-2.5" />
      <input required value={form.nameRu} onChange={(e) => setForm({ ...form, nameRu: e.target.value })} placeholder="Русское название" className="rounded-xl border border-white/10 bg-black px-3 py-2.5" />
      <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="rounded-xl border border-white/10 bg-black px-3 py-2.5"><option value="">Asosiy kategoriya</option>{categories.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.translations.find((translation) => translation.locale === 'uz')?.name}</option>)}</select>
      <input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} placeholder="Tartib" className="rounded-xl border border-white/10 bg-black px-3 py-2.5" />
      <button disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-4 py-2.5 font-bold text-black disabled:opacity-60">{saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Qo‘shish</button>
    </form>
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">{loading ? <div className="p-10 text-center"><Loader2 className="mx-auto animate-spin" /></div> : <div className="divide-y divide-white/5">{categories.map((category) => <div key={category.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-semibold">{category.translations.find((translation) => translation.locale === 'uz')?.name}</p><p className="text-xs text-gray-500">{category.slugUz} · {category._count?.products || 0} mahsulot · {category._count?.children || 0} subkategoriya</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-2 py-1 text-xs ${category.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>{category.active ? 'Faol' : 'Arxiv'}</span>{category.active && <button onClick={() => void archive(category.id)} className="p-2 text-red-400" aria-label="Arxivlash"><Archive size={17} /></button>}</div></div>)}</div>}</div>
  </div>;
}
