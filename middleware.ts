import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, API routes, and SEO files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next();
  }

  // Locale Detection via Cookie (only set on first visit)
  const hasLocaleCookie = request.cookies.has('NEXT_LOCALE');
  
  if (!hasLocaleCookie) {
    const country = (request as any).geo?.country || request.headers.get('x-vercel-ip-country');
    let locale = 'en';

    if (country) {
      switch (country) {
        case 'KR': locale = 'ko'; break;
        case 'PL': locale = 'pl'; break;
        case 'BR': case 'PT': locale = 'pt'; break;
        case 'TR': locale = 'tr'; break;
        case 'CN': case 'TW': case 'HK': locale = 'zh'; break;
        case 'FR': locale = 'fr'; break;
        case 'DE': case 'AT': case 'CH': locale = 'de'; break;
        case 'ES': case 'MX': case 'AR': case 'CO': case 'CL': locale = 'es'; break;
        case 'RU': case 'BY': case 'KZ': case 'UA': locale = 'ru'; break;
      }
    }

    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax'
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)',
  ],
};
