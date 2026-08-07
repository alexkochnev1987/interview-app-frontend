import type {
  RecruiterAssistantCreatePendingAction,
  RecruiterAssistantPendingAction,
} from '@/lib/api'

export function isEditableInterviewPendingAction(
  pendingAction: RecruiterAssistantPendingAction,
): pendingAction is RecruiterAssistantCreatePendingAction {
  return pendingAction.type === 'create_interview'
}

export function removePendingActionQuestion(
  pendingAction: RecruiterAssistantCreatePendingAction,
  questionKey: string,
): RecruiterAssistantCreatePendingAction {
  return {
    ...pendingAction,
    questions: pendingAction.questions.filter((question) => question.key !== questionKey),
  }
}
