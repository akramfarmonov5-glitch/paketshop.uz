import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['uz', 'ru'] as const;
const defaultLocale = 'uz';
const canonicalHostname = 'www.paketshop.uz';

const legacyRemovedProductFallbacks: Record<string, string> = {
  '/uz/product/zip-paket-27': '/uz/catalog',
  '/ru/product/70x90-20-1': '/ru/catalog',
  '/en/product/zip-paket-27': '/uz/catalog',
};

const legacyCategoryAliases: Record<string, { uz: string; ru: string }> = {
  paketlar: { uz: 'polietilen-paketlar', ru: 'polietilen-paketlar-ru' },
  idishlar: { uz: 'bir-martalik-idishlar', ru: 'bir-martalik-idishlar-ru' },
  'xojalik-mollari': { uz: 'xojalik-sarf-materiallari', ru: 'xojalik-sarf-materiallari-ru' },
  'salfetka-va-lattalar': { uz: 'salfetka-va-qogoz', ru: 'salfetka-va-qogoz-ru' },
  'zip-lock-paketlar': { uz: 'zip-paketlar', ru: 'zip-paketlar-ru' },
  'qogoz-gigiyenasi': { uz: 'salfetka-va-qogoz', ru: 'salfetka-va-qogoz-ru' },
  'party-supplies-and-decorations': { uz: 'bayram-mahsulotlari', ru: 'bayram-mahsulotlari-ru' },
  'cleaning-supplies-and-household-items': {
    uz: 'xojalik-sarf-materiallari',
    ru: 'xojalik-sarf-materiallari-ru',
  },
  'disposable-tableware': { uz: 'bir-martalik-idishlar', ru: 'bir-martalik-idishlar-ru' },
  'baking-and-cooking-accessories': {
    uz: 'folga-va-pergament',
    ru: 'folga-va-pergament-ru',
  },
};

function permanentRedirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.searchParams.delete('lang');
  return NextResponse.redirect(url, 308);
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (request.nextUrl.hostname === 'paketshop.uz') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.hostname = canonicalHostname;
    return NextResponse.redirect(url, 308);
  }

  const normalizedPathname = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const legacyProductTarget = legacyRemovedProductFallbacks[normalizedPathname];
  if (legacyProductTarget) {
    return permanentRedirect(request, legacyProductTarget);
  }

  if (pathname === '/index.php') {
    return permanentRedirect(request, `/${defaultLocale}`);
  }

  if (pathname === '/') {
    const requestedLanguage = searchParams.get('lang');
    if (requestedLanguage) {
      const locale = requestedLanguage === 'ru' ? 'ru' : defaultLocale;
      return permanentRedirect(request, `/${locale}`);
    }

    const legacySearch = searchParams.get('s') || searchParams.get('q');
    if (legacySearch !== null) {
      const url = request.nextUrl.clone();
      url.pathname = `/${defaultLocale}/catalog`;
      url.search = '';
      if (legacySearch && legacySearch !== '{search_term_string}') {
        url.searchParams.set('q', legacySearch);
      }
      return NextResponse.redirect(url, 308);
    }
  }

  const categoryMatch = /^\/(?:(uz|ru|en)\/)?category\/([^/]+)\/?$/.exec(pathname);
  if (categoryMatch) {
    const requestedLocale = categoryMatch[1];
    const locale = requestedLocale === 'ru' ? 'ru' : defaultLocale;
    const alias = legacyCategoryAliases[categoryMatch[2].toLowerCase()];
    if (alias) {
      return permanentRedirect(request, `/${locale}/category/${alias[locale]}`);
    }
  }

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return permanentRedirect(request, `/uz${pathname.slice(3)}` || '/uz');
  }

  if (
    pathname.startsWith('/_next')
    || pathname.startsWith('/api')
    || pathname.startsWith('/favicon')
    || pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return NextResponse.next();

  return permanentRedirect(request, `/${defaultLocale}${pathname}`);
}

export const config = {
  matcher: ['/((?!_next).*)'],
};
