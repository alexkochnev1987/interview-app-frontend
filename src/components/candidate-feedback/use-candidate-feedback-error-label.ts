'use client'

import { useTranslations } from 'next-intl'

import {
  isCandidateFeedbackSkipReason,
  parseCandidateFeedbackErrorMessage,
  type CandidateFeedbackSkipReason,
} from '@/lib/candidate-feedback'

export function useCandidateFeedbackErrorLabel() {
  const t = useTranslations('interviews.candidateFeedback')

  function formatSkipReason(reason: CandidateFeedbackSkipReason): string {
    return t(`skipReason.${reason}`)
  }

  function formatErrorMessage(errorMessage: string | null | undefined): string {
    const parsed = parseCandidateFeedbackErrorMessage(errorMessage ?? '')
    if (parsed.kind === 'location_not_supported') {
      return t('locationNotSupportedError')
    }
    if (isCandidateFeedbackSkipReason(parsed)) {
      return formatSkipReason(parsed.reason)
    }
    if (parsed.message.trim()) {
      return parsed.message
    }
    return t('failedDescription')
  }

  return {
    formatErrorMessage,
    formatSkipReason,
  }
}
