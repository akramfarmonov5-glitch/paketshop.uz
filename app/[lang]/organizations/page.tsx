import React from 'react';
      
      export async function generateMetadata() {
        return { title: 'Tashkilotlar Uchun | PaketShop', description: 'Hisob-faktura, shartnoma, bank orqali to\'lov' };
      }
      
      export default function OrganizationsPage() {
        return (
          <div className="min-h-screen pt-24 pb-12 bg-white text-slate-800">
            <div className="container mx-auto px-4 max-w-4xl">
              <h1 className="text-4xl font-bold text-red-600 mb-6">Tashkilotlar Uchun</h1>
              <p className="text-lg text-slate-600 mb-8">
                Barcha hujjatlar bilan ishlash: Hisob-faktura, shartnoma va pul ko'chirish yo'li bilan to'lov.
              </p>
            </div>
          </div>
        );
      }