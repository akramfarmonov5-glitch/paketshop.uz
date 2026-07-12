import React from 'react';
      export async function generateMetadata() { return { title: 'Biz Haqimizda' }; }
      export default function AboutPage() {
        return (
          <div className="min-h-screen pt-24 pb-12 bg-white text-slate-800">
            <div className="container mx-auto px-4 max-w-4xl">
              <h1 className="text-4xl font-bold text-red-600 mb-6">Biz Haqimizda</h1>
              <p className="text-lg text-slate-700 leading-relaxed">PaketShop.uz - Toshkent shahrida joylashgan qadoqlash materiallari va bir martalik idishlarning yirik ulgurji yetkazib beruvchisi.</p>
            </div>
          </div>
        );
      }