'use client'

import { useRef } from 'react'
import { CircleAlert, LoaderCircle, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Grid } from '@/components/ui/layout/grid'
import { HiddenFileInput } from '@/components/ui/hidden-file-input'
import { HoverGroup } from '@/components/ui/hover-group'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { StatusPill } from '@/components/ui/status-pill'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText } from '@/components/ui/text'
import { RecordingVideo } from '@/components/ui/recording-video'
import type { Answer, InterviewQuestion } from '@/lib/api'
import { formatInterviewDateTime } from '@/lib/interview-formatters'
import {
  formatAnswerDuration,
  formatFileSize,
  getAnswerStatusPill,
  getValidationTone,
} from '@/lib/interview-detail-format'
import { useSharedLabels } from '@/i18n/use-shared-labels'

import type {
  AnswerMediaState,
  QuestionUploadState,
} from '@/app/[locale]/interviews/[id]/interview-detail-types'

type CommonTranslate = ReturnType<typeof useTranslations>

function validationStatusLabel(
  tDetail: CommonTranslate,
  status?: string,
): string {
  if (!status) {
    return tDetail('validationStatus.idle')
  }
  if (
    status === 'idle' ||
    status === 'queued' ||
    status === 'processing' ||
    status === 'completed' ||
    status === 'failed'
  ) {
    return tDetail(`validationStatus.${status}`)
  }
  return status.replaceAll('_', ' ')
}

interface StatusPillsProps {
  questionIndex: number
  question: InterviewQuestion
}

function CardStatusPills({ questionIndex, question }: StatusPillsProps) {
  const t = useTranslations('questions.common')
  const sharedLabels = useSharedLabels()

  return (
    <Inline gap={2} align="center" wrap="wrap">
      <StatusPill tone="neutral">Q{questionIndex + 1}</StatusPill>
      <StatusPill tone={question.difficulty}>
        {sharedLabels.difficulty(question.difficulty)}
      </StatusPill>
      {question.category ? (
        <StatusPill tone="neutral" casing="chip">
          {question.category}
        </StatusPill>
      ) : null}
      <StatusPill tone="neutral">
        {t('weightInline', { weight: question.weight })}
      </StatusPill>
    </Inline>
  )
}

interface AnswerMetaGridProps {
  answer: Answer
  media: AnswerMediaState | undefined
}

function AnswerMetaGrid({ answer, media }: AnswerMetaGridProps) {
  const t = useTranslations('questions.common')

  return (
    <SurfaceTile rounded="xl">
      <Stack gap={3}>
        <EyebrowLabel>{t('recordedAnswer')}</EyebrowLabel>
        <BodyText size="sm">
          {t('answerDuration', {
            duration: formatAnswerDuration(
              answer.durationSeconds,
              t('notAvailable'),
            ),
            count: answer.retakeCount ?? 0,
          })}
        </BodyText>
        <BodyText size="sm">
          {t('answerMediaSizes', {
            camera: formatFileSize(
              answer.camera?.fileSizeBytes,
              t('notAvailable'),
            ),
            screen: formatFileSize(
              answer.screen?.fileSizeBytes,
              t('notAvailable'),
            ),
          })}
        </BodyText>
        <BodyText size="sm">
          {t('answerMeta', {
            status: answer.status,
            versions: answer.versions?.length ?? 1,
          })}
        </BodyText>
        <BodyText size="sm">
          {t('uploaded')} {formatInterviewDateTime(answer.uploadedAt)}
        </BodyText>
        {media?.loading ? (
          <Inline gap={2} align="center">
            <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
            <BodyText size="sm">{t('loadingMedia')}</BodyText>
          </Inline>
        ) : null}
        {media?.errorMessage ? (
          <BodyText size="sm" tone="danger">
            {media.errorMessage}
          </BodyText>
        ) : null}
      </Stack>
    </SurfaceTile>
  )
}

interface BehaviorSignalsGridProps {
  answer: Answer
}

function BehaviorSignalsGrid({ answer }: BehaviorSignalsGridProps) {
  const t = useTranslations('questions.common')

  return (
    <SurfaceTile rounded="xl">
      <Stack gap={3}>
        <EyebrowLabel>{t('validationStatus')}</EyebrowLabel>
        <BodyText size="sm">
          {t('hiddenTabs')} {answer.behaviorSignals?.tabHiddenCount ?? 0} •{' '}
          {t('blur')} {answer.behaviorSignals?.windowBlurCount ?? 0} •{' '}
          {t('copy')} {answer.behaviorSignals?.copyCount ?? 0} • {t('paste')}{' '}
          {answer.behaviorSignals?.pasteCount ?? 0}
        </BodyText>
        <BodyText size="sm">
          {t('keydown')} {answer.behaviorSignals?.keydownCount ?? 0} •{' '}
          {t('resize')} {answer.behaviorSignals?.resizeCount ?? 0}
        </BodyText>
        <BodyText size="sm">
          {t('transcript')}{' '}
          {answer.transcript?.text ? t('ready') : t('pending')} •{' '}
          {t('evaluation')}{' '}
          {answer.evaluation?.overallScore !== undefined
            ? t('ready')
            : t('pending')}
        </BodyText>
        {answer.validation?.errorMessage ? (
          <BodyText size="sm" tone="danger">
            {answer.validation.errorMessage}
          </BodyText>
        ) : null}
      </Stack>
    </SurfaceTile>
  )
}

interface EvaluationGridProps {
  evaluation: NonNullable<Answer['evaluation']>
}

function EvaluationGrid({ evaluation }: EvaluationGridProps) {
  const t = useTranslations('questions.common')

  return (
    <Grid columns="metrics-2-md" gap={4}>
      <SurfaceTile rounded="xl">
        <Stack gap={3}>
          <EyebrowLabel>{t('shortResult')}</EyebrowLabel>
          <Inline gap={2} align="center" wrap="wrap">
            {evaluation.overallScore !== undefined ? (
              <StatusPill tone="neutral">
                {t('scorePrefix')} {evaluation.overallScore}
              </StatusPill>
            ) : null}
            {evaluation.decisionHint ? (
              <StatusPill tone="neutral">{evaluation.decisionHint}</StatusPill>
            ) : null}
            {evaluation.behaviorRisk ? (
              <StatusPill tone="neutral">
                {t('riskPrefix')} {evaluation.behaviorRisk}
              </StatusPill>
            ) : null}
          </Inline>
          <BodyText size="sm">
            {evaluation.summary ?? t('summaryUnavailable')}
          </BodyText>
          {evaluation.categoryScores &&
          Object.keys(evaluation.categoryScores).length > 0 ? (
            <BodyText size="sm">
              {Object.entries(evaluation.categoryScores)
                .map(([category, score]) => `${category}: ${score}`)
                .join(' • ')}
            </BodyText>
          ) : null}
        </Stack>
      </SurfaceTile>
      <SurfaceTile rounded="xl">
        <Stack gap={3}>
          <EyebrowLabel>{t('detailedRubric')}</EyebrowLabel>
          <BodyText size="sm">
            {t('covered')}:{' '}
            {evaluation.coveredConceptIds?.length
              ? evaluation.coveredConceptIds.join(', ')
              : t('none')}
          </BodyText>
          <BodyText size="sm">
            {t('missed')}:{' '}
            {evaluation.missedConceptIds?.length
              ? evaluation.missedConceptIds.join(', ')
              : t('none')}
          </BodyText>
          <BodyText size="sm">
            {t('redFlags')}:{' '}
            {evaluation.redFlagIds?.length
              ? evaluation.redFlagIds.join(', ')
              : t('none')}
          </BodyText>
        </Stack>
      </SurfaceTile>
    </Grid>
  )
}

interface AnswerMediaPanelsProps {
  media: AnswerMediaState
}

function AnswerMediaPanels({ media }: AnswerMediaPanelsProps) {
  const t = useTranslations('questions.common')

  return (
    <Grid columns="metrics-2-md" gap={4}>
      {media.cameraUrl ? (
        <SurfaceTile rounded="xl">
          <Stack gap={3}>
            <EyebrowLabel>{t('candidateCamera')}</EyebrowLabel>
            <RecordingVideo src={media.cameraUrl} density="compact" />
          </Stack>
        </SurfaceTile>
      ) : null}
      {media.screenUrl ? (
        <SurfaceTile rounded="xl">
          <Stack gap={3}>
            <EyebrowLabel>{t('candidateScreen')}</EyebrowLabel>
            <RecordingVideo src={media.screenUrl} density="compact" />
          </Stack>
        </SurfaceTile>
      ) : null}
    </Grid>
  )
}

interface ConceptsGridProps {
  question: InterviewQuestion
}

function ConceptsGrid({ question }: ConceptsGridProps) {
  const t = useTranslations('questions.common')

  return (
    <Grid columns="metrics-2-md" gap={4}>
      <SurfaceTile rounded="xl">
        <Stack gap={3}>
          <EyebrowLabel>{t('expectedConcepts')}</EyebrowLabel>
          <BodyText size="sm">
            {question.expectedConcepts.length > 0
              ? question.expectedConcepts.map((item) => item.label).join(', ')
              : t('notSpecified')}
          </BodyText>
        </Stack>
      </SurfaceTile>
      <SurfaceTile rounded="xl">
        <Stack gap={3}>
          <EyebrowLabel>{t('redFlags')}</EyebrowLabel>
          <BodyText size="sm">
            {question.redFlags.length > 0
              ? question.redFlags.map((item) => item.label).join(', ')
              : t('notSpecified')}
          </BodyText>
        </Stack>
      </SurfaceTile>
    </Grid>
  )
}

export interface AnswerPacketCardProps {
  question: InterviewQuestion
  questionIndex: number
  answer: Answer | undefined
  uploadState: QuestionUploadState
  media: AnswerMediaState | undefined
  isTerminal: boolean
  hasActiveValidation: boolean
  validating: boolean
  onUpload: (questionIndex: number, fileInput: HTMLInputElement | null) => void
}

export function AnswerPacketCard({
  question,
  questionIndex,
  answer,
  uploadState,
  media,
  isTerminal,
  hasActiveValidation,
  validating,
  onUpload,
}: AnswerPacketCardProps) {
  const t = useTranslations('questions.common')
  const tDetail = useTranslations('interviews.detail')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const statusPill = getAnswerStatusPill(answer, uploadState)

  return (
    <HoverGroup>
      <Card variant="surface" interaction="hover">
        <CardHeader spacing="md">
          <Inline gap={4} align="start" justify="between" wrap="wrap">
            <Stack gap={3}>
              <CardStatusPills
                questionIndex={questionIndex}
                question={question}
              />
              <CardTitle size="md" width="xl">
                {question.questionText}
              </CardTitle>
            </Stack>

            <Stack gap={2} align="end">
              <StatusPill tone={statusPill.tone}>
                {t(statusPill.labelKey)}
              </StatusPill>
              {answer?.validation ? (
                <StatusPill tone={getValidationTone(answer.validation.status)}>
                  {validationStatusLabel(tDetail, answer.validation.status)}
                </StatusPill>
              ) : null}

              {!isTerminal && !hasActiveValidation && !validating ? (
                <>
                  <HiddenFileInput
                    accept="video/*,audio/*"
                    ref={fileInputRef}
                    onChange={() => onUpload(questionIndex, fileInputRef.current)}
                  />
                  <DemoWriteGuard>
                    <Button
                      type="button"
                      variant={
                        uploadState.status === 'error'
                          ? 'destructive'
                          : 'outline-pill'
                      }
                      shape="pill"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="size-4" />
                      {uploadState.status === 'error'
                        ? t('retryUpload')
                        : t('uploadManualHint')}
                    </Button>
                  </DemoWriteGuard>
                </>
              ) : null}
            </Stack>
          </Inline>
        </CardHeader>
        <CardContent spacing="md">
          {answer ? (
            <Grid columns="metrics-2-md" gap={4}>
              <AnswerMetaGrid answer={answer} media={media} />
              <BehaviorSignalsGrid answer={answer} />
            </Grid>
          ) : null}

          {answer?.evaluation ? (
            <EvaluationGrid evaluation={answer.evaluation} />
          ) : null}

          {answer?.transcript?.text ? (
            <SurfaceTile rounded="xl">
              <Stack gap={3}>
                <EyebrowLabel>{t('fullResult')}</EyebrowLabel>
                <BodyText size="sm">{answer.transcript.text}</BodyText>
              </Stack>
            </SurfaceTile>
          ) : null}

          {media?.cameraUrl || media?.screenUrl ? (
            <AnswerMediaPanels media={media} />
          ) : null}

          <ConceptsGrid question={question} />

          {uploadState.status === 'error' && uploadState.errorMessage ? (
            <Alert variant="danger">
              <CircleAlert className="size-4" />
              <AlertTitle>{t('uploadErrorTitle')}</AlertTitle>
              <AlertDescription>{uploadState.errorMessage}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </HoverGroup>
  )
}
