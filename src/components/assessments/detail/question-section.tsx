'use client'

import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BehaviorSignalStat } from '@/components/ui/behavior-signal-stat'
import { ConceptList } from '@/components/ui/concept-list'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { MetricPanel } from '@/components/ui/metric-panel'
import { PillRow } from '@/components/ui/pill-row'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { TranscriptBlock } from '@/components/ui/transcript-block'
import { LazyMediaPlayback } from '@/components/assessments/detail/lazy-media-playback'
import { RerunAnswerButton } from '@/components/assessments/detail/rerun-answer-button'
import {
  type Answer,
  type AnswerDecisionHint,
  type InterviewQuestion,
} from '@/lib/api'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { behaviorRiskTone } from '@/lib/assessment-status'

interface QuestionSectionProps {
  interviewId: string
  questionIndex: number
  question: InterviewQuestion
  answer: Answer | undefined
  canRerun: boolean
}

function decisionHintTone(hint: AnswerDecisionHint | undefined) {
  if (hint === 'pass') return 'completed' as const
  if (hint === 'fail') return 'failed' as const
  if (hint === 'review') return 'pending' as const
  return 'neutral' as const
}

function answerStateTone(answer: Answer | undefined) {
  if (!answer) return 'pending' as const
  if (answer.validation?.status === 'failed') return 'failed' as const
  if (
    answer.validation?.status === 'queued' ||
    answer.validation?.status === 'processing'
  ) {
    return 'processing' as const
  }
  if (answer.evaluation?.overallScore !== undefined) return 'completed' as const
  return 'in_progress' as const
}

export function QuestionSection({
  interviewId,
  questionIndex,
  question,
  answer,
  canRerun,
}: QuestionSectionProps) {
  const t = useTranslations('assessments.question')
  const sharedLabels = useSharedLabels()

  function decisionHintLabel(hint: AnswerDecisionHint | undefined) {
    if (hint === 'pass') return t('decisionPass')
    if (hint === 'fail') return t('decisionFail')
    if (hint === 'review') return t('decisionReview')
    return t('decisionNone')
  }

  function answerStateLabel(answer: Answer | undefined) {
    if (!answer) return t('noAnswerSubmitted')
    if (answer.validation?.status === 'failed') return t('scoringFailed')
    if (
      answer.validation?.status === 'queued' ||
      answer.validation?.status === 'processing'
    ) {
      return t('scoringInProgress')
    }
    if (answer.evaluation?.overallScore !== undefined) return t('scored')
    return t('awaitingEvaluation')
  }

  const evaluation = answer?.evaluation
  const signals = answer?.behaviorSignals
  const hasCamera = Boolean(answer?.mediaKey || answer?.camera?.mediaKey)
  const hasScreen = Boolean(
    answer?.screenMediaKey || answer?.screen?.mediaKey,
  )
  const stateTone = answerStateTone(answer)
  const stateLabel = answerStateLabel(answer)
  const conceptIdToLabel = new Map(
    question.expectedConcepts.map((concept) => [concept.id, concept.label]),
  )
  const redFlagIdToLabel = new Map(
    question.redFlags.map((flag) => [flag.id, flag.label]),
  )
  const coveredLabels = (evaluation?.coveredConceptIds ?? []).map(
    (id) => conceptIdToLabel.get(id) ?? id,
  )
  const missedLabels = (evaluation?.missedConceptIds ?? []).map(
    (id) => conceptIdToLabel.get(id) ?? id,
  )
  const redFlagLabels = (evaluation?.redFlagIds ?? []).map(
    (id) => redFlagIdToLabel.get(id) ?? id,
  )

  return (
    <Card variant="surface" size="md">
      <CardHeader spacing="md">
        <Stack gap={3}>
          <PillRow>
            <StatusPill tone="neutral" casing="chip">
              {t('questionBadge', { n: questionIndex + 1 })}
            </StatusPill>
            <StatusPill tone={question.difficulty} casing="chip">
              {sharedLabels.difficulty(question.difficulty)}
            </StatusPill>
            {question.category ? (
              <StatusPill tone="neutral" casing="chip">
                {question.category}
              </StatusPill>
            ) : null}
            <StatusPill tone={stateTone} casing="chip">
              {stateLabel}
            </StatusPill>
          </PillRow>
          <CardTitle size="md" width="xl">
            {question.questionText}
          </CardTitle>
        </Stack>
      </CardHeader>

      <CardContent spacing="xl">
        <Stack gap={5}>
          <Stack gap={3}>
            <EyebrowLabel size="sm">{t('transcriptEyebrow')}</EyebrowLabel>
            <TranscriptBlock
              text={answer?.transcript?.text}
              emptyLabel={
                answer ? t('transcriptPending') : t('noAnswer')
              }
            />
          </Stack>

          <LazyMediaPlayback
            interviewId={interviewId}
            questionIndex={questionIndex}
            hasCamera={hasCamera}
            hasScreen={hasScreen}
          />

          {signals ? (
            <Stack gap={3}>
              <EyebrowLabel size="sm">{t('behaviorSignals')}</EyebrowLabel>
              <Grid columns="metrics-5" gap={3}>
                <BehaviorSignalStat
                  label={t('tabHidden')}
                  value={signals.tabHiddenCount}
                  watchAt={1}
                  riskAt={3}
                />
                <BehaviorSignalStat
                  label={t('windowBlur')}
                  value={signals.windowBlurCount}
                  watchAt={2}
                  riskAt={5}
                />
                <BehaviorSignalStat
                  label={t('paste')}
                  value={signals.pasteCount}
                  watchAt={1}
                  riskAt={3}
                />
                <BehaviorSignalStat
                  label={t('keydown')}
                  value={signals.keydownCount}
                />
                <BehaviorSignalStat
                  label={t('resize')}
                  value={signals.resizeCount}
                  watchAt={2}
                  riskAt={5}
                />
              </Grid>
            </Stack>
          ) : null}

          {evaluation ? (
            <Stack gap={4}>
              <Inline gap={3} align="center" justify="between" wrap="wrap">
                <SectionHeading size="sm">{t('aiEvaluation')}</SectionHeading>
                <Inline gap={2} wrap="wrap">
                  <StatusPill
                    tone={decisionHintTone(evaluation.decisionHint)}
                    casing="chip"
                  >
                    {decisionHintLabel(evaluation.decisionHint)}
                  </StatusPill>
                  {evaluation.behaviorRisk ? (
                    <StatusPill
                      tone={behaviorRiskTone(evaluation.behaviorRisk)}
                      casing="chip"
                    >
                      {t('behaviorRiskPrefix')}{' '}
                      {sharedLabels.behaviorRisk(evaluation.behaviorRisk)}
                    </StatusPill>
                  ) : null}
                </Inline>
              </Inline>

              <Grid columns={3} gap={3}>
                <MetricPanel
                  tone="compact"
                  label={t('score')}
                  value={
                    evaluation.overallScore !== undefined
                      ? Math.round(evaluation.overallScore)
                      : '—'
                  }
                  valueSize="md"
                  valueTone="primary"
                  description={t('outOf100')}
                />
                <MetricPanel
                  tone="compact"
                  label={t('conceptsCovered')}
                  value={evaluation.coveredConceptIds?.length ?? 0}
                  valueSize="md"
                />
                <MetricPanel
                  tone="compact"
                  label={t('conceptsMissed')}
                  value={evaluation.missedConceptIds?.length ?? 0}
                  valueSize="md"
                />
              </Grid>

              {evaluation.summary ? (
                <BodyText size="sm" tone="foreground">
                  {evaluation.summary}
                </BodyText>
              ) : null}

              <Grid columns={2} gap={4}>
                <ConceptList
                  label={t('coveredConcepts')}
                  tone="covered"
                  items={coveredLabels}
                />
                <ConceptList
                  label={t('missedConcepts')}
                  tone="missed"
                  items={missedLabels}
                />
              </Grid>

              {redFlagLabels.length > 0 ? (
                <ConceptList
                  label={t('redFlagsRaised')}
                  tone="flag"
                  items={redFlagLabels}
                />
              ) : null}
            </Stack>
          ) : (
            <BodyText size="sm" tone="muted" italic>
              {t('noEvaluationYet')}
            </BodyText>
          )}

          {answer?.validation?.errorMessage ? (
            <Alert variant="danger">
              <AlertTitle>{t('scoringFailedTitle')}</AlertTitle>
              <AlertDescription>
                {answer.validation.errorMessage}
              </AlertDescription>
            </Alert>
          ) : null}

          {canRerun && answer ? (
            <Inline justify="end">
              <RerunAnswerButton
                interviewId={interviewId}
                questionIndex={questionIndex}
                disabled={
                  answer.validation?.status === 'queued' ||
                  answer.validation?.status === 'processing'
                }
              />
            </Inline>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}
