import type {
  Answer,
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
  | 'canceled'

export type ReviewStatusTone =
  | 'completed'
  | 'processing'
  | 'primary'
  | 'in_progress'
  | 'pending'
  | 'failed'
  | 'neutral'

export type DecisionTone = 'completed' | 'pending' | 'failed'

/**
 * The logical state of a single answer's AI scoring. This is the single source
 * of truth for "what is happening with this answer" and must be the only place
 * that interprets `validation.status` + `evaluation.overallScore` together.
 */
export type AnswerState = 'none' | 'awaiting' | 'scoring' | 'scored' | 'failed'

export type AnswerStateTone =
  | 'pending'
  | 'in_progress'
  | 'processing'
  | 'completed'
  | 'failed'

function assertNever(value: never): never {
  throw new Error(`Unhandled interview status: ${String(value)}`)
}

export function deriveAnswerState(answer: Answer | undefined): AnswerState {
  if (!answer) return 'none'
  const validationStatus = answer.validation?.status
  if (validationStatus === 'failed') return 'failed'
  if (validationStatus === 'queued' || validationStatus === 'processing') {
    return 'scoring'
  }
  if (answer.evaluation?.overallScore !== undefined) return 'scored'
  return 'awaiting'
}

export function answerStateTone(state: AnswerState): AnswerStateTone {
  switch (state) {
    case 'failed':
      return 'failed'
    case 'scoring':
      return 'processing'
    case 'scored':
      return 'completed'
    case 'awaiting':
      return 'in_progress'
    case 'none':
      return 'pending'
    default:
      return assertNever(state)
  }
}

export function isValidationInFlight(interview: Interview): boolean {
  return interview.answers.some(
    (a) => a.status === 'submitted' && deriveAnswerState(a) === 'scoring',
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

/**
 * Review state is derived solely from `interview.status` and the per-answer
 * states. `interview.workflow` is intentionally not consumed: on the backend it
 * is a secondary projection derived from `interview.status`, so reading it here
 * cannot disagree with this function and would only duplicate the source of
 * truth.
 */
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
    case 'canceled':
      return 'canceled'
    default:
      return assertNever(interview.status)
  }
}

/**
 * Whether the reviewer may (re)trigger AI evaluation from the current review
 * state. Pending/awaiting-candidate and mid-interview states are not rerunnable.
 */
export function canRerunReview(status: ReviewStatus): boolean {
  return status === 'ready' || status === 'scoring' || status === 'failed'
}

/** A single interview is actively being scored and worth live-polling. */
export function isScoring(interview: Interview): boolean {
  return deriveReviewStatus(interview) === 'scoring'
}

/** Any interview in the list is actively being scored. */
export function hasScoringInProgress(interviews: Interview[]): boolean {
  return interviews.some(isScoring)
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
    case 'canceled':
      return 'Canceled'
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
    case 'canceled':
      return 'neutral'
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

/**
 * The single ordering+visibility pass HR sees: keep only review-relevant
 * assessments, most recently completed first. Shared by the server page and the
 * client polling fetcher so the two never drift.
 */
export function selectHrVisibleAssessments(
  interviews: Interview[],
): Interview[] {
  return interviews
    .filter(isHrVisibleAssessment)
    .sort(compareAssessmentsByCompletion)
}

const PLACEHOLDER_RESULT_SUMMARY = 'Simulated evaluation result'

export function isPlaceholderResult(result: InterviewResult): boolean {
  return result.summary === PLACEHOLDER_RESULT_SUMMARY
}
