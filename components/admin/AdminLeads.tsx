'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Loader2, MessageSquare, Phone, RefreshCw, Search, Users } from 'lucide-react';

interface Lead { id: string; name: string; phone: string; created_at: string; last_message?: string }

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async (search = '') => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/admin/leads?pageSize=100&q=${encodeURIComponent(search)}`, { cache: 'no-store' });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || 'Leadlarni yuklab bo‘lmadi');
      setLeads(result.leads || []);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Xatolik'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <div className="space-y-6"><header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-3xl font-bold text-slate-900">Leadlar</h2><p className="mt-2 text-slate-500">Saytdagi barcha aloqa, ulgurji va tashkilot so‘rovlari.</p></div><div className="flex items-center gap-3"><div className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-center"><span className="block text-xs font-bold uppercase text-slate-400">Jami</span><strong className="text-2xl text-red-600">{leads.length}</strong></div><button onClick={() => void load(query)} className="rounded-xl border border-slate-200 p-3 text-slate-900 hover:bg-slate-50" aria-label="Yangilash"><RefreshCw size={19} /></button></div></header><form onSubmit={(event) => { event.preventDefault(); void load(query); }} className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ism yoki telefon orqali qidirish…" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 outline-none focus:border-red-600" /></form>{error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">{error}</p>}<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-slate-500"><tr><th className="p-4">Mijoz</th><th className="p-4">Telefon</th><th className="p-4">So‘rov tafsiloti</th><th className="p-4">Sana</th><th className="p-4 text-right">Aloqa</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="mx-auto animate-spin text-slate-500" /></td></tr> : !leads.length ? <tr><td colSpan={5} className="p-12 text-center text-slate-400">Leadlar topilmadi.</td></tr> : leads.map((lead) => <tr key={lead.id} className="align-top hover:bg-white/[.03]"><td className="p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-red-600/10 text-red-600"><Users size={19} /></span><div><p className="font-bold text-slate-900">{lead.name}</p><p className="font-mono text-xs text-gray-600">{lead.id}</p></div></div></td><td className="p-4"><a href={`tel:${lead.phone}`} className="inline-flex items-center gap-2 text-sky-400"><Phone size={14} />{lead.phone}</a></td><td className="max-w-md p-4 text-xs leading-5 text-slate-500">{lead.last_message || '—'}</td><td className="p-4"><span className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-slate-400"><Calendar size={14} />{new Date(lead.created_at).toLocaleString('uz-UZ')}</span></td><td className="p-4 text-right"><a href={`https://t.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex rounded-lg p-2 text-red-600 hover:bg-red-600/10" title="Telegram"><MessageSquare size={18} /></a></td></tr>)}</tbody></table></div></div></div>;
}
