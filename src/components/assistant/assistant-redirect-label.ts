import { routes } from '@/i18n/routes'
import type { RecruiterAssistantRedirect } from '@/lib/api'

export type AssistantRedirectLabelKey =
  | 'redirect.continue'
  | 'redirect.openAssessments'
  | 'redirect.openPortalInterview'

const PORTAL_INTERVIEW_PATH = /^\/portal\/interviews\/[^/]+$/

export function getAssistantRedirectLabelKey(
  redirect: Pick<RecruiterAssistantRedirect, 'path'>,
): AssistantRedirectLabelKey {
  if (redirect.path === '/assessments') {
    return 'redirect.openAssessments'
  }

  if (PORTAL_INTERVIEW_PATH.test(redirect.path)) {
    return 'redirect.openPortalInterview'
  }

  return 'redirect.continue'
}

export function shouldShowAssistantRedirectAction(
  redirect: RecruiterAssistantRedirect,
  context: { isCandidateView: boolean; interviewId?: string },
): boolean {
  if (!context.isCandidateView) {
    return true
  }

  if (redirect.path === '/portal') {
    return false
  }

  if (context.interviewId) {
    return redirect.path !== routes.portal.interviewDetail(context.interviewId)
  }

  return true
}
