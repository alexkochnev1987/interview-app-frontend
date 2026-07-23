'use client'

import { useTranslations } from 'next-intl'

import { CandidateFeedbackBlockFields } from '@/components/candidate-feedback/candidate-feedback-block-fields'
import { CandidateFeedbackBlockStatePill } from '@/components/candidate-feedback/candidate-feedback-block-state-pill'
import { CandidateFeedbackFailedBlock } from '@/components/candidate-feedback/candidate-feedback-failed-block'
import { CandidateFeedbackOutcomeField } from '@/components/candidate-feedback/candidate-feedback-outcome-field'
import { Card, CardContent } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import {
  type CandidateFeedbackBlock,
  type CandidateFeedbackOutcome,
  isBlockUsingSharedCandidateFeedbackError,
} from '@/lib/candidate-feedback'

interface CandidateFeedbackOverallBlockProps {
  block: CandidateFeedbackBlock
  outcome?: CandidateFeedbackOutcome | null
  outcomeMessage?: string | null
  saving: boolean
  outcomeSaving: boolean
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
  onOutcomeChange: (next: {
    outcome: CandidateFeedbackOutcome | null
    outcomeMessage?: string | null
  }) => Promise<void>
}

export function CandidateFeedbackOverallBlock({
  block,
  outcome,
  outcomeMessage,
  saving,
  outcomeSaving,
  retrying,
  retryDisabled,
  sharedGenerationError,
  onRetry,
  onAcceptAll,
  onSave,
  onOutcomeChange,
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
            <CandidateFeedbackBlockStatePill block={block} />
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

          <CandidateFeedbackOutcomeField
            value={outcome}
            message={outcomeMessage}
            disabled={outcomeSaving || saving}
            onChange={(next) => {
              void onOutcomeChange(next)
            }}
          />

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
