import React from 'react';
      
      export async function generateMetadata() {
        return {
          title: 'Ulgurji Xaridorlar | PaketShop',
          description: 'Katta ulgurji narxlar, muntazam prays, katta qadoq va doimiy hamkor narxi.',
        };
      }
      
      export default function WholesalePage({ params }: { params: { lang: string } }) {
        return (
          <div className="min-h-screen pt-24 pb-12 bg-white text-slate-800">
            <div className="container mx-auto px-4 max-w-4xl">
              <h1 className="text-4xl font-bold text-red-600 mb-6">Ulgurji Xaridorlar Uchun</h1>
              <p className="text-lg text-slate-600 mb-8">
                Katta hajmdagi xaridlar, muntazam buyurtmalar va doimiy hamkorlarimiz uchun maxsus narxlar.
              </p>
              
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                <h2 className="text-2xl font-bold mb-4">Biz bilan bog'laning</h2>
                <form className="space-y-4">
                  <input type="text" placeholder="Ism yoki Kompaniya nomi" className="w-full p-3 border rounded-xl" />
                  <input type="text" placeholder="Telefon raqami" className="w-full p-3 border rounded-xl" />
                  <textarea placeholder="Taxminiy xarid hajmi va qiziqtirgan mahsulotlar" className="w-full p-3 border rounded-xl h-32"></textarea>
                  <button type="button" className="bg-red-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-700 w-full">Yuborish</button>
                </form>
              </div>
            </div>
          </div>
        );
      }