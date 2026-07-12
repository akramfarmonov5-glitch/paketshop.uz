import React from 'react';
      export async function generateMetadata() { return { title: 'Ko\'p So\'raladigan Savollar (FAQ)' }; }
      export default function FAQPage() {
        return (
          <div className="min-h-screen pt-24 pb-12 bg-white text-slate-800">
            <div className="container mx-auto px-4 max-w-4xl">
              <h1 className="text-4xl font-bold text-red-600 mb-6">Ko'p So'raladigan Savollar</h1>
              <div className="space-y-4">
                <details className="p-4 border rounded-xl bg-slate-50"><summary className="font-bold cursor-pointer">Minimum buyurtma qancha?</summary><p className="mt-2 text-slate-600">Biz asosan ulgurji savdo qilamiz. Minimal miqdor har bir mahsulot uchun alohida belgilangan (masalan, 1 korobka).</p></details>
              </div>
            </div>
          </div>
        );
      }