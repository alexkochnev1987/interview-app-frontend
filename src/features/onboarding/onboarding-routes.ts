export function normalizeOnboardingPath(pathname: string): string {
  const path = pathname.split('?')[0] ?? '/'
  return path === '' ? '/' : path
}

export type OnboardingRouteMatch = 'exact' | 'prefix'

export function isOnboardingRoute(
  pathname: string,
  route: string,
  match: OnboardingRouteMatch = 'exact',
): boolean {
  const current = normalizeOnboardingPath(pathname)
  const target = normalizeOnboardingPath(route)

  if (target === '/') {
    return current === '/'
  }

  if (match === 'prefix') {
    return current === target || current.startsWith(`${target}/`)
  }

  return current === target
}

const ROUTE_NAVIGATION_TIMEOUT_MS = 15000

export async function waitForOnboardingRoute(
  getPathname: () => string,
  route: string,
  match: OnboardingRouteMatch = 'exact',
  timeoutMs: number = ROUTE_NAVIGATION_TIMEOUT_MS,
): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  if (isOnboardingRoute(getPathname(), route, match)) {
    return true
  }

  const started = Date.now()

  return new Promise((resolve) => {
    const check = () => {
      if (isOnboardingRoute(getPathname(), route, match)) {
        resolve(true)
        return
      }

      if (Date.now() - started >= timeoutMs) {
        resolve(false)
        return
      }

      window.requestAnimationFrame(check)
    }

    window.requestAnimationFrame(check)
  })
}
