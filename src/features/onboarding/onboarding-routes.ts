export function normalizeOnboardingPath(pathname: string): string {
  const path = pathname.split('?')[0] ?? '/'
  return path === '' ? '/' : path
}

export function isOnboardingRoute(pathname: string, route: string): boolean {
  const current = normalizeOnboardingPath(pathname)
  const target = normalizeOnboardingPath(route)

  if (target === '/') {
    return current === '/'
  }

  return current === target || current.startsWith(`${target}/`)
}
