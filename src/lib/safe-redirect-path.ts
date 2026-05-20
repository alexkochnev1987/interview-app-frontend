const BLOCKED_PATH_PREFIXES = ['/login', '/take', '/feedback', '/demo'] as const

export function safeRedirectPath(from: string | null | undefined): string {
  if (!from || !from.startsWith('/') || from.startsWith('//')) {
    return '/'
  }

  const isBlocked = BLOCKED_PATH_PREFIXES.some(
    (prefix) => from === prefix || from.startsWith(`${prefix}/`),
  )

  return isBlocked ? '/' : from
}
