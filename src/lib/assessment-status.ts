import type {
  Interview,
  InterviewBehaviorRisk,
  InterviewDecision,
  InterviewResult,
} from '@/lib/api'

export type ReviewStatus =
  | 'ready'
  | 'scoring'
  | 'ready_to_score'
  | 'in_progress'
  | 'pending'
  | 'failed'

export type ReviewStatusTone =
  | 'completed'
  | 'processing'
  | 'primary'
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

function allAnswersSubmitted(interview: Interview): boolean {
  if (interview.questions.length === 0) return false
  return interview.questions.every((_question, index) =>
    interview.answers.some(
      (a) => a.questionIndex === index && a.status === 'submitted',
    ),
  )
}

export function deriveReviewStatus(interview: Interview): ReviewStatus {
  switch (interview.status) {
    case 'failed':
      return 'failed'
    case 'pending':
      return 'pending'
    case 'in_progress':
      if (
        allAnswersSubmitted(interview) &&
        !isValidationInFlight(interview) &&
        !interview.result
      ) {
        return 'ready_to_score'
      }
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
    case 'ready_to_score':
      return 'Ready for AI review'
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
    case 'ready_to_score':
      return 'primary'
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

export const HR_VISIBLE_REVIEW_STATUSES: ReadonlySet<ReviewStatus> =
  new Set<ReviewStatus>(['ready_to_score', 'scoring', 'ready', 'failed'])

export function isHrVisibleAssessment(interview: Interview): boolean {
  return HR_VISIBLE_REVIEW_STATUSES.has(deriveReviewStatus(interview))
}

export function compareAssessmentsByCompletion(
  a: Interview,
  b: Interview,
): number {
  const ca = getCompletionDate(a)
  const cb = getCompletionDate(b)

  if (ca && !cb) return -1
  if (!ca && cb) return 1

  const da = ca ?? a.updatedAt
  const db = cb ?? b.updatedAt
  return new Date(db).getTime() - new Date(da).getTime()
}

const PLACEHOLDER_RESULT_SUMMARY = 'Simulated evaluation result'

export function isPlaceholderResult(result: InterviewResult): boolean {
  return result.summary === PLACEHOLDER_RESULT_SUMMARY
}
