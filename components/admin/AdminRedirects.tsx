'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Loader2, Plus, Trash2 } from 'lucide-react';

interface RedirectRow {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  active: boolean;
  createdAt: string;
}

export default function AdminRedirects() {
  const [rows, setRows] = useState<RedirectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ fromPath: '', toPath: '', statusCode: 301 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/redirects');
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || 'Yuklab bo‘lmadi');
      setRows(body.redirects || []);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Yuklab bo‘lmadi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, statusCode: Number(form.statusCode), active: true }),
      });
      const body = await response.json();
      if (!response.ok) {
        const fieldError = body?.fields ? Object.values(body.fields).flat()[0] : null;
        throw new Error(String(fieldError || body?.error || 'Saqlab bo‘lmadi'));
      }
      setForm({ fromPath: '', toPath: '', statusCode: 301 });
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Saqlab bo‘lmadi');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (row: RedirectRow) => {
    await fetch(`/api/admin/redirects/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !row.active }),
    });
    await load();
  };

  const handleDelete = async (row: RedirectRow) => {
    if (!window.confirm(`${row.fromPath} redirectini o‘chirasizmi?`)) return;
    await fetch(`/api/admin/redirects/${row.id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Redirectlar (301)</h2>
        <p className="mt-1 text-sm text-slate-500">Eski URL’larni yangi sahifalarga yo‘naltirish. Yo‘lni til prefiksisiz kiritsangiz (masalan <code className="text-red-600">/eski-sahifa</code>), u /uz va /ru uchun ham ishlaydi.</p>
      </div>

      <form onSubmit={handleCreate} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[2fr_2fr_120px_auto]">
        <input required value={form.fromPath} onChange={(event) => setForm((previous) => ({ ...previous, fromPath: event.target.value }))} placeholder="Eski yo‘l: /eski-sahifa" className="h-11 rounded-xl border border-slate-200 bg-white/40 px-3 text-sm text-slate-900 outline-none focus:border-red-600" />
        <input required value={form.toPath} onChange={(event) => setForm((previous) => ({ ...previous, toPath: event.target.value }))} placeholder="Yangi yo‘l: /catalog" className="h-11 rounded-xl border border-slate-200 bg-white/40 px-3 text-sm text-slate-900 outline-none focus:border-red-600" />
        <select value={form.statusCode} onChange={(event) => setForm((previous) => ({ ...previous, statusCode: Number(event.target.value) }))} aria-label="Status kodi" className="h-11 rounded-xl border border-slate-200 bg-white/40 px-3 text-sm text-slate-900">
          <option value={301}>301</option>
          <option value={302}>302</option>
          <option value={410}>410</option>
        </select>
        <button disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-black hover:bg-gold-300 disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Qo‘shish
        </button>
      </form>

      {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500"><Loader2 size={18} className="animate-spin" /> Yuklanmoqda...</div>
        ) : rows.length ? (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Eski yo‘l</th>
                <th className="px-4 py-3" aria-hidden />
                <th className="px-4 py-3">Yangi yo‘l</th>
                <th className="px-4 py-3">Kod</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-slate-700">{row.fromPath}</td>
                  <td className="px-4 py-3 text-slate-400"><ArrowRight size={14} /></td>
                  <td className="px-4 py-3 font-mono text-slate-700">{row.toPath}</td>
                  <td className="px-4 py-3 text-slate-600">{row.statusCode}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(row)} className={`rounded-full px-3 py-1 text-xs font-bold ${row.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-500/15 text-slate-500'}`}>
                      {row.active ? 'Faol' : 'O‘chiq'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(row)} aria-label={`${row.fromPath} redirectini o‘chirish`} className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-slate-400">Hozircha redirectlar yo‘q</div>
        )}
      </div>
    </div>
  );
}
