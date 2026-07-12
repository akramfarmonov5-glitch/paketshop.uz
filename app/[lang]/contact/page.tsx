import React from 'react';
      export async function generateMetadata() { return { title: 'Kontaktlar' }; }
      export default function ContactPage() {
        return (
          <div className="min-h-screen pt-24 pb-12 bg-white text-slate-800">
            <div className="container mx-auto px-4 max-w-4xl">
              <h1 className="text-4xl font-bold text-red-600 mb-6">Kontaktlar</h1>
              <div className="space-y-4 text-lg">
                <p>Telefon: +998 99 644 84 44</p>
                <p>Telegram: @paketshopuz</p>
                <p>Manzil: Toshkent shahri</p>
              </div>
            </div>
          </div>
        );
      }