'use client'

import { useTranslations } from 'next-intl'

import { useCandidateFeedbackErrorLabel } from '@/components/candidate-feedback/use-candidate-feedback-error-label'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'
import { type CandidateFeedbackSkipReason } from '@/lib/candidate-feedback'

interface CandidateFeedbackAutoTemplateHintProps {
  skipReason: CandidateFeedbackSkipReason | null
}

export function CandidateFeedbackAutoTemplateHint({
  skipReason,
}: CandidateFeedbackAutoTemplateHintProps) {
  const t = useTranslations('interviews.candidateFeedback')
  const { formatSkipReason } = useCandidateFeedbackErrorLabel()

  return (
    <Stack gap={1}>
      <BodyText size="sm" tone="muted">
        {t('autoTemplateHint')}
      </BodyText>
      {skipReason ? (
        <BodyText size="sm" tone="muted">
          {formatSkipReason(skipReason)}
        </BodyText>
      ) : null}
    </Stack>
  )
}
