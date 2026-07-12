import React from 'react';
      export async function generateMetadata() { return { title: 'To\'lov Usullari' }; }
      export default function PaymentPage() {
        return (
          <div className="min-h-screen pt-24 pb-12 bg-white text-slate-800">
            <div className="container mx-auto px-4 max-w-4xl">
              <h1 className="text-4xl font-bold text-red-600 mb-6">To'lov Usullari</h1>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 border rounded-2xl">Naqd pul</div>
                <div className="p-6 border rounded-2xl">Karta o'tkazmasi</div>
                <div className="p-6 border rounded-2xl">Bank hisob raqami (Tashkilotlar uchun)</div>
              </div>
            </div>
          </div>
        );
      }