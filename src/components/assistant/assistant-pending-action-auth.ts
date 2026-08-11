import type { RecruiterAssistantPendingAction } from '@/lib/api'
import { canAssignInterviewHr, canConfigureInterview, canCreateQuestions } from '@/lib/auth-roles'

export function canConfirmAssistantPendingAction(
  pendingAction: RecruiterAssistantPendingAction,
  role: string | null | undefined,
): boolean {
  switch (pendingAction.type) {
    case 'assign_hr':
      return canAssignInterviewHr(role)
    case 'create_interview':
      return canConfigureInterview(role)
    case 'create_questions':
      return canCreateQuestions(role)
    case 'create_single_question':
      return canCreateQuestions(role)
    default:
      return false
  }
}
