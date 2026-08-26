import type { RecruiterAssistantRedirect } from '@/lib/api'

export type AssistantRedirectLabelKey =
  | 'redirect.continue'
  | 'redirect.openAssessments'
  | 'redirect.openPortal'
  | 'redirect.openPortalInterview'

const PORTAL_INTERVIEW_PATH = /^\/portal\/interviews\/[^/]+$/

export function getAssistantRedirectLabelKey(
  redirect: Pick<RecruiterAssistantRedirect, 'path'>,
): AssistantRedirectLabelKey {
  if (redirect.path === '/assessments') {
    return 'redirect.openAssessments'
  }

  if (redirect.path === '/portal') {
    return 'redirect.openPortal'
  }

  if (PORTAL_INTERVIEW_PATH.test(redirect.path)) {
    return 'redirect.openPortalInterview'
  }

  return 'redirect.continue'
}
