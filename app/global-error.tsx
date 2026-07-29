'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="uz">
      <body>
        <main style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: '#f8fafc',
          color: '#0f172a',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
        }}>
          <div>
            <p style={{ color: '#dc2626', fontWeight: 700 }}>PaketShop.uz</p>
            <h1>Saytni yuklashda xatolik yuz berdi</h1>
            <p style={{ color: '#475569' }}>Iltimos, sahifani qayta yuklab ko‘ring.</p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 16,
                border: 0,
                borderRadius: 12,
                background: '#dc2626',
                color: 'white',
                padding: '12px 20px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Qayta urinish
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
