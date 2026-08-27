import type { useTranslations } from 'next-intl'

import type {
  RecruiterAssistantPendingAction,
  RecruiterAssistantSuggestedQuestion,
} from '@/lib/api'

type AssistantTranslator = ReturnType<typeof useTranslations<'assistant'>>

export type PendingActionDetailRow = {
  label: string
  value: string
}

type ConfirmDetailsOptions = {
  formatInterviewLocale?: (locale: string) => string
}

export function getPendingActionConfirmMessage(
  pendingAction: RecruiterAssistantPendingAction,
  t: AssistantTranslator,
): string {
  switch (pendingAction.type) {
    case 'create_interview':
      return t('confirm.createInterview')
    case 'create_questions':
      return t('confirm.createQuestions')
    case 'assign_hr':
      return t('confirm.assignHr')
    case 'create_single_question':
      return t('confirm.createSingleQuestion')
    default:
      return t('confirm.action')
  }
}

export function getPendingActionQuestions(
  pendingAction: RecruiterAssistantPendingAction,
): RecruiterAssistantSuggestedQuestion[] {
  if (pendingAction.type === 'create_interview' || pendingAction.type === 'create_questions') {
    return pendingAction.questions
  }
  return []
}

export function getPendingActionConfirmDetails(
  pendingAction: RecruiterAssistantPendingAction,
  t: AssistantTranslator,
  options?: ConfirmDetailsOptions,
): PendingActionDetailRow[] {
  switch (pendingAction.type) {
    case 'assign_hr':
      return [
        { label: t('confirm.details.interview'), value: pendingAction.interviewLabel },
        { label: t('confirm.details.hrReviewer'), value: pendingAction.assignedHrName },
        { label: t('confirm.details.interviewId'), value: pendingAction.interviewId },
        { label: t('confirm.details.assignedHrId'), value: pendingAction.assignedHrId },
      ]
    case 'create_interview':
    case 'create_questions': {
      const rows: PendingActionDetailRow[] = [
        { label: t('confirm.details.position'), value: pendingAction.position },
      ]
      if (pendingAction.candidateName) {
        rows.push({
          label: t('confirm.details.candidate'),
          value: pendingAction.candidateName,
        })
      }
      if (pendingAction.candidateEmail) {
        rows.push({
          label: t('confirm.details.candidateEmail'),
          value: pendingAction.candidateEmail,
        })
      }
      if (pendingAction.interviewLocale) {
        const localeLabel =
          options?.formatInterviewLocale?.(pendingAction.interviewLocale) ??
          pendingAction.interviewLocale
        rows.push({
          label: t('confirm.details.interviewLocale'),
          value: localeLabel,
        })
      }
      return rows
    }
    case 'create_single_question':
      return [{ label: t('confirm.details.questionName'), value: pendingAction.questionName }]
    default:
      return []
  }
}
