'use client';
import React, { useEffect, useState } from 'react';
import { Archive, Loader2, Plus, RefreshCw } from 'lucide-react';
import { slugify } from '@/lib/slugify';
import CloudinaryUpload from '../CloudinaryUpload';
import Image from 'next/image';

interface AdminCategoryRecord {
  id: string;
  slugUz: string;
  slugRu: string;
  active: boolean;
  sortOrder: number;
  translations: Array<{ locale: string; name: string }>;
  imageUrl?: string | null;
  parentId?: string | null;
  _count?: { products: number; children: number };
}

export default function AdminCategoriesV2() {
  const [categories, setCategories] = useState<AdminCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nameUz: '', nameRu: '', parentId: '', sortOrder: 0, imageUrl: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

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
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
      const method = editingId ? 'PATCH' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parentId: form.parentId || null, slugUz, slugRu: `${slugUz}-ru`, name: { uz: form.nameUz, ru: form.nameRu }, sortOrder: form.sortOrder, active: true, imageUrl: form.imageUrl || null }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Kategoriya saqlanmadi');
      setForm({ nameUz: '', nameRu: '', parentId: '', sortOrder: 0, imageUrl: '' });
      setEditingId(null);
      await load();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Xatolik'); }
    finally { setSaving(false); }
  };

  const handleEdit = (category: AdminCategoryRecord) => {
    setEditingId(category.id);
    setForm({
      nameUz: category.translations.find((t) => t.locale === 'uz')?.name || category.slugUz,
      nameRu: category.translations.find((t) => t.locale === 'ru')?.name || category.slugRu,
      parentId: category.parentId || '',
      sortOrder: category.sortOrder,
      imageUrl: category.imageUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ nameUz: '', nameRu: '', parentId: '', sortOrder: 0, imageUrl: '' });
  };

  const archive = async (id: string) => {
    if (!window.confirm('Kategoriyani arxivlashni tasdiqlaysizmi?')) return;
    const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (response.ok) await load(); else setError('Kategoriya arxivlanmadi');
  };

  return <div className="space-y-6">
    <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold">B2B kategoriyalar</h2><p className="text-sm text-slate-500">Prisma, tarjimalar va ichma-ich daraxt</p></div><button onClick={() => void load()} className="rounded-lg border border-slate-200 p-2 text-slate-600"><RefreshCw size={18} /></button></div>
    {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input required value={form.nameUz} onChange={(e) => setForm({ ...form, nameUz: e.target.value })} placeholder="O‘zbekcha nom" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
        <input required value={form.nameRu} onChange={(e) => setForm({ ...form, nameRu: e.target.value })} placeholder="Русское название" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
        <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"><option value="">Asosiy kategoriya</option>{categories.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.translations.find((translation) => translation.locale === 'uz')?.name}</option>)}</select>
        <input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} placeholder="Tartib" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-48">
          <CloudinaryUpload
            onUpload={(url) => setForm({ ...form, imageUrl: url })}
            label={form.imageUrl ? 'Rasmni o‘zgartirish' : 'Rasm yuklash'}
          />
        </div>
        {form.imageUrl && (
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <Image src={form.imageUrl} alt="Preview" fill className="object-contain p-1" />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {editingId && <button type="button" onClick={cancelEdit} className="rounded-xl bg-slate-100 px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-200">Bekor qilish</button>}
          <button disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 font-bold text-white disabled:opacity-60">{saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} {editingId ? 'Saqlash' : 'Qo‘shish'}</button>
        </div>
      </div>
    </form>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">{loading ? <div className="p-10 text-center"><Loader2 className="mx-auto animate-spin" /></div> : <div className="divide-y divide-slate-100">{categories.map((category) => <div key={category.id} className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {category.imageUrl ? <Image src={category.imageUrl} alt={category.slugUz} fill sizes="48px" className="object-contain p-1" /> : <div className="text-xs text-slate-400">Yo'q</div>}
        </div>
        <div><p className="font-semibold">{category.translations.find((translation) => translation.locale === 'uz')?.name}</p><p className="text-xs text-slate-400">{category.slugUz} · {category._count?.products || 0} mahsulot · {category._count?.children || 0} subkategoriya</p></div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2 py-1 text-xs ${category.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-slate-500'}`}>{category.active ? 'Faol' : 'Arxiv'}</span>
        <button onClick={() => handleEdit(category)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" aria-label="Tahrirlash">Tahrirlash</button>
        {category.active && <button onClick={() => void archive(category.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg" aria-label="Arxivlash"><Archive size={17} /></button>}
      </div></div>)}</div>}</div>
  </div>;
}
