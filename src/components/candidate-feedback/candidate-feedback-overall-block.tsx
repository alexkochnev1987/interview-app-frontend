'use client'

import { useTranslations } from 'next-intl'

import { CandidateFeedbackBlockFields } from '@/components/candidate-feedback/candidate-feedback-block-fields'
import { CandidateFeedbackBlockStatePill } from '@/components/candidate-feedback/candidate-feedback-block-state-pill'
import { CandidateFeedbackFailedBlock } from '@/components/candidate-feedback/candidate-feedback-failed-block'
import { Card, CardContent } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import {
  type CandidateFeedbackBlock,
  isBlockUsingSharedCandidateFeedbackError,
} from '@/lib/candidate-feedback'

interface CandidateFeedbackOverallBlockProps {
  block: CandidateFeedbackBlock
  saving: boolean
  retrying: boolean
  retryDisabled: boolean
  sharedGenerationError?: string | null
  onRetry: () => Promise<void>
  onAcceptAll: (payload: {
    recommendationText: string
    improvementText: string
  }) => Promise<void>
  onSave: (payload: {
    recommendationText: string
    improvementText: string
  }) => Promise<void>
}

export function CandidateFeedbackOverallBlock({
  block,
  saving,
  retrying,
  retryDisabled,
  sharedGenerationError,
  onRetry,
  onAcceptAll,
  onSave,
}: CandidateFeedbackOverallBlockProps) {
  const t = useTranslations('interviews.candidateFeedback')
  const usesSharedError = isBlockUsingSharedCandidateFeedbackError(
    block,
    sharedGenerationError ?? null,
  )

  return (
    <Card variant="surface" size="lg">
      <CardContent spacing="lg">
        <Stack gap={4}>
          <Inline gap={2} align="center" justify="between" wrap="wrap">
            <SectionHeading as="h3">{t('overallBlockTitle')}</SectionHeading>
            <CandidateFeedbackBlockStatePill state={block.state} />
          </Inline>

          {block.state === 'not_generated' ? (
            <BodyText tone="muted">{t('notGeneratedHint')}</BodyText>
          ) : null}

          {block.state === 'failed' ? (
            <CandidateFeedbackFailedBlock
              errorMessage={block.errorMessage}
              retrying={retrying}
              retryDisabled={retryDisabled}
              onRetry={onRetry}
              showAlert={!usesSharedError}
            />
          ) : null}

          <CandidateFeedbackBlockFields
            block={block}
            saving={saving}
            onSave={onSave}
            onAcceptAll={onAcceptAll}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
