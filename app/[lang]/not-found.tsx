import Link from 'next/link';

export default function LocalizedNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-24 text-center">
      <div className="max-w-lg">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">404</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Sahifa topilmadi</h1>
        <p className="mt-4 leading-7 text-slate-600">
          So‘ralgan sahifa mavjud emas yoki boshqa manzilga ko‘chirilgan.
          {' '}Запрошенная страница не найдена.
        </p>
        <Link
          href="/uz"
          className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-red-600 px-6 font-semibold text-white hover:bg-red-700"
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    </main>
  );
}
