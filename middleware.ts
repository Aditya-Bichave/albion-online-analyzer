import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  const isWww = host.startsWith('www.albionkit.com');
  const isHttp = request.nextUrl.protocol === 'http:' && !host.includes('localhost');

  if (isWww || isHttp) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.hostname = 'albionkit.com';
    return NextResponse.redirect(url, 308);
  }

  // Locale Detection via Cookie (SEO-friendly for current structure)
  const hasLocaleCookie = request.cookies.has('NEXT_LOCALE');
  if (!hasLocaleCookie) {
    const req = request as NextRequest & { geo?: { country?: string } };
    const country = req.geo?.country || request.headers.get('x-vercel-ip-country');
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

    // Set cookie for client-side usage
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', locale);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)',
  ],
};
