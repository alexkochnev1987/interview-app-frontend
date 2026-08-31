import type { CandidatePortalInterviewListItem } from '@/lib/api'

export const PRACTICE_INTERVIEW_ITEM_ID = 'practice'

/**
 * A purely client-facing, non-persisted card spliced into the candidate's real
 * interview list so a practice run is reachable exactly like a real interview,
 * with no bespoke entry-point design. It's never fetched from the backend.
 */
export function buildPracticeInterviewListItem(title: string): CandidatePortalInterviewListItem {
  const now = new Date().toISOString()
  return {
    id: PRACTICE_INTERVIEW_ITEM_ID,
    position: title,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    questionCount: 0,
    maxAnswerAttempts: 0,
    resultsReady: false,
  }
}
