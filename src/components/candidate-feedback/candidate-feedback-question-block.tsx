'use client'

import { useTranslations } from 'next-intl'

import { CandidateFeedbackBlockFields } from '@/components/candidate-feedback/candidate-feedback-block-fields'
import { CandidateFeedbackBlockStatePill } from '@/components/candidate-feedback/candidate-feedback-block-state-pill'
import { CandidateFeedbackFailedBlock } from '@/components/candidate-feedback/candidate-feedback-failed-block'
import { CandidateFeedbackGenerateButton } from '@/components/candidate-feedback/candidate-feedback-generate-button'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Card, CardContent } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import {
  getQuestionGenerateLabelKey,
  shouldShowQuestionGenerateButton,
  type CandidateFeedbackQuestionBlock,
} from '@/lib/candidate-feedback'

interface CandidateFeedbackQuestionBlockEditorProps {
  block: CandidateFeedbackQuestionBlock
  saving: boolean
  generating: boolean
  generateAllActive: boolean
  generationDisabled: boolean
  onGenerate: () => Promise<void>
  onUseAi: (payload: {
    recommendationText: string
    improvementText: string
  }) => Promise<void>
  onSave: (payload: {
    recommendationText: string
    improvementText: string
  }) => Promise<void>
}

export function CandidateFeedbackQuestionBlockEditor({
  block,
  saving,
  generating,
  generateAllActive,
  generationDisabled,
  onGenerate,
  onUseAi,
  onSave,
}: CandidateFeedbackQuestionBlockEditorProps) {
  const t = useTranslations('interviews.candidateFeedback')
  const showGenerateButton = shouldShowQuestionGenerateButton(block.state)
  const isGenerating =
    generating ||
    (block.state === 'generating' && !generateAllActive)
  const generateLabelKey = getQuestionGenerateLabelKey(block.state)

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
            <BodyText tone="muted">{t('notGeneratedHint')}</BodyText>
          ) : null}

          {block.state === 'failed' ? (
            <CandidateFeedbackFailedBlock
              errorMessage={block.errorMessage}
              retrying={isGenerating}
              retryDisabled={generationDisabled}
              onRetry={onGenerate}
              showRetry={false}
            />
          ) : null}

          {showGenerateButton ? (
            <Inline gap={2} wrap="wrap">
              <DemoWriteGuard disabled={generationDisabled}>
                <CandidateFeedbackGenerateButton
                  label={t(generateLabelKey)}
                  loading={isGenerating}
                  disabled={generationDisabled}
                  onClick={() => void onGenerate()}
                />
              </DemoWriteGuard>
            </Inline>
          ) : null}

          <CandidateFeedbackBlockFields
            block={block}
            saving={saving}
            onSave={onSave}
            onUseAi={onUseAi}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
