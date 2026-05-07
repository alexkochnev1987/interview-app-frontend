'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  ClipboardList,
  Copy,
  Sparkles,
  Workflow,
} from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { IconLabel } from '@/components/ui/icon-label'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { MetricPanel } from '@/components/ui/metric-panel'
import { PillRow } from '@/components/ui/pill-row'
import { StatusPill } from '@/components/ui/status-pill'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { generateCandidateLink, type Interview } from '@/lib/api'
import {
  formatInterviewDate,
  formatInterviewStatusLabel,
  getCandidateInitials,
} from '@/lib/interview-formatters'
import { runMutation } from '@/lib/run-mutation'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

interface InterviewDetailClientProps {
  initialInterview: Interview
}

type CandidateLinkStatus = 'idle' | 'loading' | 'ready' | 'error'
type CopyStatus = 'idle' | 'copied' | 'error'

const REVIEWABLE_STATUSES: ReadonlySet<Interview['status']> = new Set<
  Interview['status']
>(['processing', 'completed', 'failed'])

function formatWorkflowStage(stage?: string) {
  if (!stage) return 'idle'
  return stage.replaceAll('_', ' ')
}

function formatCandidateLinkPreview(candidateLink: string) {
  if (!candidateLink) return ''

  try {
    const url = new URL(candidateLink)
    const token = url.searchParams.get('token')
    const shortToken = token
      ? `${token.slice(0, 12)}...${token.slice(-8)}`
      : null

    return `${url.origin}${url.pathname}${shortToken ? `?token=${shortToken}` : ''}`
  } catch {
    if (candidateLink.length <= 96) return candidateLink
    return `${candidateLink.slice(0, 72)}...${candidateLink.slice(-20)}`
  }
}

export default function InterviewDetailClient({
  initialInterview,
}: InterviewDetailClientProps) {
  const interview = initialInterview
  const id = interview.id

  const [candidateLink, setCandidateLink] = useState('')
  const [candidateLinkStatus, setCandidateLinkStatus] =
    useState<CandidateLinkStatus>('idle')
  const [candidateLinkError, setCandidateLinkError] = useState('')
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')

  const buildCandidateUrl = useCallback((relativeLink: string) => {
    if (typeof window === 'undefined') return relativeLink
    return new URL(relativeLink, window.location.origin).toString()
  }, [])

  const loadCandidateLink = useCallback(
    async (mode: 'initial' | 'refresh' = 'refresh') => {
      try {
        setCandidateLinkStatus('loading')
        setCandidateLinkError('')
        const data = await runMutation(() => generateCandidateLink(id), {
          showSuccessToast: mode === 'refresh',
          showErrorToast: mode === 'refresh',
          successMessage: TOAST_MESSAGES.interview.refreshLinkSuccess,
          errorMessage: TOAST_MESSAGES.interview.refreshLinkError,
        })
        setCandidateLink(buildCandidateUrl(data.candidateLink))
        setCandidateLinkStatus('ready')
        if (mode === 'refresh') setCopyStatus('idle')
      } catch (err) {
        setCandidateLink('')
        setCandidateLinkStatus('error')
        setCandidateLinkError(
          err instanceof Error
            ? err.message
            : 'Failed to generate candidate link.',
        )
      }
    },
    [buildCandidateUrl, id],
  )

  useEffect(() => {
    const handle = setTimeout(() => {
      void loadCandidateLink('initial')
    }, 0)
    return () => clearTimeout(handle)
  }, [loadCandidateLink])

  async function handleCopyCandidateLink() {
    if (!candidateLink) return
    try {
      await navigator.clipboard.writeText(candidateLink)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  const totalQuestions = interview.questions.length
  const submittedCount = interview.answers.filter(
    (answer) => answer.status === 'submitted',
  ).length
  const answersByIndex = new Map(
    interview.answers.map((a) => [a.questionIndex, a]),
  )
  const candidateLinkPreview = formatCandidateLinkPreview(candidateLink)
  const showReviewCta = REVIEWABLE_STATUSES.has(interview.status)

  return (
    <PageShell>
      <Grid as="section" columns="split-115-85" gap={6}>
        <Card variant="floating" size="lg">
          <CardContent spacing="2xl">
            <Inline gap={4} align="start" justify="between" wrap="wrap">
              <Stack gap={4}>
                <UnstyledLink href="/">
                  <EyebrowBadge
                    tone="default"
                    icon={
                      <Icon size="sm">
                        <ArrowLeft />
                      </Icon>
                    }
                  >
                    Back to dashboard
                  </EyebrowBadge>
                </UnstyledLink>

                <Inline gap={4} align="center">
                  <IconBadge tone="primary" size="lg" textSize="lg">
                    {getCandidateInitials(interview.candidateName)}
                  </IconBadge>
                  <Stack gap={1.5}>
                    <HeroTitle>{interview.candidateName}</HeroTitle>
                    <HeroLead>{interview.position}</HeroLead>
                  </Stack>
                </Inline>

                <Inline gap={3} align="center" wrap="wrap">
                  <StatusPill tone={interview.status}>
                    {formatInterviewStatusLabel(interview.status)}
                  </StatusPill>
                  <StatusPill tone="neutral">
                    Created {formatInterviewDate(interview.createdAt)}
                  </StatusPill>
                </Inline>
              </Stack>

              {showReviewCta ? (
                <Button asChild variant="gradient">
                  <UnstyledLink href={`/assessments/${interview.id}`}>
                    <Icon size="md">
                      <ClipboardList />
                    </Icon>
                    Review assessment
                  </UnstyledLink>
                </Button>
              ) : null}
            </Inline>

            <Grid columns="metrics-2-md" gap={4}>
              <MetricPanel
                label="Questions"
                value={totalQuestions}
                valueSize="lg"
              />
              <MetricPanel
                label="Submitted"
                value={submittedCount}
                valueSize="lg"
              />
            </Grid>
          </CardContent>
        </Card>

        <Card variant="tinted">
          <CardHeader spacing="sm">
            <EyebrowBadge
              icon={
                <Icon size="sm">
                  <Sparkles />
                </Icon>
              }
              tone="muted"
            >
              Candidate access
            </EyebrowBadge>
            <CardTitle size="lg">Interview link</CardTitle>
            <CardDescription>
              Share this link with the candidate to start the recording flow
              without recruiter sign-in.
            </CardDescription>
          </CardHeader>
          <CardContent spacing="xl">
            <SurfaceTile tone="glass" padding="lg">
              <Stack gap={3}>
                <Inline gap={3} align="center" justify="between" wrap="wrap">
                  <BodyText as="span" size="sm-tight" tone="foreground">
                    Candidate link
                  </BodyText>
                  <Inline gap={2} wrap="wrap">
                    <Button
                      type="button"
                      variant="outline-pill"
                      shape="pill"
                      size="sm"
                      onClick={() => void loadCandidateLink('refresh')}
                      disabled={candidateLinkStatus === 'loading'}
                    >
                      {candidateLinkStatus === 'loading'
                        ? 'Generating...'
                        : 'Refresh link'}
                    </Button>
                    <Button
                      type="button"
                      variant="gradient"
                      size="sm"
                      onClick={handleCopyCandidateLink}
                      disabled={
                        candidateLinkStatus !== 'ready' || !candidateLink
                      }
                    >
                      <Icon size="md">
                        <Copy />
                      </Icon>
                      {copyStatus === 'copied'
                        ? 'Copied'
                        : copyStatus === 'error'
                          ? 'Copy failed'
                          : 'Copy link'}
                    </Button>
                  </Inline>
                </Inline>

                <BodyText size="sm">
                  {candidateLinkStatus === 'loading'
                    ? 'Generating a fresh candidate link...'
                    : candidateLinkStatus === 'error'
                      ? candidateLinkError
                      : candidateLinkPreview ||
                        'Candidate link is not available yet.'}
                </BodyText>
                {candidateLinkStatus === 'ready' && candidateLink ? (
                  <BodyText size="xs" title={candidateLink}>
                    Showing a shortened preview here. &quot;Copy link&quot;
                    copies the full secure URL.
                  </BodyText>
                ) : null}
              </Stack>
            </SurfaceTile>

            {interview.workflow ? (
              <SurfaceTile tone="glass" padding="lg">
                <Stack gap={3}>
                  <IconLabel
                    icon={
                      <Icon size="md">
                        <Workflow />
                      </Icon>
                    }
                    tone="primary"
                  >
                    Workflow
                  </IconLabel>
                  <BodyText size="sm">
                    Status:{' '}
                    <strong>
                      {interview.workflow.status.replaceAll('_', ' ')}
                    </strong>
                    {interview.workflow.currentStage
                      ? ` • stage: ${formatWorkflowStage(interview.workflow.currentStage)}`
                      : ''}
                  </BodyText>
                  <BodyText size="sm">
                    Last update{' '}
                    {new Date(interview.workflow.lastUpdatedAt).toLocaleString()}
                  </BodyText>
                  {interview.workflow.errorMessage ? (
                    <BodyText size="sm" tone="danger">
                      {interview.workflow.errorMessage}
                    </BodyText>
                  ) : null}
                </Stack>
              </SurfaceTile>
            ) : null}
          </CardContent>
        </Card>
      </Grid>

      {candidateLinkStatus === 'error' ? (
        <Alert variant="danger">
          <AlertTitle>Candidate link error</AlertTitle>
          <AlertDescription>{candidateLinkError}</AlertDescription>
        </Alert>
      ) : null}

      <Section gap={4}>
        <Inline gap={4} align="end" justify="between" wrap="wrap">
          <Stack gap={2}>
            <EyebrowLabel size="lg">Candidate packet</EyebrowLabel>
            <SectionHeading>Questions</SectionHeading>
          </Stack>
          <BodyText size="sm" width="prose">
            The recruiter view shows the configured questions and their rubric.
            Submitted answers, transcripts, AI evaluation, and recordings live
            on the review screen.
          </BodyText>
        </Inline>

        <Stack gap={4}>
          {interview.questions.map((question, questionIndex) => {
            const answer = answersByIndex.get(questionIndex)

            return (
              <Card key={question.id} variant="surface">
                <CardHeader spacing="md">
                  <Inline gap={4} align="start" justify="between" wrap="wrap">
                    <Stack gap={3}>
                      <PillRow>
                        <StatusPill tone="neutral" casing="chip">
                          Q{questionIndex + 1}
                        </StatusPill>
                        <StatusPill tone={question.difficulty} casing="chip">
                          {question.difficulty}
                        </StatusPill>
                        {question.category ? (
                          <StatusPill tone="neutral" casing="chip">
                            {question.category}
                          </StatusPill>
                        ) : null}
                        <StatusPill tone="neutral" casing="chip">
                          weight {question.weight}
                        </StatusPill>
                      </PillRow>
                      <CardTitle size="md" width="xl">
                        {question.questionText}
                      </CardTitle>
                    </Stack>

                    {answer?.status === 'submitted' ? (
                      <StatusPill tone="completed" casing="chip">
                        Submitted
                      </StatusPill>
                    ) : answer ? (
                      <StatusPill tone="processing" casing="chip">
                        In progress
                      </StatusPill>
                    ) : (
                      <StatusPill tone="pending" casing="chip">
                        Pending
                      </StatusPill>
                    )}
                  </Inline>
                </CardHeader>
                <CardContent spacing="md">
                  <Grid columns="metrics-2-md" gap={4}>
                    <SurfaceTile rounded="xl" padding="lg">
                      <Stack gap={2}>
                        <EyebrowLabel size="sm">Expected concepts</EyebrowLabel>
                        <BodyText size="sm">
                          {question.expectedConcepts.length > 0
                            ? question.expectedConcepts
                                .map((item) => item.label)
                                .join(', ')
                            : 'Not specified'}
                        </BodyText>
                      </Stack>
                    </SurfaceTile>
                    <SurfaceTile rounded="xl" padding="lg">
                      <Stack gap={2}>
                        <EyebrowLabel size="sm">Red flags</EyebrowLabel>
                        <BodyText size="sm">
                          {question.redFlags.length > 0
                            ? question.redFlags
                                .map((item) => item.label)
                                .join(', ')
                            : 'Not specified'}
                        </BodyText>
                      </Stack>
                    </SurfaceTile>
                  </Grid>
                </CardContent>
              </Card>
            )
          })}
        </Stack>
      </Section>
    </PageShell>
  )
}
