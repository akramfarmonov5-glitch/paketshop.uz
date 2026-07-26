import { ProductSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-28">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
            <div className="h-10 w-80 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-5 w-full max-w-xl animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-14 w-full animate-pulse rounded-2xl bg-white border border-slate-200 mb-8" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
