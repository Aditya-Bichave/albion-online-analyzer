import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Redirect www to non-www and HTTP to HTTPS
  const isWww = host.startsWith('www.albionkit.com');
  const isHttp = request.nextUrl.protocol === 'http:' && !host.includes('localhost');

  if (isWww || isHttp) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.hostname = 'albionkit.com';
    return NextResponse.redirect(url, 308);
  }

  // Skip locale detection for static files and API routes
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') || // Static files
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
    // Detect locale from country
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

    // Set cookie and continue (no redirect)
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax'
    });
    return response;
  }

  // Cookie exists - just continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.webmanifest (PWA manifest)
     * - sw.js (service worker)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)',
  ],
};
