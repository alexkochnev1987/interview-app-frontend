import type { InterviewListItem, RecruiterAssistantInterviewSummary } from '@/lib/api'
import {
  derivePortalInterviewStatus,
  portalInterviewStatusTone,
  type PortalInterviewStatus,
} from '@/lib/portal-interview-status'
import { parseSafeHttpUrl } from '@/lib/safe-external-url'

const INTERVIEW_STATUSES = [
  'pending',
  'in_progress',
  'processing',
  'completed',
  'failed',
] as const satisfies ReadonlyArray<InterviewListItem['status']>

type InterviewStatus = InterviewListItem['status']

function parseInterviewStatus(value: string): InterviewStatus {
  if ((INTERVIEW_STATUSES as readonly string[]).includes(value)) {
    return value as InterviewStatus
  }

  return 'failed'
}

export type AssistantCandidateInterviewStatusSource = Pick<
  RecruiterAssistantInterviewSummary,
  'status' | 'reviewState'
>

export type AssistantCandidatePortalStatusLabelKey = `status.${PortalInterviewStatus}`

/** Maps Herman interview payloads to the same portal status vocabulary as the candidate dashboard. */
export function deriveAssistantCandidateInterviewStatus(
  interview: AssistantCandidateInterviewStatusSource,
): PortalInterviewStatus {
  return derivePortalInterviewStatus({
    status: parseInterviewStatus(interview.status),
    resultsReady: interview.reviewState?.resultsReady ?? false,
  })
}

/** i18n key under the `portal` namespace — reuse `portal.status.*` labels in assistant cards. */
export function getAssistantCandidatePortalStatusLabelKey(
  status: PortalInterviewStatus,
): AssistantCandidatePortalStatusLabelKey {
  return `status.${status}`
}

export type AssistantCandidateReviewLabelKey = 'resultsReady' | 'reviewed' | 'notReviewed'

export function getAssistantCandidateReviewPresentation(
  reviewState: RecruiterAssistantInterviewSummary['reviewState'],
): { tone: 'completed' | 'pending'; labelKey: AssistantCandidateReviewLabelKey } | null {
  if (!reviewState) {
    return null
  }

  if (reviewState.resultsReady) {
    return { tone: 'completed', labelKey: 'resultsReady' }
  }

  if (reviewState.reviewed) {
    return { tone: 'completed', labelKey: 'reviewed' }
  }

  return { tone: 'pending', labelKey: 'notReviewed' }
}

export type AssistantCandidateContinueLink =
  | { kind: 'internal'; href: string }
  | { kind: 'external'; href: string }

export function resolveAssistantCandidateContinueLink(
  candidateLink: string | undefined,
): AssistantCandidateContinueLink | null {
  if (!candidateLink) {
    return null
  }

  if (candidateLink.startsWith('/')) {
    return { kind: 'internal', href: candidateLink }
  }

  const safeUrl = parseSafeHttpUrl(candidateLink)
  if (!safeUrl) {
    return null
  }

  return { kind: 'external', href: safeUrl.href }
}

export { portalInterviewStatusTone }
