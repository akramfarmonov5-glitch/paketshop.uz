import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { suggestProducts } from '@/lib/server/prismaCatalog';

export const dynamic = 'force-dynamic';

function requestIp(request: NextRequest): string {
  return request.headers.get('x-real-ip')
    || request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

export async function GET(request: NextRequest) {
  if (!checkRateLimit(`search-suggest:${requestIp(request)}`, 60, 60 * 1000).allowed) {
    return NextResponse.json({ error: "Juda ko'p so'rov" }, { status: 429 });
  }

  const query = request.nextUrl.searchParams.get('q')?.trim().slice(0, 100) || '';
  const locale = request.nextUrl.searchParams.get('lang') === 'ru' ? 'ru' : 'uz';
  if (query.length < 2) return NextResponse.json({ suggestions: [] });

  try {
    const suggestions = await suggestProducts(query, locale, 8);
    return NextResponse.json({ suggestions }, {
      headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' },
    });
  } catch (error) {
    console.error('Search suggest failed:', error);
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }
}
