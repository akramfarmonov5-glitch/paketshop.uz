import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const alt = 'PaketShop.uz — qadoqlash mahsulotlari ulgurji katalogi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const copy = {
  uz: {
    eyebrow: 'O‘zbekiston bo‘ylab ulgurji savdo',
    title: 'Qadoqlash va bir martalik idishlar',
    subtitle: 'Kafe, savdo nuqtalari, tashkilotlar va qayta sotuvchilar uchun',
    cta: 'Ulgurji katalog',
  },
  ru: {
    eyebrow: 'Оптовые поставки по Узбекистану',
    title: 'Упаковка и одноразовая посуда',
    subtitle: 'Для кафе, торговых точек, организаций и реселлеров',
    cta: 'Оптовый каталог',
  },
} as const;

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const text = copy[lang === 'ru' ? 'ru' : 'uz'];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #fff7f7 0%, #ffffff 52%, #fee2e2 100%)',
          color: '#111827',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div
            style={{
              width: 76,
              height: 76,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 22,
              background: '#dc2626',
              color: '#ffffff',
              fontSize: 42,
              fontWeight: 800,
            }}
          >
            P
          </div>
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 800 }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 980 }}>
          <div
            style={{
              display: 'flex',
              color: '#b91c1c',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            {text.eyebrow}
          </div>
          <div style={{ display: 'flex', marginTop: 20, fontSize: 66, lineHeight: 1.08, fontWeight: 800 }}>
            {text.title}
          </div>
          <div style={{ display: 'flex', marginTop: 24, color: '#4b5563', fontSize: 29, lineHeight: 1.35 }}>
            {text.subtitle}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 25 }}>
          <div style={{ display: 'flex', color: '#374151', fontWeight: 600 }}>paketshop.uz</div>
          <div
            style={{
              display: 'flex',
              borderRadius: 999,
              padding: '14px 24px',
              background: '#dc2626',
              color: '#ffffff',
              fontWeight: 700,
            }}
          >
            {text.cta}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
