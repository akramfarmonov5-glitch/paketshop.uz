'use client';

import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function LocalizedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = pathname?.startsWith('/ru') ? 'ru' : 'uz';

  useEffect(() => {
    console.error('Route rendering failed:', error);
  }, [error]);

  const isRussian = locale === 'ru';
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-24 text-center text-slate-950">
      <div className="max-w-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="text-red-600" size={38} />
        </div>
        <h1 className="mt-6 text-3xl font-bold">
          {isRussian ? 'Произошла техническая ошибка' : 'Texnik xatolik yuz berdi'}
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          {isRussian
            ? 'Обновите страницу. Если ошибка повторится, вернитесь на главную.'
            : 'Sahifani qayta yuklang. Xato takrorlansa, bosh sahifaga qayting.'}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 font-semibold text-white hover:bg-red-700"
          >
            <RefreshCcw size={18} />
            {isRussian ? 'Повторить' : 'Qayta urinish'}
          </button>
          <Link
            href={`/${locale}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 font-semibold text-slate-800 hover:border-red-400 hover:text-red-700"
          >
            <Home size={18} />
            {isRussian ? 'Главная' : 'Bosh sahifa'}
          </Link>
        </div>
        {error.digest && (
          <p className="mt-5 font-mono text-xs text-slate-400">ID: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
