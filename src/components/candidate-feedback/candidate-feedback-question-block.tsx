'use client'

import { useTranslations } from 'next-intl'

import { CandidateFeedbackAutoTemplateHint } from '@/components/candidate-feedback/candidate-feedback-auto-template-hint'
import { CandidateFeedbackBlockFields } from '@/components/candidate-feedback/candidate-feedback-block-fields'
import { CandidateFeedbackBlockStatePill } from '@/components/candidate-feedback/candidate-feedback-block-state-pill'
import { CandidateFeedbackFailedBlock } from '@/components/candidate-feedback/candidate-feedback-failed-block'
import { CandidateFeedbackGenerateButton } from '@/components/candidate-feedback/candidate-feedback-generate-button'
import { CandidateFeedbackQuestionContext } from '@/components/candidate-feedback/candidate-feedback-question-context'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Card, CardContent } from '@/components/ui/card'
import { DividerLabel } from '@/components/ui/divider-label'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import {
  getCandidateFeedbackBlockSkipReason,
  getQuestionGenerateLabelKey,
  isBlockUsingSharedCandidateFeedbackError,
  isSystemPrefilledCandidateFeedbackBlock,
  shouldShowQuestionGenerateButton,
  type CandidateFeedbackQuestionBlock,
} from '@/lib/candidate-feedback'
import { type Answer, type InterviewQuestion } from '@/lib/api'

interface CandidateFeedbackQuestionBlockEditorProps {
  block: CandidateFeedbackQuestionBlock
  question: InterviewQuestion
  answer: Answer | undefined
  saving: boolean
  generating: boolean
  generationDisabled: boolean
  sharedGenerationError?: string | null
  onGenerate: () => Promise<void>
  onAcceptAll: (payload: {
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
  question,
  answer,
  saving,
  generating,
  generationDisabled,
  sharedGenerationError,
  onGenerate,
  onAcceptAll,
  onSave,
}: CandidateFeedbackQuestionBlockEditorProps) {
  const t = useTranslations('interviews.candidateFeedback')
  const showGenerateButton = shouldShowQuestionGenerateButton(block.state)
  const generateLabelKey = getQuestionGenerateLabelKey(block.state)
  const usesSharedError = isBlockUsingSharedCandidateFeedbackError(
    block,
    sharedGenerationError ?? null,
  )
  const blockSkipReason = getCandidateFeedbackBlockSkipReason(block)
  const isSystemPrefilled = isSystemPrefilledCandidateFeedbackBlock(block)

  return (
    <Card variant="surface" size="lg">
      <CardContent spacing="lg">
        <Stack gap={4}>
          <Inline gap={2} align="center" justify="between" wrap="wrap">
            <SectionHeading as="h4">
              {t('questionBlockTitle', { index: block.questionIndex + 1 })}
            </SectionHeading>
            <CandidateFeedbackBlockStatePill block={block} />
          </Inline>

          <CandidateFeedbackQuestionContext question={question} answer={answer} />

          {block.state === 'not_generated' ? (
            <BodyText tone="muted">{t('notGeneratedHint')}</BodyText>
          ) : null}

          {block.state === 'failed' && !usesSharedError ? (
            <CandidateFeedbackFailedBlock
              errorMessage={block.errorMessage}
              retrying={generating}
              retryDisabled={generationDisabled}
              onRetry={onGenerate}
              showRetry={false}
            />
          ) : null}

          {isSystemPrefilled ? (
            <CandidateFeedbackAutoTemplateHint skipReason={blockSkipReason} />
          ) : null}

          {showGenerateButton ? (
            <Inline gap={2} wrap="wrap">
              <DemoWriteGuard disabled={generationDisabled}>
                <CandidateFeedbackGenerateButton
                  label={t(generateLabelKey)}
                  loading={generating}
                  disabled={generationDisabled}
                  onClick={() => void onGenerate()}
                />
              </DemoWriteGuard>
            </Inline>
          ) : null}

          <DividerLabel>{t('context.feedbackSection')}</DividerLabel>

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
