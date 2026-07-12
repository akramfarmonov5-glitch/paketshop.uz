import React from 'react';
      export async function generateMetadata() { return { title: 'Start To\'plamlar' }; }
      export default function StarterKitsPage() {
        return (
          <div className="min-h-screen pt-24 pb-12 bg-white text-slate-800">
            <div className="container mx-auto px-4 max-w-4xl">
              <h1 className="text-4xl font-bold text-red-600 mb-6">Yangi Biznes Uchun Start To'plamlar</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border p-6 rounded-2xl bg-slate-50"><h3 className="font-bold text-xl mb-2">Kofe Nuqtasi</h3><p>Stakanlar, qopqoqlar, trubochkalar, tutqichlar.</p></div>
                <div className="border p-6 rounded-2xl bg-slate-50"><h3 className="font-bold text-xl mb-2">Fast-Food</h3><p>Burger qutilar, kartoshka fri idishlari, sosnitsalar.</p></div>
              </div>
            </div>
          </div>
        );
      }