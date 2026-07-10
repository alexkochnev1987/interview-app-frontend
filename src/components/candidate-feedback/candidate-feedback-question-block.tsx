'use client'

import { Sparkles } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { CandidateFeedbackBlockStatePill } from '@/components/candidate-feedback/candidate-feedback-block-state-pill'
import { CandidateFeedbackFailedBlock } from '@/components/candidate-feedback/candidate-feedback-failed-block'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { LoadingStateCard } from '@/components/ui/state-card'
import { Textarea } from '@/components/ui/textarea'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { type CandidateFeedbackQuestionBlock } from '@/lib/candidate-feedback'

interface CandidateFeedbackQuestionBlockEditorProps {
  block: CandidateFeedbackQuestionBlock
  saving: boolean
  generating: boolean
  generationDisabled: boolean
  onGenerate: () => Promise<void>
  onAccept: () => Promise<void>
  onSave: (payload: {
    recommendationText: string
    improvementText: string
  }) => Promise<void>
}

export function CandidateFeedbackQuestionBlockEditor({
  block,
  saving,
  generating,
  generationDisabled,
  onGenerate,
  onAccept,
  onSave,
}: CandidateFeedbackQuestionBlockEditorProps) {
  const t = useTranslations('interviews.candidateFeedback')
  const recommendationId = useId()
  const improvementId = useId()
  const [recommendationText, setRecommendationText] = useState(
    block.recommendationText ?? '',
  )
  const [improvementText, setImprovementText] = useState(
    block.improvementText ?? '',
  )

  useEffect(() => {
    setRecommendationText(block.recommendationText ?? '')
    setImprovementText(block.improvementText ?? '')
  }, [block.improvementText, block.recommendationText, block.state])

  return (
    <Card variant="surface" size="lg">
      <CardContent spacing="lg">
        <Stack gap={4}>
          <Inline gap={2} align="center" justify="between" wrap="wrap">
            <SectionHeading as="h4">
              {t('questionBlockTitle', { index: block.questionIndex + 1 })}
            </SectionHeading>
            <CandidateFeedbackBlockStatePill state={block.state} />
          </Inline>

          {block.state === 'not_generated' ? (
            <Stack gap={4}>
              <BodyText tone="muted">{t('notGeneratedHint')}</BodyText>
              <Inline gap={2} wrap="wrap">
                <DemoWriteGuard disabled={generating || generationDisabled}>
                  <Button
                    type="button"
                    variant="outline-pill"
                    shape="pill"
                    loading={generating}
                    onClick={() => void onGenerate()}
                  >
                    <Icon size="sm">
                      <Sparkles />
                    </Icon>
                    {t('generateQuestion')}
                  </Button>
                </DemoWriteGuard>
              </Inline>
            </Stack>
          ) : null}

          {block.state === 'failed' ? (
            <CandidateFeedbackFailedBlock
              retrying={generating}
              retryDisabled={generationDisabled}
              onRetry={onGenerate}
            />
          ) : null}

          {block.state === 'generating' ? (
            <LoadingStateCard label={t('generatingHint')} tone="ghost" />
          ) : null}

          {block.state === 'generated' ? (
            <Stack gap={4}>
              <BodyText tone="muted">{t('suggestionLead')}</BodyText>
              <Stack gap={2}>
                <BodyText tone="muted">{t('recommendationLabel')}</BodyText>
                <BodyText>
                  {block.recommendationText?.trim()
                    ? block.recommendationText
                    : t('noTextYet')}
                </BodyText>
              </Stack>
              <Stack gap={2}>
                <BodyText tone="muted">{t('improvementLabel')}</BodyText>
                <BodyText>
                  {block.improvementText?.trim()
                    ? block.improvementText
                    : t('noTextYet')}
                </BodyText>
              </Stack>
              <Inline gap={2} wrap="wrap">
                <DemoWriteGuard disabled={saving}>
                  <Button
                    type="button"
                    variant="gradient"
                    shape="pill"
                    loading={saving}
                    onClick={() => void onAccept()}
                  >
                    {t('acceptSuggestion')}
                  </Button>
                </DemoWriteGuard>
              </Inline>
            </Stack>
          ) : null}

          {block.state === 'accepted' || block.state === 'edited' ? (
            <Stack gap={4}>
              <FormField htmlFor={recommendationId} label={t('recommendationLabel')}>
                <Textarea
                  id={recommendationId}
                  value={recommendationText}
                  onChange={(event) => setRecommendationText(event.target.value)}
                  disabled={saving}
                  size="sm"
                />
              </FormField>
              <FormField htmlFor={improvementId} label={t('improvementLabel')}>
                <Textarea
                  id={improvementId}
                  value={improvementText}
                  onChange={(event) => setImprovementText(event.target.value)}
                  disabled={saving}
                  size="sm"
                />
              </FormField>
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
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}
