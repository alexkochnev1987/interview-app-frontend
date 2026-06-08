'use client'

import { useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { EvaluationActionsProvider } from '@/components/assessments/actions/evaluation-actions-context'
import { RerunAllButton } from '@/components/assessments/actions/rerun-all-button'
import { StartEvaluationButton } from '@/components/assessments/actions/start-evaluation-button'
import { DetailHeader } from '@/components/assessments/detail/detail-header'
import { EvaluationStatusBanner } from '@/components/assessments/detail/evaluation-status-banner'
import { OverallPanel } from '@/components/assessments/detail/overall-panel'
import { QuestionSection } from '@/components/assessments/detail/question-section'
import { LiveRefreshNotice } from '@/components/assessments/live-refresh-notice'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { getInterview, type Interview } from '@/lib/api'
import {
  canRerunReview,
  deriveReviewStatus,
  isScoring,
  isValidationInFlight,
} from '@/lib/assessment-status'
import { useLivePolling } from '@/lib/use-live-polling'

interface AssessmentDetailContentProps {
  initialInterview: Interview
}

export function AssessmentDetailContent({
  initialInterview,
}: AssessmentDetailContentProps) {
  const tAssessments = useTranslations('assessments')
  const interviewId = initialInterview.id

  const fetcher = useCallback(() => getInterview(interviewId), [interviewId])
  const { data: interview, refresh, kick, paused } = useLivePolling(
    initialInterview,
    fetcher,
    isScoring,
  )

  const onEvaluationStarted = useCallback(() => {
    kick()
    void refresh()
  }, [kick, refresh])

  const reviewStatus = deriveReviewStatus(interview)
  const validationInFlight = isValidationInFlight(interview)
  const isFailed = reviewStatus === 'failed'
  const isReadyToScore = reviewStatus === 'ready_to_score'
  const canRerun = canRerunReview(reviewStatus)

  const answersByIndex = new Map(
    interview.answers.map((a) => [a.questionIndex, a]),
  )
  const questionsWithAnswers = interview.questions.map((question, index) => ({
    question,
    questionIndex: index,
    answer: answersByIndex.get(index),
  }))

  return (
    <EvaluationActionsProvider onEvaluationStarted={onEvaluationStarted}>
      <DetailHeader interview={interview} />

      {!isReadyToScore ? <EvaluationStatusBanner interview={interview} /> : null}

      {paused ? <LiveRefreshNotice onRefresh={refresh} /> : null}

      {isReadyToScore ? (
        <Card variant="floating" size="lg" accent="primary">
          <CardContent spacing="lg">
            <Inline gap={4} align="center" justify="between" wrap="wrap">
              <Inline gap={4} align="center">
                <Icon size="lg" tone="primary">
                  <Sparkles />
                </Icon>
                <Stack gap={1.5}>
                  <SectionHeading>
                    {tAssessments('detail.readyTitle')}
                  </SectionHeading>
                  <BodyText size="sm">
                    {tAssessments('detail.readyDescription')}
                  </BodyText>
                </Stack>
              </Inline>
              <StartEvaluationButton interviewId={interviewId} size="lg" />
            </Inline>
          </CardContent>
        </Card>
      ) : null}

      {isFailed ? (
        <Alert variant="danger">
          <AlertTitle>{tAssessments('detail.failedTitle')}</AlertTitle>
          <AlertDescription>
            {tAssessments('detail.failedDescription')}
          </AlertDescription>
        </Alert>
      ) : null}

      {interview.result ? (
        <Section gap={4}>
          <Stack gap={2}>
            <EyebrowLabel size="lg">
              {tAssessments('detail.scorecardEyebrow')}
            </EyebrowLabel>
            <SectionHeading>
              {tAssessments('detail.scorecardHeading')}
            </SectionHeading>
          </Stack>
          <OverallPanel result={interview.result} />
        </Section>
      ) : null}

      <Section gap={4}>
        <Inline gap={4} align="end" justify="between" wrap="wrap">
          <Stack gap={2}>
            <EyebrowLabel size="lg">
              {tAssessments('detail.perQuestionEyebrow')}
            </EyebrowLabel>
            <SectionHeading>
              {tAssessments('detail.perQuestionHeading')}
            </SectionHeading>
          </Stack>
          {canRerun ? (
            <RerunAllButton
              interviewId={interviewId}
              size="sm"
              disabled={validationInFlight}
            />
          ) : null}
        </Inline>

        <Stack gap={4}>
          {questionsWithAnswers.map(({ question, questionIndex, answer }) => (
            <QuestionSection
              key={question.id}
              interviewId={interviewId}
              questionIndex={questionIndex}
              question={question}
              answer={answer}
              canRerun={canRerun}
            />
          ))}
        </Stack>
      </Section>
    </EvaluationActionsProvider>
  )
}
