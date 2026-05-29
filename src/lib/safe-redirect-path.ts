import { stripLocalePrefix } from '@/i18n/pathname'

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

function isBlockedRedirectPath(path: string): boolean {
  const unlocalizedPath = stripLocalePrefix(path)
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
