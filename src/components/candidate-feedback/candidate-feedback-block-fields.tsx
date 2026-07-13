'use client'

import { useId, useState } from 'react'
import { useTranslations } from 'next-intl'

import { AiSuggestionRow } from '@/components/questions/editor/ai-suggestion-row'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Textarea } from '@/components/ui/textarea'
import { type CandidateFeedbackBlock } from '@/lib/candidate-feedback'

interface CandidateFeedbackBlockFieldsProps {
  block: Pick<
    CandidateFeedbackBlock,
    'recommendationText' | 'improvementText' | 'state'
  >
  saving: boolean
  onSave: (payload: {
    recommendationText: string
    improvementText: string
  }) => Promise<void>
  onAcceptAll: (payload: {
    recommendationText: string
    improvementText: string
  }) => Promise<void>
}

function getPersistedSourceKey(
  block: Pick<
    CandidateFeedbackBlock,
    'recommendationText' | 'improvementText' | 'state'
  >,
): string | null {
  if (block.state !== 'accepted' && block.state !== 'edited') {
    return null
  }

  return `${block.state}:${block.recommendationText ?? ''}:${block.improvementText ?? ''}`
}

function getGeneratedSnapshotKey(
  block: Pick<
    CandidateFeedbackBlock,
    'recommendationText' | 'improvementText' | 'state'
  >,
): string | null {
  if (block.state !== 'generated') {
    return null
  }

  return `${block.recommendationText ?? ''}|${block.improvementText ?? ''}`
}

export function CandidateFeedbackBlockFields({
  block,
  saving,
  onSave,
  onAcceptAll,
}: CandidateFeedbackBlockFieldsProps) {
  const t = useTranslations('interviews.candidateFeedback')
  const recommendationId = useId()
  const improvementId = useId()
  const persistedSourceKey = getPersistedSourceKey(block)
  const generatedSnapshotKey = getGeneratedSnapshotKey(block)
  const [syncedPersistedKey, setSyncedPersistedKey] = useState<string | null>(
    null,
  )
  const [syncedGeneratedKey, setSyncedGeneratedKey] = useState<string | null>(
    null,
  )
  const [recommendationText, setRecommendationText] = useState(
    block.recommendationText ?? '',
  )
  const [improvementText, setImprovementText] = useState(
    block.improvementText ?? '',
  )
  const [dismissedRecommendation, setDismissedRecommendation] = useState(false)
  const [dismissedImprovement, setDismissedImprovement] = useState(false)

  if (persistedSourceKey && persistedSourceKey !== syncedPersistedKey) {
    setSyncedPersistedKey(persistedSourceKey)
    setRecommendationText(block.recommendationText ?? '')
    setImprovementText(block.improvementText ?? '')
  }

  if (!persistedSourceKey && syncedPersistedKey !== null) {
    setSyncedPersistedKey(null)
  }

  if (generatedSnapshotKey && generatedSnapshotKey !== syncedGeneratedKey) {
    setSyncedGeneratedKey(generatedSnapshotKey)
    setDismissedRecommendation(false)
    setDismissedImprovement(false)
  }

  if (!generatedSnapshotKey && syncedGeneratedKey !== null) {
    setSyncedGeneratedKey(null)
  }

  const showRecommendationSuggestion =
    block.state === 'generated' &&
    !dismissedRecommendation &&
    Boolean(block.recommendationText?.trim())
  const showImprovementSuggestion =
    block.state === 'generated' &&
    !dismissedImprovement &&
    Boolean(block.improvementText?.trim())
  const hasPendingSuggestions =
    showRecommendationSuggestion || showImprovementSuggestion

  function handleUseAiRecommendation() {
    setRecommendationText(block.recommendationText ?? '')
    setDismissedRecommendation(true)
  }

  function handleUseAiImprovement() {
    setImprovementText(block.improvementText ?? '')
    setDismissedImprovement(true)
  }

  function handleAcceptAllSuggestions() {
    const nextRecommendation = block.recommendationText ?? ''
    const nextImprovement = block.improvementText ?? ''
    setRecommendationText(nextRecommendation)
    setImprovementText(nextImprovement)
    void onAcceptAll({
      recommendationText: nextRecommendation,
      improvementText: nextImprovement,
    })
  }

  return (
    <Stack gap={4}>
      {hasPendingSuggestions ? (
        <Inline gap={2} wrap="wrap">
          <DemoWriteGuard disabled={saving}>
            <Button
              type="button"
              variant="outline-pill"
              shape="pill"
              loading={saving}
              onClick={() => void handleAcceptAllSuggestions()}
            >
              {t('acceptAllSuggestions')}
            </Button>
          </DemoWriteGuard>
        </Inline>
      ) : null}

      <Stack gap={3}>
        <FormField htmlFor={recommendationId} label={t('recommendationLabel')}>
          <Textarea
            id={recommendationId}
            value={recommendationText}
            onChange={(event) => setRecommendationText(event.target.value)}
            disabled={saving}
            size="sm"
          />
        </FormField>
        {showRecommendationSuggestion ? (
          <AiSuggestionRow
            value={block.recommendationText ?? ''}
            onApply={handleUseAiRecommendation}
            onKeep={() => setDismissedRecommendation(true)}
          />
        ) : null}
      </Stack>

      <Stack gap={3}>
        <FormField htmlFor={improvementId} label={t('improvementLabel')}>
          <Textarea
            id={improvementId}
            value={improvementText}
            onChange={(event) => setImprovementText(event.target.value)}
            disabled={saving}
            size="sm"
          />
        </FormField>
        {showImprovementSuggestion ? (
          <AiSuggestionRow
            value={block.improvementText ?? ''}
            onApply={handleUseAiImprovement}
            onKeep={() => setDismissedImprovement(true)}
          />
        ) : null}
      </Stack>

      <Inline gap={2} wrap="wrap">
        <DemoWriteGuard disabled={saving}>
          <Button
            type="button"
            variant="gradient"
            shape="pill"
            loading={saving}
            onClick={() =>
              void onSave({
                recommendationText,
                improvementText,
              })
            }
          >
            {t('saveChanges')}
          </Button>
        </DemoWriteGuard>
      </Inline>
    </Stack>
  )
}
