'use client'

import { useEffect, useId, useRef, useState } from 'react'
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
  onUseAi: (payload: {
    recommendationText: string
    improvementText: string
  }) => Promise<void>
}

export function CandidateFeedbackBlockFields({
  block,
  saving,
  onSave,
  onUseAi,
}: CandidateFeedbackBlockFieldsProps) {
  const t = useTranslations('interviews.candidateFeedback')
  const recommendationId = useId()
  const improvementId = useId()
  const previousStateRef = useRef(block.state)
  const [recommendationText, setRecommendationText] = useState(
    block.recommendationText ?? '',
  )
  const [improvementText, setImprovementText] = useState(
    block.improvementText ?? '',
  )
  const [dismissedRecommendation, setDismissedRecommendation] = useState(false)
  const [dismissedImprovement, setDismissedImprovement] = useState(false)

  useEffect(() => {
    if (block.state === 'accepted' || block.state === 'edited') {
      setRecommendationText(block.recommendationText ?? '')
      setImprovementText(block.improvementText ?? '')
    }
  }, [block.improvementText, block.recommendationText, block.state])

  useEffect(() => {
    if (block.state === 'generated' && previousStateRef.current !== 'generated') {
      setDismissedRecommendation(false)
      setDismissedImprovement(false)
    }
    previousStateRef.current = block.state
  }, [block.state])

  const showRecommendationSuggestion =
    block.state === 'generated' &&
    !dismissedRecommendation &&
    Boolean(block.recommendationText?.trim())
  const showImprovementSuggestion =
    block.state === 'generated' &&
    !dismissedImprovement &&
    Boolean(block.improvementText?.trim())

  function handleUseAiRecommendation() {
    const nextRecommendation = block.recommendationText ?? ''
    setRecommendationText(nextRecommendation)
    void onUseAi({
      recommendationText: nextRecommendation,
      improvementText,
    })
  }

  function handleUseAiImprovement() {
    const nextImprovement = block.improvementText ?? ''
    setImprovementText(nextImprovement)
    void onUseAi({
      recommendationText,
      improvementText: nextImprovement,
    })
  }

  return (
    <Stack gap={4}>
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
