'use client'

import { useEffect, useState } from 'react'
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
  const [generateAllActive, setGenerateAllActive] = useState(false)

  const questionCount = interview.questions.length
  const interviewLocale = interview.interviewLocale ?? feedback.interviewLocale
  const questionBlocks = buildQuestionBlocksView(questionCount, feedback)
  const isEmpty = isCandidateFeedbackEmpty(questionCount, feedback)
  const feedbackGenerating = isCandidateFeedbackGenerating(feedback)
  const generateAllBusy = generatingTarget !== null || feedbackGenerating
  const generateAllLoading = generatingTarget === 'all' || generateAllActive

  useEffect(() => {
    if (!feedbackGenerating) {
      setGenerateAllActive(false)
    }
  }, [feedbackGenerating])

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
    if (target === 'all') {
      setGenerateAllActive(true)
    }
    setGeneratingTarget(target)
    try {
      await runMutation(() => applyGenerationUpdate(mutation), toast)
    } catch {
      if (target === 'all') {
        setGenerateAllActive(false)
      }
      /* toast handled by runMutation */
    } finally {
      setGeneratingTarget(null)
    }
  }

  function handleGenerateAll() {
    return runGenerateMutation(
      'all',
      () => generateCandidateFeedbackAll(interview.id, interviewLocale),
      {
        successMessage: toastMessages.generateStartSuccess,
        errorMessage: toastMessages.generateStartError,
      },
    )
  }

  function handleGenerateQuestion(questionIndex: number) {
    return runGenerateMutation(
      `question-${questionIndex}`,
      () => generateCandidateFeedbackQuestion(interview.id, questionIndex, interviewLocale),
      {
        successMessage: toastMessages.generateStartSuccess,
        errorMessage: toastMessages.generateStartError,
      },
    )
  }

  function handleUseAiOverall(payload: {
    recommendationText: string
    improvementText: string
  }) {
    return runPatchMutation(
      'overall',
      () =>
        updateCandidateFeedback(
          interview.id,
          {
            overall: {
              recommendationText: payload.recommendationText,
              improvementText: payload.improvementText,
              state: 'accepted',
            },
          },
          interviewLocale,
        ),
      {
        successMessage: toastMessages.acceptSuccess,
        errorMessage: toastMessages.acceptError,
      },
    )
  }

  function handleSaveOverall(payload: {
    recommendationText: string
    improvementText: string
  }) {
    return runPatchMutation(
      'overall',
      () =>
        updateCandidateFeedback(
          interview.id,
          {
            overall: {
              recommendationText: payload.recommendationText,
              improvementText: payload.improvementText,
              state: 'edited',
            },
          },
          interviewLocale,
        ),
      {
        successMessage: toastMessages.saveSuccess,
        errorMessage: toastMessages.saveError,
      },
    )
  }

  function handleUseAiQuestion(
    questionIndex: number,
    payload: { recommendationText: string; improvementText: string },
  ) {
    return runPatchMutation(
      `question-${questionIndex}`,
      () =>
        updateCandidateFeedback(
          interview.id,
          {
            questions: [
              {
                questionIndex,
                recommendationText: payload.recommendationText,
                improvementText: payload.improvementText,
                state: 'accepted',
              },
            ],
          },
          interviewLocale,
        ),
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
        updateCandidateFeedback(
          interview.id,
          {
            questions: [
              {
                questionIndex,
                recommendationText: payload.recommendationText,
                improvementText: payload.improvementText,
                state: 'edited',
              },
            ],
          },
          interviewLocale,
        ),
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
                loading={generateAllLoading}
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
            block={feedback.overall}
            saving={savingTarget === 'overall'}
            retrying={generateAllLoading}
            retryDisabled={isOverallBlockGenerationBusy(
              feedback.overall.state,
              generatingTarget,
            )}
            onRetry={handleGenerateAll}
            onUseAi={handleUseAiOverall}
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
                  generateAllActive={generateAllActive}
                  generationDisabled={isQuestionBlockGenerationBusy(
                    block.state,
                    block.questionIndex,
                    generatingTarget,
                  )}
                  onGenerate={() => handleGenerateQuestion(block.questionIndex)}
                  onUseAi={(payload) =>
                    handleUseAiQuestion(block.questionIndex, payload)
                  }
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
