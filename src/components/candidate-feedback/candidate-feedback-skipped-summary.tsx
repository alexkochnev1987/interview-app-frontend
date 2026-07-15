'use client'

import { useTranslations } from 'next-intl'

import { useCandidateFeedbackErrorLabel } from '@/components/candidate-feedback/use-candidate-feedback-error-label'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import {
  type CandidateFeedbackSkipReason,
  type GenerateAllQuestionSkipEntry,
} from '@/lib/candidate-feedback'

interface CandidateFeedbackSkippedSummaryProps {
  questionEntries: GenerateAllQuestionSkipEntry[]
  overallReason?: CandidateFeedbackSkipReason | null
}

export function CandidateFeedbackSkippedSummary({
  questionEntries,
  overallReason = null,
}: CandidateFeedbackSkippedSummaryProps) {
  const t = useTranslations('interviews.candidateFeedback')
  const { formatSkipReason } = useCandidateFeedbackErrorLabel()

  if (questionEntries.length === 0 && !overallReason) {
    return null
  }

  const count = questionEntries.length + (overallReason ? 1 : 0)

  return (
    <Stack gap={2}>
      <BodyText size="sm" tone="muted">
        {t('skippedQuestionsSummaryTitle', { count })}
      </BodyText>
      <Stack gap={1}>
        {overallReason ? (
          <BodyText size="sm" tone="muted">
            {t('skippedOverallItem', {
              reason: formatSkipReason(overallReason),
            })}
          </BodyText>
        ) : null}
        {questionEntries.map(({ questionIndex, reason }) => (
          <BodyText key={questionIndex} size="sm" tone="muted">
            {t('skippedQuestionItem', {
              index: questionIndex + 1,
              reason: reason
                ? formatSkipReason(reason)
                : t('skippedQuestionUnknownReason'),
            })}
          </BodyText>
        ))}
      </Stack>
    </Stack>
  )
}
