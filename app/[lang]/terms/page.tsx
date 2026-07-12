import React from 'react';
      export async function generateMetadata() { return { title: 'Foydalanish Shartlari' }; }
      export default function TermsPage() {
        return (
          <div className="min-h-screen pt-24 pb-12 bg-white text-slate-800">
            <div className="container mx-auto px-4 max-w-4xl">
              <h1 className="text-4xl font-bold text-red-600 mb-6">Foydalanish Shartlari</h1>
              <p className="text-slate-700">Ushbu shartlar PaketShop.uz xizmatlaridan foydalanish qoidalarini belgilaydi.</p>
            </div>
          </div>
        );
      }