import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import {
  loginReturnPath,
  safeRedirectPath,
} from '@/lib/safe-redirect-path'
import { localizedPath, pathLocale } from '@/i18n/pathname'
import { routing } from '@/i18n/routing'

const handleI18nRouting = createMiddleware(routing)

function matchesPathSegment(pathname: string, segment: string) {
  return pathname === segment || pathname.startsWith(`${segment}/`)
}

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')
  const path = request.nextUrl.pathname
  const { locale, pathnameWithoutLocale } = pathLocale(path)

  if (
    pathnameWithoutLocale.startsWith('/api') ||
    pathnameWithoutLocale.startsWith('/_next')
  ) {
    return NextResponse.next()
  }

  const isPublicPage =
    pathnameWithoutLocale === '/login' ||
    matchesPathSegment(pathnameWithoutLocale, '/take') ||
    matchesPathSegment(pathnameWithoutLocale, '/feedback') ||
    matchesPathSegment(pathnameWithoutLocale, '/demo')

  if (!session && !isPublicPage) {
    const loginUrl = new URL(localizedPath('/login', locale), request.url)
    const returnPath = `${path}${request.nextUrl.search}`
    const safeFrom = loginReturnPath(returnPath)
    if (safeFrom) {
      loginUrl.searchParams.set('from', safeFrom)
    }
    return NextResponse.redirect(loginUrl)
  }

  if (session && pathnameWithoutLocale === '/login') {
    const from = request.nextUrl.searchParams.get('from')
    const destination = localizedPath(safeRedirectPath(from), locale)
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return handleI18nRouting(request)
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
}
