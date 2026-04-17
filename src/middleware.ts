import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const path = request.nextUrl.pathname;

  const isPublicPage =
    path === '/login' ||
    path.startsWith('/take') ||
    path.startsWith('/feedback');

  if (!session && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
