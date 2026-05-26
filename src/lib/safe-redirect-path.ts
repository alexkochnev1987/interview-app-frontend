import { LOCALES, type Locale } from '@/i18n/locales'

const BLOCKED_PATH_PREFIXES = [
  '/login',
  '/take',
  '/feedback',
  '/demo',
  '/api',
  '/_next',
] as const

function pathnameOf(path: string): string {
  const queryIndex = path.indexOf('?')
  return queryIndex === -1 ? path : path.slice(0, queryIndex)
}

function withoutLocalePrefix(path: string): string {
  const [, segment] = path.split('/')
  if (!LOCALES.includes(segment as Locale)) {
    return path
  }

  return path.slice(segment.length + 1) || '/'
}

function isBlockedRedirectPath(path: string): boolean {
  const unlocalizedPath = withoutLocalePrefix(path)
  return BLOCKED_PATH_PREFIXES.some(
    (prefix) =>
      unlocalizedPath === prefix || unlocalizedPath.startsWith(`${prefix}/`),
  )
}

export function loginReturnPath(path: string): string | null {
  if (!path.startsWith('/') || path.startsWith('//')) {
    return null
  }

  if (isBlockedRedirectPath(pathnameOf(path))) {
    return null
  }

  return path
}

export function safeRedirectPath(from: string | null | undefined): string {
  if (!from) {
    return '/'
  }

  return loginReturnPath(from) ?? '/'
}
