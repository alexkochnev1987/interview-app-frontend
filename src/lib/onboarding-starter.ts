import type { Interview } from '@/lib/api'

export const ONBOARDING_STARTER_EMAIL_SUFFIX = '@onboarding-starter.sample'

export function isOnboardingStarterInterview(
  interview: Pick<Interview, 'candidateEmail'>,
): boolean {
  return (
    typeof interview.candidateEmail === 'string'
    && interview.candidateEmail.endsWith(ONBOARDING_STARTER_EMAIL_SUFFIX)
  )
}
