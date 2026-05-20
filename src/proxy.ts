import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { safeRedirectPath } from '@/lib/safe-redirect-path';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session');
  const path = request.nextUrl.pathname;

  if (path.startsWith('/api')) {
    return NextResponse.next();
  }

  const isPublicPage =
    path === '/login' ||
    path.startsWith('/take') ||
    path.startsWith('/feedback') ||
    path.startsWith('/demo');

  if (!session && !isPublicPage) {
    const loginUrl = new URL('/login', request.url);
    const returnPath = `${path}${request.nextUrl.search}`;
    loginUrl.searchParams.set('from', returnPath);
    return NextResponse.redirect(loginUrl);
  }

  if (session && path === '/login') {
    const from = request.nextUrl.searchParams.get('from');
    const destination = safeRedirectPath(from);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
