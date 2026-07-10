'use client'

import { useState } from 'react'
import { MessageSquareText, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CandidateFeedbackHeader } from '@/components/candidate-feedback/candidate-feedback-header'
import { CandidateFeedbackLiveRefreshNotice } from '@/components/candidate-feedback/candidate-feedback-live-refresh-notice'
import { CandidateFeedbackOverallBlock } from '@/components/candidate-feedback/candidate-feedback-overall-block'
import { CandidateFeedbackQuestionBlockEditor } from '@/components/candidate-feedback/candidate-feedback-question-block'
import { useCandidateFeedbackData } from '@/components/candidate-feedback/use-candidate-feedback-data'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { EmptyStateCard } from '@/components/ui/state-card'
import {
  generateCandidateFeedbackAll,
  generateCandidateFeedbackQuestion,
  updateCandidateFeedback,
  type Interview,
} from '@/lib/api'
import {
  buildQuestionBlocksView,
  type CandidateFeedbackResponse,
  isCandidateFeedbackEmpty,
  isCandidateFeedbackGenerating,
  isOverallBlockGenerationBusy,
  isQuestionBlockGenerationBusy,
} from '@/lib/candidate-feedback'
import { runMutation } from '@/lib/run-mutation'
import { useCandidateFeedbackToastMessages } from '@/lib/toast-messages/use-candidate-feedback-toast-messages'

interface CandidateFeedbackEditorProps {
  interview: Interview
  initialFeedback: CandidateFeedbackResponse
}

type SavingTarget = 'overall' | `question-${number}` | null
type GeneratingTarget = 'all' | `question-${number}` | null

type FeedbackMutationToast = {
  successMessage: string
  errorMessage: string
}

export function CandidateFeedbackEditor({
  interview,
  initialFeedback,
}: CandidateFeedbackEditorProps) {
  const t = useTranslations('interviews.candidateFeedback')
  const toastMessages = useCandidateFeedbackToastMessages()
  const { feedback, replaceFeedback, kick, refresh, paused } =
    useCandidateFeedbackData(interview.id, initialFeedback)
  const [savingTarget, setSavingTarget] = useState<SavingTarget>(null)
  const [generatingTarget, setGeneratingTarget] = useState<GeneratingTarget>(null)

  const questionCount = interview.questions.length
  const questionBlocks = buildQuestionBlocksView(questionCount, feedback)
  const isEmpty = isCandidateFeedbackEmpty(questionCount, feedback)
  const generateAllBusy =
    generatingTarget !== null || isCandidateFeedbackGenerating(feedback)

  async function applyPatchUpdate(
    mutation: () => Promise<CandidateFeedbackResponse>,
  ) {
    const updated = await mutation()
    replaceFeedback(updated)
    return updated
  }

  async function applyGenerationUpdate(
    mutation: () => Promise<CandidateFeedbackResponse>,
  ) {
    const updated = await mutation()
    replaceFeedback(updated)
    kick()
    return updated
  }

  async function runPatchMutation(
    target: SavingTarget,
    mutation: () => Promise<CandidateFeedbackResponse>,
    toast: FeedbackMutationToast,
  ) {
    setSavingTarget(target)
    try {
      await runMutation(() => applyPatchUpdate(mutation), toast)
    } catch {
      /* toast handled by runMutation */
    } finally {
      setSavingTarget(null)
    }
  }

  async function runGenerateMutation(
    target: GeneratingTarget,
    mutation: () => Promise<CandidateFeedbackResponse>,
    toast: FeedbackMutationToast,
  ) {
    setGeneratingTarget(target)
    try {
      await runMutation(() => applyGenerationUpdate(mutation), toast)
    } catch {
      /* toast handled by runMutation */
    } finally {
      setGeneratingTarget(null)
    }
  }

  function handleGenerateAll() {
    return runGenerateMutation(
      'all',
      () => generateCandidateFeedbackAll(interview.id),
      {
        successMessage: toastMessages.generateStartSuccess,
        errorMessage: toastMessages.generateStartError,
      },
    )
  }

  function handleGenerateQuestion(questionIndex: number) {
    return runGenerateMutation(
      `question-${questionIndex}`,
      () => generateCandidateFeedbackQuestion(interview.id, questionIndex),
      {
        successMessage: toastMessages.generateStartSuccess,
        errorMessage: toastMessages.generateStartError,
      },
    )
  }

  function handleAcceptOverall() {
    return runPatchMutation(
      'overall',
      () =>
        updateCandidateFeedback(interview.id, {
          overall: {
            text: feedback.overallText ?? '',
            state: 'accepted',
          },
        }),
      {
        successMessage: toastMessages.acceptSuccess,
        errorMessage: toastMessages.acceptError,
      },
    )
  }

  function handleSaveOverall(text: string) {
    return runPatchMutation(
      'overall',
      () =>
        updateCandidateFeedback(interview.id, {
          overall: { text, state: 'edited' },
        }),
      {
        successMessage: toastMessages.saveSuccess,
        errorMessage: toastMessages.saveError,
      },
    )
  }

  function handleAcceptQuestion(questionIndex: number) {
    const block = questionBlocks.find(
      (item) => item.questionIndex === questionIndex,
    )
    if (!block) return Promise.resolve()

    return runPatchMutation(
      `question-${questionIndex}`,
      () =>
        updateCandidateFeedback(interview.id, {
          questions: [
            {
              questionIndex,
              recommendationText: block.recommendationText ?? '',
              improvementText: block.improvementText ?? '',
              state: 'accepted',
            },
          ],
        }),
      {
        successMessage: toastMessages.acceptSuccess,
        errorMessage: toastMessages.acceptError,
      },
    )
  }

  function handleSaveQuestion(
    questionIndex: number,
    payload: { recommendationText: string; improvementText: string },
  ) {
    return runPatchMutation(
      `question-${questionIndex}`,
      () =>
        updateCandidateFeedback(interview.id, {
          questions: [
            {
              questionIndex,
              recommendationText: payload.recommendationText,
              improvementText: payload.improvementText,
              state: 'edited',
            },
          ],
        }),
      {
        successMessage: toastMessages.saveSuccess,
        errorMessage: toastMessages.saveError,
      },
    )
  }

  return (
    <PageShell>
      <CandidateFeedbackHeader interview={interview} />

      <Section>
        <Stack gap={6}>
          <Stack gap={2}>
            <EyebrowLabel>{t('eyebrow')}</EyebrowLabel>
            <SectionHeading>{t('title')}</SectionHeading>
            <BodyText tone="muted">{t('shellLead')}</BodyText>
          </Stack>

          {paused ? (
            <CandidateFeedbackLiveRefreshNotice onRefresh={() => void refresh()} />
          ) : null}

          {isEmpty ? (
            <Alert>
              <AlertTitle>{t('emptyTitle')}</AlertTitle>
              <AlertDescription>{t('emptyDescription')}</AlertDescription>
            </Alert>
          ) : null}

          <Inline gap={2} wrap="wrap">
            <DemoWriteGuard disabled={generateAllBusy}>
              <Button
                type="button"
                variant="gradient"
                shape="pill"
                loading={generatingTarget === 'all'}
                onClick={() => void handleGenerateAll()}
              >
                <Icon size="sm">
                  <Sparkles />
                </Icon>
                {questionCount > 0 ? t('generateAll') : t('generateOverall')}
              </Button>
            </DemoWriteGuard>
          </Inline>

          <CandidateFeedbackOverallBlock
            state={feedback.overallState}
            text={feedback.overallText}
            saving={savingTarget === 'overall'}
            retrying={generatingTarget === 'all'}
            retryDisabled={isOverallBlockGenerationBusy(
              feedback.overallState,
              generatingTarget,
            )}
            onRetry={handleGenerateAll}
            onAccept={handleAcceptOverall}
            onSave={handleSaveOverall}
          />

          {questionCount > 0 ? (
            <Stack gap={4}>
              <SectionHeading as="h3">{t('questionBlocksTitle')}</SectionHeading>
              {questionBlocks.map((block) => (
                <CandidateFeedbackQuestionBlockEditor
                  key={block.questionIndex}
                  block={block}
                  saving={savingTarget === `question-${block.questionIndex}`}
                  generating={
                    generatingTarget === `question-${block.questionIndex}`
                  }
                  generationDisabled={isQuestionBlockGenerationBusy(
                    block.state,
                    block.questionIndex,
                    generatingTarget,
                  )}
                  onGenerate={() => handleGenerateQuestion(block.questionIndex)}
                  onAccept={() => handleAcceptQuestion(block.questionIndex)}
                  onSave={(payload) =>
                    handleSaveQuestion(block.questionIndex, payload)
                  }
                />
              ))}
            </Stack>
          ) : (
            <EmptyStateCard
              icon={
                <Icon size="lg">
                  <MessageSquareText />
                </Icon>
              }
              title={t('noQuestionsTitle')}
              description={t('noQuestionsDescription')}
            />
          )}
        </Stack>
      </Section>
    </PageShell>
  )
}
