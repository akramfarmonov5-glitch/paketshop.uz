'use client';

import { ProductSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="pt-28 pb-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-96 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
