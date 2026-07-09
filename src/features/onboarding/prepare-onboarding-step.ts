import {
  isOnboardingRoute,
  waitForOnboardingRoute,
} from '@/features/onboarding/onboarding-routes'
import {
  getStoredOnboardingStepRoute,
  storeOnboardingStepRoute,
} from '@/features/onboarding/onboarding-progress'
import {
  waitForElementLayout,
  waitForTourTarget,
} from '@/features/onboarding/wait-for-target'
import type { OnboardingStepConfig } from '@/features/onboarding/types'

type PrepareOnboardingStepParams = {
  step: Pick<
    OnboardingStepConfig,
    | 'id'
    | 'route'
    | 'routeMatch'
    | 'target'
    | 'waitTimeoutMs'
    | 'preservePageTop'
    | 'pageScrollTop'
    | 'scrollIntoViewBlock'
  >
  getPathname: () => string
  push: (href: string) => void
  routeOverride?: string
}

async function settleStepViewport(
  step: Pick<
    OnboardingStepConfig,
    'preservePageTop' | 'pageScrollTop' | 'scrollIntoViewBlock'
  >,
  element: Element,
) {
  if (step.preservePageTop) {
    window.scrollTo({
      top: step.pageScrollTop ?? 0,
      left: 0,
      behavior: 'instant',
    })
  }

  if (step.scrollIntoViewBlock) {
    element.scrollIntoView({
      block: step.scrollIntoViewBlock,
      inline: 'nearest',
      behavior: 'instant',
    })
  }

  if (step.preservePageTop || step.scrollIntoViewBlock) {
    await waitForElementLayout(element)
  }
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
  if (!element) {
    return false
  }

  await settleStepViewport(step, element)
  return true
}
