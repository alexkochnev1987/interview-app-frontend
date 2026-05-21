import { unstable_noStore as noStore } from 'next/cache'

import { DetailHeader } from '@/components/assessments/detail/detail-header'
import { EvaluationProgressBanner } from '@/components/assessments/detail/evaluation-progress-banner'
import { OverallPanel } from '@/components/assessments/detail/overall-panel'
import { QuestionSection } from '@/components/assessments/detail/question-section'
import { RerunAllButton } from '@/components/assessments/detail/rerun-all-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FlashErrorPageFallback } from '@/components/ui/flash-error-page-fallback'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { SectionHeading } from '@/components/ui/text'
import { type Interview } from '@/lib/api'
import { deriveReviewStatus } from '@/lib/assessment-status'
import {
  loadAuthGate,
  redirectIfUnauthenticated,
  redirectIfUnauthorizedError,
} from '@/lib/auth-gate'
import { canReviewAssessments } from '@/lib/auth-roles'
import { isForbiddenError, requestServer } from '@/lib/server-fetch'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

interface AssessmentDetailPageProps {
  params: Promise<{ id: string }>
}

const FORBIDDEN_TITLE = "You don't have access to this assessment"
const FORBIDDEN_DESCRIPTION =
  'This area is reserved for HR and admin reviewers. If you think this is a mistake, contact your workspace owner.'

const UNAVAILABLE_TITLE = TOAST_MESSAGES.pageGate.assessments.unavailableTitle

export default async function AssessmentDetailPage({
  params,
}: AssessmentDetailPageProps) {
  noStore()

  const { id } = await params

  const returnPath = `/assessments/${encodeURIComponent(id)}`
  const auth = await loadAuthGate(canReviewAssessments)
  redirectIfUnauthenticated(auth, returnPath)
  if (auth.kind === 'forbidden') {
    return (
      <ForbiddenAccessPage
        title={FORBIDDEN_TITLE}
        description={FORBIDDEN_DESCRIPTION}
      />
    )
  }
  if (auth.kind === 'error') {
    return (
      <FlashErrorPageFallback
        title="This assessment is unavailable right now"
        description={`We could not verify your session or permissions. ${auth.message}`}
        backHref="/assessments"
        backLabel="Back to assessments"
      />
    )
  }

  const encodedId = encodeURIComponent(id)
  let interview: Interview | null = null
  let error: string | null = null

  try {
    interview =
      (await requestServer<Interview>(`/interviews/${encodedId}`, auth.ctx)) ??
      null
  } catch (err) {
    redirectIfUnauthorizedError(err, returnPath)
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={FORBIDDEN_TITLE}
          description={FORBIDDEN_DESCRIPTION}
        />
      )
    }
    error =
      err instanceof Error
        ? err.message
        : TOAST_MESSAGES.pageGate.assessments.loadDetailFallback
  }

  if (error || !interview) {
    return (
      <FlashErrorPageFallback
        title={UNAVAILABLE_TITLE}
        description={
          error ?? TOAST_MESSAGES.pageGate.assessments.notFoundFallback
        }
        backHref="/assessments"
        backLabel="Back to assessments"
      />
    )
  }

  const reviewStatus = deriveReviewStatus(interview)
  const validationInFlight = interview.answers.some(
    (a) =>
      a.validation?.status === 'queued' || a.validation?.status === 'processing',
  )
  const isFailed = reviewStatus === 'failed'
  const canRerun = reviewStatus !== 'pending' && reviewStatus !== 'in_progress'
  const interviewId = interview.id

  const answersByIndex = new Map(
    interview.answers.map((a) => [a.questionIndex, a]),
  )
  const questionsWithAnswers = interview.questions.map((question, index) => ({
    question,
    questionIndex: index,
    answer: answersByIndex.get(index),
  }))

  return (
    <PageShell>
      <DetailHeader interview={interview} />

      <EvaluationProgressBanner interview={interview} />

      {isFailed ? (
        <Alert variant="danger">
          <AlertTitle>This interview failed to complete</AlertTitle>
          <AlertDescription>
            The take ended in a failed state. Some answers, transcripts, or
            evaluations may be missing. You can re-run AI evaluation for any
            answer that does have a transcript below.
          </AlertDescription>
        </Alert>
      ) : null}

      <Section gap={4}>
        <Inline gap={4} align="end" justify="between" wrap="wrap">
          <Stack gap={2}>
            <EyebrowLabel size="lg">Per-question review</EyebrowLabel>
            <SectionHeading>Questions and answers</SectionHeading>
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

      {interview.result ? (
        <Section gap={4}>
          <Stack gap={2}>
            <EyebrowLabel size="lg">Scorecard</EyebrowLabel>
            <SectionHeading>Overall result</SectionHeading>
          </Stack>
          <OverallPanel result={interview.result} />
        </Section>
      ) : null}
    </PageShell>
  )
}
