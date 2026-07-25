'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { History, Loader2, Undo2 } from 'lucide-react';

interface ImportJobRow {
  id: string;
  filename: string;
  status: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  rolledBackAt: string | null;
  createdAt: string;
  canRollback: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  UPLOADED: 'Yuklangan',
  VALIDATING: 'Tekshirilmoqda',
  READY: 'Tayyor',
  IMPORTING: 'Yozilmoqda',
  COMPLETED: 'Yakunlandi',
  FAILED: 'Xato',
  ROLLED_BACK: 'Qaytarilgan',
};

const STATUS_TONES: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  FAILED: 'bg-red-50 text-red-700',
  ROLLED_BACK: 'bg-slate-100 text-slate-600',
  IMPORTING: 'bg-amber-50 text-amber-700',
};

export default function ImportJobHistory({ refreshToken = 0 }: { refreshToken?: number }) {
  const [jobs, setJobs] = useState<ImportJobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/import/jobs', { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || 'Import tarixini yuklab bo‘lmadi');
      setJobs(body.jobs || []);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Import tarixini yuklab bo‘lmadi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load, refreshToken]);

  const rollback = async (job: ImportJobRow) => {
    const confirmed = window.confirm(
      `"${job.filename}" importini qaytarasizmi?\n\nImport yaratgan mahsulotlar o‘chiriladi, yangilangan mahsulotlar oldingi holatiga qaytariladi. Bu amalni bekor qilib bo‘lmaydi.`,
    );
    if (!confirmed) return;

    setBusyId(job.id);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`/api/admin/import/jobs/${job.id}/rollback`, { method: 'POST' });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || 'Importni qaytarib bo‘lmadi');
      setNotice(`${body.deleted} ta mahsulot o‘chirildi, ${body.restored} ta mahsulot oldingi holatiga qaytarildi.`);
      await load();
    } catch (rollbackError) {
      setError(rollbackError instanceof Error ? rollbackError.message : 'Importni qaytarib bo‘lmadi');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-bold text-slate-900">
          <History size={18} className="text-red-600" /> Import tarixi
        </h3>
        <button onClick={() => void load()} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-red-500 hover:text-red-700">
          Yangilash
        </button>
      </header>

      {notice && <p className="mb-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p>}
      {error && <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-500"><Loader2 size={18} className="animate-spin" /> Yuklanmoqda…</div>
      ) : jobs.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                <th className="pb-2 pr-3">Fayl</th>
                <th className="pb-2 pr-3">Sana</th>
                <th className="pb-2 pr-3">Qatorlar</th>
                <th className="pb-2 pr-3">Holat</th>
                <th className="pb-2" aria-hidden />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="py-3 pr-3 font-medium text-slate-800">{job.filename}</td>
                  <td className="py-3 pr-3 text-slate-500">{new Date(job.createdAt).toLocaleString('uz-UZ')}</td>
                  <td className="py-3 pr-3 text-slate-600">{job.successRows} / {job.totalRows}</td>
                  <td className="py-3 pr-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_TONES[job.status] || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABELS[job.status] || job.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {job.canRollback ? (
                      <button
                        onClick={() => void rollback(job)}
                        disabled={busyId === job.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {busyId === job.id ? <Loader2 size={14} className="animate-spin" /> : <Undo2 size={14} />} Qaytarish
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">{job.rolledBackAt ? 'Qaytarilgan' : '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-slate-400">Hozircha import qilinmagan</p>
      )}
    </section>
  );
}
