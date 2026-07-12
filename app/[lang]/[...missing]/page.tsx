import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { findActiveRedirect } from '@/lib/server/redirects';

// Mavjud bo'lmagan yo'llar uchun admin boshqaradigan redirect jadvalini tekshiradi (spec §27).
// Redirect topilmasa 404 qaytadi; 410 (GONE) yozuvlar ham 404 sahifaga tushadi.
export default async function MissingPathPage({ params }: { params: Promise<{ lang: string; missing: string[] }> }) {
  const { lang, missing } = await params;
  const path = `/${lang}/${missing.map((segment) => decodeURIComponent(segment)).join('/')}`;

  const resolved = await findActiveRedirect(path).catch((error) => {
    console.error('Redirect lookup failed:', error);
    return null;
  });

  if (resolved && resolved.statusCode !== 410) {
    if (resolved.statusCode === 302) redirect(resolved.target);
    permanentRedirect(resolved.target);
  }

  notFound();
}
