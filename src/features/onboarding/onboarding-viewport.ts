import type { OnboardingStepConfig, ResolvedOnboardingStep } from '@/features/onboarding/types'

const ONBOARDING_MOBILE_MEDIA = '(max-width: 1279px)'

export function isOnboardingMobileViewport(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia(ONBOARDING_MOBILE_MEDIA).matches
}

export function applyOnboardingStepViewport(
  step: OnboardingStepConfig,
): ResolvedOnboardingStep {
  if (!step.mobile || !isOnboardingMobileViewport()) {
    const { mobile: _mobile, ...resolved } = step
    return resolved
  }

  const { mobile, ...base } = step
  return { ...base, ...mobile }
}
