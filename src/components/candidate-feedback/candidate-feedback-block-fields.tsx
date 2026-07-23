'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { AiSuggestionRow } from '@/components/questions/editor/ai-suggestion-row'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { DisabledHintTooltip } from '@/components/ui/disabled-hint-tooltip'
import { FormField } from '@/components/ui/form-field'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Textarea } from '@/components/ui/textarea'
import {
  resolveCandidateFeedbackSavePayload,
  type CandidateFeedbackBlock,
} from '@/lib/candidate-feedback'

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

function getInitialDraftText(
  block: Pick<
    CandidateFeedbackBlock,
    'recommendationText' | 'improvementText' | 'state'
  >,
  field: 'recommendation' | 'improvement',
): string {
  if (block.state !== 'accepted' && block.state !== 'edited') {
    return ''
  }

  return field === 'recommendation'
    ? (block.recommendationText ?? '')
    : (block.improvementText ?? '')
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
  const lastPersistedSourceKeyRef = useRef<string | null>(null)
  const lastGeneratedSnapshotKeyRef = useRef<string | null>(null)
  const [recommendationText, setRecommendationText] = useState(() =>
    getInitialDraftText(block, 'recommendation'),
  )
  const [improvementText, setImprovementText] = useState(() =>
    getInitialDraftText(block, 'improvement'),
  )
  const [dismissedRecommendation, setDismissedRecommendation] = useState(false)
  const [dismissedImprovement, setDismissedImprovement] = useState(false)

  useEffect(() => {
    if (persistedSourceKey === lastPersistedSourceKeyRef.current) return
    lastPersistedSourceKeyRef.current = persistedSourceKey
    if (!persistedSourceKey) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync draft fields when accepted/edited block changes from server
    setRecommendationText(block.recommendationText ?? '')
    setImprovementText(block.improvementText ?? '')
  }, [persistedSourceKey, block.recommendationText, block.improvementText])

  useEffect(() => {
    if (generatedSnapshotKey === lastGeneratedSnapshotKeyRef.current) return
    lastGeneratedSnapshotKeyRef.current = generatedSnapshotKey
    if (!generatedSnapshotKey) return
    /* eslint-disable react-hooks/set-state-in-effect -- reset working copy when a new AI snapshot arrives */
    setDismissedRecommendation(false)
    setDismissedImprovement(false)
    setRecommendationText('')
    setImprovementText('')
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [generatedSnapshotKey])

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

  const savePayload = useMemo(
    () =>
      resolveCandidateFeedbackSavePayload(block, {
        recommendationText,
        improvementText,
      }),
    [block, improvementText, recommendationText],
  )
  const saveLocked = savePayload === null

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

  function handleSave() {
    if (!savePayload) {
      return
    }
    void onSave(savePayload)
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
        <DisabledHintTooltip
          active={saveLocked}
          hint={t('saveChangesLockedHint')}
        >
          <DemoWriteGuard disabled={saving || saveLocked}>
            <Button
              type="button"
              variant="gradient"
              shape="pill"
              loading={saving}
              onClick={handleSave}
            >
              {t('saveChanges')}
            </Button>
          </DemoWriteGuard>
        </DisabledHintTooltip>
      </Inline>
    </Stack>
  )
}
