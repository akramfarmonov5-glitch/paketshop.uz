'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { fetchWithTimeout } from '@/lib/client/fetchWithTimeout';

export interface MediaDraft {
  id: string;
  url: string;
  altUz?: string | null;
}

interface Props {
  media: MediaDraft[];
  onChange: (media: MediaDraft[]) => void;
}

export default function ProductMediaEditor({ media, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    const uploaded: MediaDraft[] = [];

    for (const file of Array.from(files).slice(0, 8)) {
      const form = new FormData();
      form.set('file', file);
      try {
        const response = await fetchWithTimeout('/api/admin/media', { method: 'POST', body: form }, 60_000);
        const body = await response.json();
        if (!response.ok) throw new Error(body?.error || 'Rasm yuklanmadi');
        uploaded.push({ id: body.media.id, url: body.media.url, altUz: body.media.altUz });
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Rasm yuklanmadi');
        break;
      }
    }

    if (uploaded.length) onChange([...media, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const makePrimary = (index: number) => {
    const next = [...media];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 font-semibold text-slate-900">
          <ImagePlus size={17} className="text-red-600" /> Rasmlar
          {media.length > 0 && <span className="rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-600">{media.length}</span>}
        </h4>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-red-500 hover:text-red-700 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} Rasm yuklash
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(event) => void upload(event.target.files)} className="hidden" />
      </header>

      <p className="mb-3 text-xs leading-5 text-slate-500">
        JPG, PNG, WebP yoki AVIF; har biri 5 MB gacha. Birinchi rasm katalog va mahsulot sahifasida asosiy bo‘lib ko‘rinadi.
      </p>

      {error && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

      {media.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">Rasm yuklanmagan</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {media.map((item, index) => (
            <li key={item.id} className={`relative overflow-hidden rounded-xl border ${index === 0 ? 'border-red-500' : 'border-slate-200'}`}>
              {/* Admin oynasida oddiy img — Cloudinary o'zi f_auto,q_auto bilan optimallashtiradi */}
              <img src={item.url} alt={item.altUz || 'Mahsulot rasmi'} className="aspect-square w-full bg-slate-50 object-contain" />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Asosiy</span>
              )}
              <div className="flex border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => makePrimary(index)}
                  disabled={index === 0}
                  aria-label={`${index + 1}-rasmni asosiy qilish`}
                  className="flex flex-1 items-center justify-center gap-1 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Star size={13} /> Asosiy
                </button>
                <button
                  type="button"
                  onClick={() => onChange(media.filter((_, position) => position !== index))}
                  aria-label={`${index + 1}-rasmni olib tashlash`}
                  className="flex items-center justify-center px-3 py-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
