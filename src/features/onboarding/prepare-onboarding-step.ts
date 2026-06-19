import { isOnboardingRoute } from '@/features/onboarding/onboarding-routes'
import { waitForTourTarget } from '@/features/onboarding/wait-for-target'
import type { OnboardingStepConfig } from '@/features/onboarding/types'

type PrepareOnboardingStepParams = {
  step: Pick<OnboardingStepConfig, 'route' | 'target' | 'waitTimeoutMs'>
  pathname: string
  push: (href: string) => void
}

export async function prepareOnboardingStep({
  step,
  pathname,
  push,
}: PrepareOnboardingStepParams): Promise<boolean> {
  const timeoutMs = step.waitTimeoutMs ?? 5000

  if (step.route && !isOnboardingRoute(pathname, step.route)) {
    push(step.route)
  }

  const element = await waitForTourTarget(step.target, timeoutMs)
  return element != null
}
