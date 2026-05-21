import type {
  Interview,
  InterviewBehaviorRisk,
  InterviewDecision,
  InterviewResult,
} from '@/lib/api'

export type ReviewStatus =
  | 'ready'
  | 'scoring'
  | 'in_progress'
  | 'pending'
  | 'failed'

export type ReviewStatusTone =
  | 'completed'
  | 'processing'
  | 'in_progress'
  | 'pending'
  | 'failed'

export type DecisionTone = 'completed' | 'pending' | 'failed'

function assertNever(value: never): never {
  throw new Error(`Unhandled interview status: ${String(value)}`)
}

function isValidationInFlight(interview: Interview): boolean {
  return interview.answers.some(
    (a) =>
      a.status === 'submitted' &&
      (a.validation?.status === 'queued' ||
        a.validation?.status === 'processing'),
  )
}

export function deriveReviewStatus(interview: Interview): ReviewStatus {
  switch (interview.status) {
    case 'failed':
      return 'failed'
    case 'pending':
      return 'pending'
    case 'in_progress':
      return 'in_progress'
    case 'processing':
      if (isValidationInFlight(interview)) return 'scoring'
      if (interview.result) return 'ready'
      return 'scoring'
    case 'completed':
      return interview.result ? 'ready' : 'scoring'
    default:
      return assertNever(interview.status)
  }
}

export function reviewStatusLabel(status: ReviewStatus): string {
  switch (status) {
    case 'ready':
      return 'Ready for review'
    case 'scoring':
      return 'Scoring still catching up'
    case 'in_progress':
      return 'Candidate in progress'
    case 'pending':
      return 'Awaiting candidate'
    case 'failed':
      return 'Failed'
    default:
      return assertNever(status)
  }
}

export function reviewStatusTone(status: ReviewStatus): ReviewStatusTone {
  switch (status) {
    case 'ready':
      return 'completed'
    case 'scoring':
      return 'processing'
    case 'in_progress':
      return 'in_progress'
    case 'pending':
      return 'pending'
    case 'failed':
      return 'failed'
    default:
      return assertNever(status)
  }
}

export function decisionLabel(decision: InterviewDecision): string {
  switch (decision) {
    case 'proceed':
      return 'Proceed'
    case 'review':
      return 'Review'
    case 'reject':
      return 'Reject'
    default:
      return assertNever(decision)
  }
}

export function decisionTone(decision: InterviewDecision): DecisionTone {
  switch (decision) {
    case 'proceed':
      return 'completed'
    case 'review':
      return 'pending'
    case 'reject':
      return 'failed'
    default:
      return assertNever(decision)
  }
}

export type BehaviorRiskTone = 'completed' | 'pending' | 'failed' | 'neutral'

export function behaviorRiskTone(
  risk: InterviewBehaviorRisk | null | undefined,
): BehaviorRiskTone {
  switch (risk) {
    case 'high':
      return 'failed'
    case 'medium':
      return 'pending'
    case 'low':
      return 'completed'
    default:
      return 'neutral'
  }
}

export function getCompletionDate(interview: Interview): string | null {
  if (interview.result?.completedAt) return interview.result.completedAt
  if (interview.status === 'completed') return interview.updatedAt
  return null
}

const PLACEHOLDER_RESULT_SUMMARY = 'Simulated evaluation result'

export function isPlaceholderResult(result: InterviewResult): boolean {
  return result.summary === PLACEHOLDER_RESULT_SUMMARY
}
