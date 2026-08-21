import type { StatusTone } from '@/components/ui/status-pill'
import type { CandidatePortalInterviewListItem } from '@/lib/api'

export type PortalInterviewStatus =
  | 'not_started'
  | 'in_progress'
  | 'awaiting_results'
  | 'results_ready'
  | 'failed'

function assertNever(value: never): never {
  throw new Error(`Unhandled interview status: ${String(value)}`)
}

/**
 * Candidate-voiced status, distinct from the HR-facing `ReviewStatus` in
 * `assessment-status.ts`: a candidate sees "results ready" only once HR has
 * actually published feedback (`resultsReady`), not merely `completed`.
 */
export function derivePortalInterviewStatus(
  item: Pick<CandidatePortalInterviewListItem, 'status' | 'resultsReady'>,
): PortalInterviewStatus {
  switch (item.status) {
    case 'pending':
      return 'not_started'
    case 'in_progress':
      return 'in_progress'
    case 'processing':
      return 'awaiting_results'
    case 'completed':
      return item.resultsReady ? 'results_ready' : 'awaiting_results'
    case 'failed':
      return 'failed'
    default:
      return assertNever(item.status)
  }
}

/** Prep tips (question count, retry policy, environment checks) only matter before the candidate is done. */
export function shouldShowPrepTips(status: PortalInterviewStatus): boolean {
  return status === 'not_started' || status === 'in_progress'
}

export function portalInterviewStatusTone(status: PortalInterviewStatus): StatusTone {
  switch (status) {
    case 'not_started':
      return 'pending'
    case 'in_progress':
      return 'in_progress'
    case 'awaiting_results':
      return 'processing'
    case 'results_ready':
      return 'completed'
    case 'failed':
      return 'failed'
    default:
      return assertNever(status)
  }
}
