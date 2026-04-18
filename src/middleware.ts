import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const path = request.nextUrl.pathname;

  // Always let API proxy to the backend (rewrites in next.config). Some hosts
  // still invoke middleware for /api even when the matcher should skip it.
  if (path.startsWith('/api')) {
    return NextResponse.next();
  }

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
