import { unstable_noStore as noStore } from 'next/cache'

import { DetailHeader } from '@/components/assessments/detail/detail-header'
import { EvaluationProgressBanner } from '@/components/assessments/detail/evaluation-progress-banner'
import { OverallPanel } from '@/components/assessments/detail/overall-panel'
import { QuestionSection } from '@/components/assessments/detail/question-section'
import { RerunAllButton } from '@/components/assessments/detail/rerun-all-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { ForbiddenAccessPage } from '@/components/ui/forbidden-access-page'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { SectionHeading } from '@/components/ui/text'
import { type Interview, type MeResponse } from '@/lib/api'
import { deriveReviewStatus } from '@/lib/assessment-status'
import { canReviewAssessments } from '@/lib/auth-roles'
import {
  getServerRequestContext,
  isForbiddenError,
  requestServer,
} from '@/lib/server-fetch'

interface AssessmentDetailPageProps {
  params: Promise<{ id: string }>
}

const FORBIDDEN_TITLE = "You don't have access to this assessment"
const FORBIDDEN_DESCRIPTION =
  'This area is reserved for HR and admin reviewers. If you think this is a mistake, contact your workspace owner.'

export default async function AssessmentDetailPage({
  params,
}: AssessmentDetailPageProps) {
  noStore()

  const { id } = await params

  let me: MeResponse | null = null
  let ctx: Awaited<ReturnType<typeof getServerRequestContext>> | null = null
  try {
    ctx = await getServerRequestContext()
    me = (await requestServer<MeResponse>('/auth/me', ctx)) ?? null
  } catch {
    me = null
  }

  if (!ctx || !me || !canReviewAssessments(me.role)) {
    return (
      <ForbiddenAccessPage
        title={FORBIDDEN_TITLE}
        description={FORBIDDEN_DESCRIPTION}
      />
    )
  }

  const encodedId = encodeURIComponent(id)
  let interview: Interview | null = null
  let error: string | null = null

  try {
    interview =
      (await requestServer<Interview>(`/interviews/${encodedId}`, ctx)) ?? null
  } catch (err) {
    if (isForbiddenError(err)) {
      return (
        <ForbiddenAccessPage
          title={FORBIDDEN_TITLE}
          description={FORBIDDEN_DESCRIPTION}
        />
      )
    }
    error = err instanceof Error ? err.message : 'Failed to load assessment.'
  }

  if (error || !interview) {
    return (
      <PageShell spacing="tight">
        <Alert variant="danger">
          <AlertTitle>Assessment unavailable</AlertTitle>
          <AlertDescription>
            {error ?? 'The requested assessment could not be loaded.'}
          </AlertDescription>
        </Alert>
      </PageShell>
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

  const questionsWithAnswers = interview.questions.map((question, index) => ({
    question,
    questionIndex: index,
    answer: interview.answers.find((a) => a.questionIndex === index),
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
