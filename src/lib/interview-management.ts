import type { Interview } from '@/lib/api'

export function isPendingInterview(interview: Interview): boolean {
  return interview.status === 'pending'
}

export function hasInterviewAnswers(interview: Interview): boolean {
  return interview.answers.length > 0
}

/** Pending interviews with no uploaded answers can be edited safely. */
export function canEditInterview(interview: Interview): boolean {
  return isPendingInterview(interview) && !hasInterviewAnswers(interview)
}

/** Pending interviews can still be canceled even after uploads exist. */
export function canManageInterview(interview: Interview): boolean {
  return isPendingInterview(interview)
}

/** Completed or failed interviews can be permanently deleted. */
export function canDeleteInterview(interview: Interview): boolean {
  return interview.status === 'completed' || interview.status === 'failed'
}

/** Candidate feedback is available once the interview has finished (success or failure). */
export function canAccessCandidateFeedback(interview: Interview): boolean {
  return interview.status === 'completed' || interview.status === 'failed'
}
