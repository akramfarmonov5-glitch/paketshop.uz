import React from 'react';
      export async function generateMetadata() { return { title: 'Yetkazib Berish' }; }
      export default function DeliveryPage() {
        return (
          <div className="min-h-screen pt-24 pb-12 bg-white text-slate-800">
            <div className="container mx-auto px-4 max-w-4xl">
              <h1 className="text-4xl font-bold text-red-600 mb-6">Yetkazib Berish Shartlari</h1>
              <ul className="space-y-4 list-disc list-inside text-lg text-slate-700">
                <li>Do'kondan olib ketish (Samovivoz)</li>
                <li>Toshkent bo'ylab kuryer</li>
                <li>Viloyatlarga kargo orqali</li>
              </ul>
              <p className="mt-6 text-sm text-slate-500">* Yetkazib berish narxini menejer tasdiqlaydi.</p>
            </div>
          </div>
        );
      }