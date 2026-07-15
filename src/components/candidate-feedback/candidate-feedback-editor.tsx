'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageSquareText, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CandidateFeedbackHeader } from '@/components/candidate-feedback/candidate-feedback-header'
import { CandidateFeedbackLiveRefreshNotice } from '@/components/candidate-feedback/candidate-feedback-live-refresh-notice'
import { CandidateFeedbackOverallBlock } from '@/components/candidate-feedback/candidate-feedback-overall-block'
import { CandidateFeedbackQuestionBlockEditor } from '@/components/candidate-feedback/candidate-feedback-question-block'
import { CandidateFeedbackSkippedSummary } from '@/components/candidate-feedback/candidate-feedback-skipped-summary'
import { useCandidateFeedbackData } from '@/components/candidate-feedback/use-candidate-feedback-data'
import { useCandidateFeedbackErrorLabel } from '@/components/candidate-feedback/use-candidate-feedback-error-label'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DisabledHintTooltip } from '@/components/ui/disabled-hint-tooltip'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { EmptyStateCard } from '@/components/ui/state-card'
import {
  ApiError,
  generateCandidateFeedbackAll,
  generateCandidateFeedbackQuestion,
  updateCandidateFeedback,
  type Interview,
} from '@/lib/api'
import {
  buildAcceptAllCandidateFeedbackPayload,
  buildQuestionBlocksView,
  buildGenerateAllQuestionSkipEntries,
  canGenerateQuestionBlock,
  canRegenerateAnyCandidateFeedbackBlock,
  type CandidateFeedbackResponse,
  type CandidateFeedbackSkipReason,
  getSharedCandidateFeedbackError,
  getSkippedGenerateAllQuestionResults,
  hasGeneratedCandidateFeedbackBlocks,
  isAcceptAllCandidateFeedbackPayloadEmpty,
  isCandidateFeedbackEmpty,
  isCandidateFeedbackGenerating,
  isOverallBlockGenerationBusy,
  isQuestionBlockGenerationBusy,
  resolveGenerateAllOverallSkipReason,
  type GenerateAllCandidateFeedbackOutcome,
  type GenerateAllQuestionSkipEntry,
} from '@/lib/candidate-feedback'
import { getErrorMessage as getApiErrorMessage } from '@/lib/api-error'
import { runMutation } from '@/lib/run-mutation'
import { notifyError } from '@/lib/toast'
import { useCandidateFeedbackToastMessages } from '@/lib/toast-messages/use-candidate-feedback-toast-messages'

interface CandidateFeedbackEditorProps {
  interview: Interview
  initialFeedback: CandidateFeedbackResponse
}

type SavingTarget = 'overall' | 'accept-all' | `question-${number}` | null
type GeneratingTarget = 'all' | `question-${number}` | null

type GenerateAllSkipSummary = {
  questionEntries: GenerateAllQuestionSkipEntry[]
  overallReason: CandidateFeedbackSkipReason | null
}

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
  const { formatErrorMessage } = useCandidateFeedbackErrorLabel()
  const { feedback, replaceFeedback, kick, refresh, paused } =
    useCandidateFeedbackData(interview.id, initialFeedback)
  const [savingTarget, setSavingTarget] = useState<SavingTarget>(null)
  const [generatingTarget, setGeneratingTarget] = useState<GeneratingTarget>(null)
  const [generateAllSkipSummary, setGenerateAllSkipSummary] =
    useState<GenerateAllSkipSummary | null>(null)
  const skipSummaryFeedbackVersionRef = useRef<string | null>(null)

  const questionCount = interview.questions.length
  const interviewLocale = interview.interviewLocale ?? feedback.interviewLocale
  const questionBlocks = buildQuestionBlocksView(questionCount, feedback)
  const isEmpty = isCandidateFeedbackEmpty(questionCount, feedback)
  const feedbackGenerating = isCandidateFeedbackGenerating(feedback)
  const canRegenerateAny = canRegenerateAnyCandidateFeedbackBlock(
    questionCount,
    feedback,
  )
  const generateAllBusy = generatingTarget !== null || feedbackGenerating
  const isGenerateAllLocked = !canRegenerateAny && !generateAllBusy
  const generateAllDisabled = !canRegenerateAny || generateAllBusy
  const generateAllLoading = generatingTarget === 'all'
  const sharedGenerationError = getSharedCandidateFeedbackError(
    feedback,
    questionCount,
  )
  const hasGeneratedBlocks = hasGeneratedCandidateFeedbackBlocks(
    feedback,
    questionCount,
  )
  const acceptAllPageLoading = savingTarget === 'accept-all'
  const acceptAllPageDisabled =
    acceptAllPageLoading || savingTarget !== null || generateAllBusy

  useEffect(() => {
    const version = feedback.updatedAt ?? ''
    if (
      generateAllSkipSummary &&
      skipSummaryFeedbackVersionRef.current !== version
    ) {
      setGenerateAllSkipSummary(null)
    }
  }, [feedback.updatedAt, generateAllSkipSummary])

  async function applyPatchUpdate(
    mutation: () => Promise<CandidateFeedbackResponse>,
  ) {
    const updated = await mutation()
    replaceFeedback(updated)
    return updated
  }

  async function applyGenerationUpdate(
    mutation: () => Promise<
      CandidateFeedbackResponse | GenerateAllCandidateFeedbackOutcome
    >,
  ): Promise<GenerateAllCandidateFeedbackOutcome> {
    const result = await mutation()
    if ('feedback' in result) {
      replaceFeedback(result.feedback)
      kick()
      return result
    }

    replaceFeedback(result)
    kick()
    return { feedback: result }
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
    mutation: () => Promise<
      CandidateFeedbackResponse | GenerateAllCandidateFeedbackOutcome
    >,
    toast: FeedbackMutationToast,
    onSuccess?: (result: GenerateAllCandidateFeedbackOutcome) => void,
  ) {
    setGeneratingTarget(target)
    try {
      const result = await runMutation(() => applyGenerationUpdate(mutation), {
        ...toast,
        showErrorToast: false,
      })
      onSuccess?.(result)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Race before GET reflects generating; sync quietly — buttons are disabled once state catches up.
        kick()
        void refresh()
        return
      }
      notifyError(toast.errorMessage, {
        description: getApiErrorMessage(err),
      })
    } finally {
      setGeneratingTarget(null)
    }
  }

  function handleGenerateAll() {
    if (!canRegenerateAny) {
      return Promise.resolve()
    }

    skipSummaryFeedbackVersionRef.current = null
    setGenerateAllSkipSummary(null)
    return runGenerateMutation(
      'all',
      () => generateCandidateFeedbackAll(interview.id, interviewLocale),
      {
        successMessage: toastMessages.generateStartSuccess,
        errorMessage: toastMessages.generateStartError,
      },
      (result) => {
        const skipped = getSkippedGenerateAllQuestionResults(result.plan?.questions)
        const overallReason = resolveGenerateAllOverallSkipReason(
          result.plan?.overall,
        )
        if (skipped.length === 0 && !overallReason) {
          return
        }
        skipSummaryFeedbackVersionRef.current = result.feedback.updatedAt ?? ''
        setGenerateAllSkipSummary({
          questionEntries: buildGenerateAllQuestionSkipEntries(skipped),
          overallReason,
        })
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

  function handleAcceptAllPage() {
    const payload = buildAcceptAllCandidateFeedbackPayload(
      feedback,
      questionCount,
    )
    if (isAcceptAllCandidateFeedbackPayloadEmpty(payload)) {
      return Promise.resolve()
    }

    return runPatchMutation(
      'accept-all',
      () => updateCandidateFeedback(interview.id, payload, interviewLocale),
      {
        successMessage: toastMessages.applyAllSuccess,
        errorMessage: toastMessages.acceptError,
      },
    )
  }

  function handleRetryOverall() {
    if (!canGenerateQuestionBlock(feedback.overall.state)) {
      return Promise.resolve()
    }
    // POST /generate?scope=all skips locked blocks; retries overall via the same enqueue path.
    return handleGenerateAll()
  }

  function handleAcceptAllOverall(payload: {
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

  function handleAcceptAllQuestion(
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
            <CandidateFeedbackLiveRefreshNotice
              onRefresh={() => {
                skipSummaryFeedbackVersionRef.current = null
                setGenerateAllSkipSummary(null)
                void refresh()
              }}
            />
          ) : null}

          {isEmpty ? (
            <Alert>
              <AlertTitle>{t('emptyTitle')}</AlertTitle>
              <AlertDescription>{t('emptyDescription')}</AlertDescription>
            </Alert>
          ) : null}

          {sharedGenerationError ? (
            <Alert variant="danger">
              <AlertTitle>{t('sharedGenerationErrorTitle')}</AlertTitle>
              <AlertDescription>
                {formatErrorMessage(sharedGenerationError)}
              </AlertDescription>
            </Alert>
          ) : null}

          <Inline gap={2} wrap="wrap">
            <DisabledHintTooltip
              active={isGenerateAllLocked}
              hint={t('generateAllLockedHint')}
            >
              <DemoWriteGuard disabled={generateAllDisabled}>
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
            </DisabledHintTooltip>
            {hasGeneratedBlocks ? (
              <DemoWriteGuard disabled={acceptAllPageDisabled}>
                <Button
                  type="button"
                  variant="outline-pill"
                  shape="pill"
                  loading={acceptAllPageLoading}
                  onClick={() => void handleAcceptAllPage()}
                >
                  {t('acceptAllSuggestionsPage')}
                </Button>
              </DemoWriteGuard>
            ) : null}
          </Inline>

          {canRegenerateAny && generateAllSkipSummary ? (
            <CandidateFeedbackSkippedSummary
              questionEntries={generateAllSkipSummary.questionEntries}
              overallReason={generateAllSkipSummary.overallReason}
            />
          ) : null}

          <CandidateFeedbackOverallBlock
            block={feedback.overall}
            saving={
              savingTarget === 'overall' ||
              (savingTarget === 'accept-all' &&
                feedback.overall.state === 'generated')
            }
            retrying={generateAllLoading}
            retryDisabled={isOverallBlockGenerationBusy(
              feedback.overall.state,
              generatingTarget,
            )}
            sharedGenerationError={sharedGenerationError}
            onRetry={handleRetryOverall}
            onAcceptAll={handleAcceptAllOverall}
            onSave={handleSaveOverall}
          />

          {questionCount > 0 ? (
            <Stack gap={4}>
              <SectionHeading as="h3">{t('questionBlocksTitle')}</SectionHeading>
              {questionBlocks.map((block) => (
                <CandidateFeedbackQuestionBlockEditor
                  key={block.questionIndex}
                  block={block}
                  saving={
                    savingTarget === `question-${block.questionIndex}` ||
                    (savingTarget === 'accept-all' &&
                      block.state === 'generated')
                  }
                  generating={
                    generatingTarget === `question-${block.questionIndex}`
                  }
                  generationDisabled={isQuestionBlockGenerationBusy(
                    block.state,
                    block.questionIndex,
                    generatingTarget,
                  )}
                  sharedGenerationError={sharedGenerationError}
                  onGenerate={() => handleGenerateQuestion(block.questionIndex)}
                  onAcceptAll={(payload) =>
                    handleAcceptAllQuestion(block.questionIndex, payload)
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
