'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Search, Send } from 'lucide-react';

interface LeadActivity {
  id: string;
  type: string;
  note: string | null;
  createdAt: string;
}

interface LeadRow {
  id: string;
  type: string;
  status: string;
  lostReason: string | null;
  name: string;
  phone: string;
  email: string | null;
  source: string | null;
  payload: Record<string, unknown> | null;
  assignedTo: { id: string; email: string; name: string | null } | null;
  activities: LeadActivity[];
  createdAt: string;
}

interface Manager { id: string; email: string; name: string | null }

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Yangi',
  CONTACTED: 'Bog‘lanildi',
  IN_PROGRESS: 'Jarayonda',
  WON: 'Yutildi',
  LOST: 'Yo‘qotildi',
};

const STATUS_TONES: Record<string, string> = {
  NEW: 'bg-blue-500/15 text-blue-400',
  CONTACTED: 'bg-amber-500/15 text-amber-400',
  IN_PROGRESS: 'bg-purple-500/15 text-purple-400',
  WON: 'bg-emerald-500/15 text-emerald-400',
  LOST: 'bg-red-500/15 text-red-400',
};

const TYPE_LABELS: Record<string, string> = {
  CONTACT: 'Kontakt',
  WHOLESALE: 'Ulgurji',
  ORGANIZATION: 'Tashkilot',
  RESELLER: 'Qayta sotuvchi',
  PRODUCT_REQUEST: 'Mahsulot so‘rovi',
};

const LOST_REASONS: Array<{ value: string; label: string }> = [
  { value: 'narx', label: 'Narx to‘g‘ri kelmadi' },
  { value: 'mahsulot_yoq', label: 'Mahsulot yo‘q' },
  { value: 'yetkazish', label: 'Yetkazish shartlari' },
  { value: 'javob_bermadi', label: 'Javob bermadi' },
  { value: 'raqobatchi', label: 'Raqobatchidan oldi' },
  { value: 'boshqa', label: 'Boshqa' },
];

const PAYLOAD_LABELS: Record<string, string> = {
  city: 'Shahar', telegram: 'Telegram', organizationName: 'Tashkilot', tin: 'STIR',
  bankPayment: 'Bank to‘lovi', contractNeeded: 'Shartnoma', tradePlace: 'Savdo joyi',
  monthlyVolume: 'Oylik hajm', categories: 'Kategoriyalar', products: 'Mahsulotlar', note: 'Izoh',
};

export default function AdminLeadsV2() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter) query.set('status', statusFilter);
      if (search.trim()) query.set('q', search.trim());
      const response = await fetch(`/api/admin/leads?${query}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || 'Yuklab bo‘lmadi');
      setLeads(body.leads || []);
      setManagers(body.managers || []);
      setStatusCounts(body.statusCounts || {});
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Yuklab bo‘lmadi');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const totalCount = useMemo(() => Object.values(statusCounts).reduce((sum, count) => sum + count, 0), [statusCounts]);

  const patchLead = async (leadId: string, body: Record<string, unknown>) => {
    const response = await fetch(`/api/admin/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      window.alert(payload?.error || 'Yangilab bo‘lmadi');
    }
    await load();
  };

  const handleStatusChange = (lead: LeadRow, status: string) => {
    if (status === 'LOST') {
      const choices = LOST_REASONS.map((reason, index) => `${index + 1} — ${reason.label}`).join('\n');
      const answer = window.prompt(`Yo‘qotish sababi raqamini kiriting:\n${choices}`, '1');
      const reason = LOST_REASONS[Number(answer) - 1];
      if (!reason) return;
      patchLead(lead.id, { status, lostReason: reason.value });
      return;
    }
    patchLead(lead.id, { status });
  };

  const handleAddNote = async (leadId: string) => {
    if (!noteDraft.trim()) return;
    const response = await fetch(`/api/admin/leads/${leadId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: noteDraft.trim() }),
    });
    if (response.ok) setNoteDraft('');
    await load();
  };

  const payloadEntries = (lead: LeadRow): Array<[string, string]> => {
    if (!lead.payload) return [];
    return Object.entries(PAYLOAD_LABELS)
      .map(([key, label]) => {
        const raw = lead.payload?.[key];
        if (raw === null || raw === undefined || raw === '') return null;
        const value = typeof raw === 'boolean' ? (raw ? 'Kerak' : 'Kerak emas') : String(raw);
        return [label, value] as [string, string];
      })
      .filter((entry): entry is [string, string] => Boolean(entry));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Leadlar (CRM)</h2>
        <p className="mt-1 text-sm text-gray-400">Ulgurji, tashkilot va kontakt so‘rovlari — status, mas‘ul menejer va faoliyat tarixi bilan.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setStatusFilter('')} className={`rounded-full px-4 py-1.5 text-sm font-bold ${!statusFilter ? 'bg-gold-400 text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
          Barchasi ({totalCount})
        </button>
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-full px-4 py-1.5 text-sm font-bold ${statusFilter === status ? 'bg-gold-400 text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
            {label} ({statusCounts[status] || 0})
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={16} className="absolute left-3 top-3 text-gray-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ism yoki telefon" className="h-10 rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 text-sm text-white outline-none focus:border-gold-400" />
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400"><Loader2 size={18} className="animate-spin" /> Yuklanmoqda...</div>
        ) : leads.length ? (
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Mijoz</th>
                <th className="px-4 py-3">Turi</th>
                <th className="px-4 py-3">Manba</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Mas‘ul</th>
                <th className="px-4 py-3">Sana</th>
                <th className="px-4 py-3" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <React.Fragment key={lead.id}>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{lead.name}</p>
                      <a href={`tel:${lead.phone}`} className="text-xs text-gray-400 hover:text-gold-400">{lead.phone}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{TYPE_LABELS[lead.type] || lead.type}</td>
                    <td className="px-4 py-3 text-gray-400">{lead.source || '—'}</td>
                    <td className="px-4 py-3">
                      <select value={lead.status} onChange={(event) => handleStatusChange(lead, event.target.value)} aria-label={`${lead.name} statusi`} className={`rounded-lg border-0 px-2 py-1.5 text-xs font-bold outline-none ${STATUS_TONES[lead.status] || 'bg-white/5 text-gray-300'}`}>
                        {Object.entries(STATUS_LABELS).map(([status, label]) => <option key={status} value={status} className="bg-zinc-900 text-white">{label}</option>)}
                      </select>
                      {lead.status === 'LOST' && lead.lostReason && <p className="mt-1 text-[11px] text-red-400">{LOST_REASONS.find((reason) => reason.value === lead.lostReason)?.label || lead.lostReason}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <select value={lead.assignedTo?.id || ''} onChange={(event) => patchLead(lead.id, { assignedToId: event.target.value || null })} aria-label={`${lead.name} mas'uli`} className="max-w-[160px] rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-gray-200 outline-none">
                        <option value="">—</option>
                        {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name || manager.email}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString('uz-UZ')}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setExpandedId(expandedId === lead.id ? null : lead.id); setNoteDraft(''); }} aria-label="Tafsilotlar" className="rounded-lg p-2 text-gray-400 hover:bg-white/10">
                        {expandedId === lead.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === lead.id && (
                    <tr className="border-b border-white/5 bg-black/30">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">So‘rov tafsilotlari</h4>
                            {payloadEntries(lead).length ? (
                              <dl className="space-y-1.5 text-sm">
                                {payloadEntries(lead).map(([label, value]) => (
                                  <div key={label} className="flex gap-2"><dt className="w-32 shrink-0 text-gray-500">{label}:</dt><dd className="text-gray-200">{value}</dd></div>
                                ))}
                              </dl>
                            ) : <p className="text-sm text-gray-500">Qo‘shimcha ma’lumot yo‘q</p>}
                          </div>
                          <div>
                            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Faoliyat tarixi</h4>
                            <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
                              {lead.activities.map((activity) => (
                                <li key={activity.id} className="rounded-lg bg-white/5 px-3 py-2">
                                  <p className="text-gray-200">{activity.note || activity.type}</p>
                                  <p className="mt-0.5 text-[11px] text-gray-500">{new Date(activity.createdAt).toLocaleString('uz-UZ')}</p>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-3 flex gap-2">
                              <input value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Izoh qo‘shish..." className="h-10 flex-1 rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-gold-400" />
                              <button onClick={() => handleAddNote(lead.id)} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gold-400 px-4 text-sm font-bold text-black hover:bg-gold-300"><Send size={14} /> Yozish</button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-gray-500">Leadlar topilmadi</div>
        )}
      </div>
    </div>
  );
}
