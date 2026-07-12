import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['uz', 'ru'];
const defaultLocale = 'uz';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    request.nextUrl.pathname = `/uz${pathname.slice(3)}` || '/uz';
    return NextResponse.redirect(request.nextUrl, 308);
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return NextResponse.next();

  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!_next).*)'],
};
