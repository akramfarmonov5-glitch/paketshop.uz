'use client';

import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { fetchWithTimeout } from '@/lib/client/fetchWithTimeout';

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
}

export default function CloudinaryUpload({
  onUpload,
  currentImage,
  label = 'Rasm yuklash',
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
      setError('Faqat JPG, PNG, WebP yoki AVIF rasm qabul qilinadi');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Rasm 5 MB dan kichik bo‘lishi kerak');
      return;
    }

    setError(null);
    setIsUploading(true);
    const form = new FormData();
    form.set('file', file);

    try {
      const response = await fetchWithTimeout(
        '/api/admin/media',
        { method: 'POST', body: form },
        60_000,
      );
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.media?.url) {
        throw new Error(body?.error || 'Rasm yuklanmadi');
      }
      setPreview(body.media.url);
      onUpload(body.media.url);
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Rasm yuklashda xatolik yuz berdi',
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm text-slate-500">
        <ImageIcon size={16} />
        {label}
      </label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(event) => void handleFileSelect(event)}
        className="hidden"
      />

      {preview ? (
        <div className="group relative">
          <img
            src={preview}
            alt="Yuklangan rasm"
            className="h-48 w-full rounded-xl border border-slate-200 bg-slate-50 object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Rasmni olib tashlash"
            className="absolute right-2 top-2 rounded-lg bg-red-600 p-2 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-red-300 hover:bg-red-50/30 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 size={32} className="animate-spin text-red-600" />
              <span className="text-sm text-slate-500">Yuklanmoqda...</span>
            </>
          ) : (
            <>
              <Upload size={32} className="text-slate-400" />
              <span className="text-sm text-slate-600">Rasm tanlash uchun bosing</span>
              <span className="text-xs text-slate-400">JPG, PNG, WebP, AVIF (maks. 5 MB)</span>
            </>
          )}
        </button>
      )}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
