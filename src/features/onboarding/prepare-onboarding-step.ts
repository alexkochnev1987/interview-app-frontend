import {
  isOnboardingRoute,
  waitForOnboardingRoute,
} from '@/features/onboarding/onboarding-routes'
import {
  getStoredOnboardingStepRoute,
  storeOnboardingStepRoute,
} from '@/features/onboarding/onboarding-progress'
import { waitForTourTarget } from '@/features/onboarding/wait-for-target'
import type { OnboardingStepConfig } from '@/features/onboarding/types'

type PrepareOnboardingStepParams = {
  step: Pick<
    OnboardingStepConfig,
    'id' | 'route' | 'routeMatch' | 'target' | 'waitTimeoutMs'
  >
  getPathname: () => string
  push: (href: string) => void
  routeOverride?: string
}

export async function prepareOnboardingStep({
  step,
  getPathname,
  push,
  routeOverride,
}: PrepareOnboardingStepParams): Promise<boolean> {
  const timeoutMs = step.waitTimeoutMs ?? 5000

  if (routeOverride) {
    storeOnboardingStepRoute(step.id, routeOverride)
  }

  const route =
    routeOverride ??
    getStoredOnboardingStepRoute(step.id) ??
    step.route
  const routeMatch = step.routeMatch ?? 'exact'
  const pathname = getPathname()

  if (route && !isOnboardingRoute(pathname, route, routeMatch)) {
    push(route)

    const navigated = await waitForOnboardingRoute(
      getPathname,
      route,
      routeMatch,
    )

    if (!navigated) {
      return false
    }
  }

  const element = await waitForTourTarget(step.target, timeoutMs)
  return element != null
}
