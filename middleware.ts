import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  const isWww = host.startsWith('www.albionkit.com');
  const isHttp = request.nextUrl.protocol === 'http:';

  if (isWww || isHttp) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.hostname = 'albionkit.com';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)',
  ],
};

