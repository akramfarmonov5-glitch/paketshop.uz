'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface Props {
  action: string;
  defaultQuery: string;
  /** Faol filtrlar soni — mobil tugmada belgi sifatida ko'rsatiladi. */
  activeCount: number;
  labels: { search: string; apply: string; filters: string };
  /** Kategoriya/mavjudlik/saralash selektorlari — server komponentidan keladi. */
  children: React.ReactNode;
}

/**
 * Mobilda uchta selektor 300px joy egallab, mahsulotlarni ekrandan pastga surib yuborardi.
 * Endi ular tugma ostida yig'iladi; qidiruv maydoni esa doim ko'rinadi.
 *
 * Selektorlar yopilganda ham DOM'da qoladi (display:none), shuning uchun forma
 * yuborilganda tanlangan qiymatlar yo'qolmaydi.
 */
export default function CatalogFilterBar({ action, defaultQuery, activeCount, labels, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <form className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4" action={action}>
      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            name="q"
            defaultValue={defaultQuery}
            placeholder={labels.search}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <div className={open ? 'contents' : 'hidden md:contents'}>{children}</div>

        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700">
          <SlidersHorizontal size={17} />
          {labels.apply}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 md:hidden"
      >
        {open ? <X size={17} /> : <SlidersHorizontal size={17} />}
        {labels.filters}
        {activeCount > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">{activeCount}</span>
        )}
      </button>
    </form>
  );
}
