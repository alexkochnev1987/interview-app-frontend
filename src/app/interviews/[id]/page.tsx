'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  CircleAlert,
  CircleDashed,
  FileVideo2,
  Layers3,
  Sparkles,
  Upload,
} from 'lucide-react'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { HeroNumber } from '@/components/ui/hero-number'
import { IconBadge } from '@/components/ui/icon-badge'
import { IconLabel } from '@/components/ui/icon-label'
import { MetricPanel } from '@/components/ui/metric-panel'
import { StatusPill } from '@/components/ui/status-pill'
import { LoadingStateCard } from '@/components/ui/state-card'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { HiddenFileInput } from '@/components/ui/hidden-file-input'
import { HoverGroup } from '@/components/ui/hover-group'
import { Inline } from '@/components/ui/layout/inline'
import { Progress } from '@/components/ui/progress'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import {
  completeInterview,
  completeUpload,
  generateCandidateLink,
  getInterview,
  getPresignedUrl,
  getResults,
  type Interview,
  type InterviewResult,
} from '@/lib/api'
import {
  formatInterviewDate,
  formatInterviewStatusLabel,
  getCandidateInitials,
} from '@/lib/interview-formatters'

type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error'

interface QuestionUploadState {
  status: UploadStatus
  errorMessage?: string
}

function formatAnswerDuration(seconds?: number) {
  if (!seconds || seconds < 1) {
    return 'n/a'
  }

  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

function formatFileSize(bytes?: number) {
  if (!bytes || bytes < 1) {
    return 'n/a'
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatWorkflowStage(stage?: string) {
  if (!stage) {
    return 'idle'
  }

  return stage.replaceAll('_', ' ')
}

function formatCandidateLinkPreview(candidateLink: string) {
  if (!candidateLink) {
    return ''
  }

  try {
    const url = new URL(candidateLink)
    const token = url.searchParams.get('token')
    const shortToken = token
      ? `${token.slice(0, 12)}...${token.slice(-8)}`
      : null

    return `${url.origin}${url.pathname}${shortToken ? `?token=${shortToken}` : ''}`
  } catch {
    if (candidateLink.length <= 96) {
      return candidateLink
    }

    return `${candidateLink.slice(0, 72)}...${candidateLink.slice(-20)}`
  }
}

export default function InterviewDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [interview, setInterview] = useState<Interview | null>(null)
  const [results, setResults] = useState<InterviewResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [uploadStates, setUploadStates] = useState<QuestionUploadState[]>([])
  const [candidateLink, setCandidateLink] = useState('')
  const [candidateLinkStatus, setCandidateLinkStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle')
  const [candidateLinkError, setCandidateLinkError] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const buildCandidateUrl = useCallback((relativeLink: string) => {
    if (typeof window === 'undefined') {
      return relativeLink
    }

    return new URL(relativeLink, window.location.origin).toString()
  }, [])

  const loadCandidateLink = useCallback(
    async (mode: 'initial' | 'refresh' = 'refresh') => {
      try {
        setCandidateLinkStatus('loading')
        setCandidateLinkError('')
        const data = await generateCandidateLink(id)
        setCandidateLink(buildCandidateUrl(data.candidateLink))
        setCandidateLinkStatus('ready')
        if (mode === 'refresh') {
          setCopyStatus('idle')
        }
      } catch (err) {
        setCandidateLink('')
        setCandidateLinkStatus('error')
        setCandidateLinkError(
          err instanceof Error ? err.message : 'Failed to generate candidate link.',
        )
      }
    },
    [buildCandidateUrl, id],
  )

  const loadInterview = useCallback(async () => {
    try {
      const data = await getInterview(id)
      setInterview(data)
      setUploadStates(
        data.questions.map((_, qi) => {
          const hasAnswer = data.answers.some((answer) => answer.questionIndex === qi)
          return { status: hasAnswer ? 'uploaded' : 'idle' } as QuestionUploadState
        }),
      )

      if (data.status === 'completed') {
        try {
          const nextResults = await getResults(id)
          setResults(nextResults)
        } catch (resultsError) {
          console.warn('Results not yet available for completed interview', resultsError)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interview.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadInterview()
  }, [loadInterview])

  useEffect(() => {
    void loadCandidateLink('initial')
  }, [loadCandidateLink])

  function setFileInputRef(index: number, element: HTMLInputElement | null) {
    fileInputRefs.current[index] = element
  }

  async function handleCopyCandidateLink() {
    if (!candidateLink) {
      return
    }

    try {
      await navigator.clipboard.writeText(candidateLink)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  async function handleUpload(questionIndex: number) {
    const fileInput = fileInputRefs.current[questionIndex]
    if (!fileInput?.files?.length || !interview) {
      return
    }

    const file = fileInput.files[0]

    setUploadStates((current) =>
      current.map((state, index) => (index === questionIndex ? { status: 'uploading' } : state)),
    )

    try {
      const { uploadUrl, mediaKey } = await getPresignedUrl(interview.id, questionIndex, file.type)

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload to storage failed')
      }

      const updatedInterview = await completeUpload(interview.id, questionIndex, mediaKey)
      setInterview(updatedInterview)
      setUploadStates((current) =>
        current.map((state, index) =>
          index === questionIndex ? { status: 'uploaded' } : state,
        ),
      )
    } catch (err) {
      setUploadStates((current) =>
        current.map((state, index) =>
          index === questionIndex
            ? {
                status: 'error',
                errorMessage: err instanceof Error ? err.message : 'Upload failed',
              }
            : state,
        ),
      )
    }
  }

  async function handleComplete() {
    if (!interview) {
      return
    }

    setCompleting(true)
    setError(null)

    try {
      const updatedInterview = await completeInterview(interview.id)
      setInterview(updatedInterview)

      if (updatedInterview.status === 'completed') {
        try {
          const nextResults = await getResults(interview.id)
          setResults(nextResults)
        } catch (resultsError) {
          console.warn('Results not yet available after completion', resultsError)
        }
      }

      if (updatedInterview.status === 'processing') {
        const pollId = window.setInterval(async () => {
          try {
            const refreshedInterview = await getInterview(interview.id)
            setInterview(refreshedInterview)

            if (refreshedInterview.status === 'completed') {
              window.clearInterval(pollId)
              const nextResults = await getResults(interview.id)
              setResults(nextResults)
            } else if (refreshedInterview.status === 'failed') {
              window.clearInterval(pollId)
            }
          } catch {
            window.clearInterval(pollId)
          }
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete interview.')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <PageShell>
        <LoadingStateCard label="Loading interview..." />
      </PageShell>
    )
  }

  if (error && !interview) {
    return (
      <PageShell spacing="tight">
        <Alert variant="danger">
          <AlertTitle>Interview unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline-pill" shape="pill">
          <UnstyledLink href="/">
            <ArrowLeft className="size-4" />
            Back to dashboard
          </UnstyledLink>
        </Button>
      </PageShell>
    )
  }

  if (!interview) {
    return null
  }

  const answeredCount = interview.answers.filter((answer) => answer.status === 'submitted').length
  const totalQuestions = interview.questions.length
  const progressValue = totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100)
  const allAnswered = interview.questions.every((_, qi) =>
    interview.answers.some((answer) => answer.questionIndex === qi && answer.status === 'submitted'),
  )
  const isTerminal = interview.status === 'completed' || interview.status === 'failed'
  const canComplete = allAnswered && !isTerminal && interview.status !== 'processing'
  const candidateLinkPreview = formatCandidateLinkPreview(candidateLink)

  return (
    <PageShell>
      <Grid as="section" columns="split-115-85" gap={6}>
        <Card variant="floating" size="lg">
          <CardContent spacing="2xl">
            <Inline gap={4} align="start" justify="between" wrap="wrap">
              <Stack gap={4}>
                <UnstyledLink href="/">
                  <EyebrowBadge tone="default" icon={<ArrowLeft className="size-3.5" />}>
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

              <Inline gap={3} wrap="wrap">
                {!isTerminal ? (
                  <Button
                    type="button"
                    variant="gradient"
                    onClick={handleComplete}
                    disabled={!canComplete || completing}
                  >
                    {completing
                      ? 'Completing...'
                      : interview.status === 'processing'
                        ? 'Processing...'
                        : 'Complete Interview'}
                  </Button>
                ) : null}
              </Inline>
            </Inline>

            <Grid columns="metrics-3" gap={4}>
              <MetricPanel label="Questions" value={totalQuestions} valueSize="lg" />
              <MetricPanel label="Uploaded" value={answeredCount} valueSize="lg" />
              <MetricPanel
                label="Overall score"
                value={results ? results.overallScore : '--'}
                valueSize="lg"
              />
            </Grid>
          </CardContent>
        </Card>

        <Card variant="tinted">
          <CardHeader spacing="sm">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />} tone="muted">
              Candidate access
            </EyebrowBadge>
            <CardTitle size="lg">Interview link</CardTitle>
            <CardDescription>
              Share this link with the candidate to start the recording flow without recruiter
              sign-in.
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
                      {candidateLinkStatus === 'loading' ? 'Generating...' : 'Refresh link'}
                    </Button>
                    <Button
                      type="button"
                      variant="gradient"
                      size="sm"
                      onClick={handleCopyCandidateLink}
                      disabled={candidateLinkStatus !== 'ready' || !candidateLink}
                    >
                      <Copy className="size-4" />
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
                      : candidateLinkPreview || 'Candidate link is not available yet.'}
                </BodyText>
                {candidateLinkStatus === 'ready' && candidateLink ? (
                  <BodyText size="xs" title={candidateLink}>
                    Showing a shortened preview here. `Copy link` copies the full secure URL.
                  </BodyText>
                ) : null}
              </Stack>
            </SurfaceTile>

            <SurfaceTile tone="glass" padding="lg">
              <Stack gap={3}>
                <IconLabel
                  icon={
                    canComplete ? (
                      <CheckCircle2 className="size-4 text-success-soft-foreground" />
                    ) : (
                      <CircleDashed className="size-4 text-muted-foreground" />
                    )
                  }
                >
                  Ready state
                </IconLabel>
                <BodyText size="sm">
                  {canComplete
                    ? 'All answers are in place. You can send the packet for scoring now.'
                    : 'Scoring stays locked until every question has an uploaded answer.'}
                </BodyText>
              </Stack>
            </SurfaceTile>

            <SurfaceTile tone="glass" padding="lg">
              <Stack gap={3}>
                <Inline gap={3} align="center" justify="between">
                  <BodyText as="span" size="sm-tight" tone="foreground">
                    Completion
                  </BodyText>
                  <StatusPill tone="neutral">{progressValue}%</StatusPill>
                </Inline>
                <Progress value={progressValue} density="thick" />
                <BodyText size="sm">
                  {answeredCount} of {totalQuestions} answers uploaded.
                </BodyText>
              </Stack>
            </SurfaceTile>

            {results ? (
              <SurfaceTile tone="glass" padding="lg">
                <Stack gap={3}>
                  <IconLabel icon={<Layers3 className="size-4 text-[hsl(var(--primary))]" />}>
                    Results summary
                  </IconLabel>
                  <BodyText size="sm">{results.summary}</BodyText>
                </Stack>
              </SurfaceTile>
            ) : null}

            {interview.workflow ? (
              <SurfaceTile tone="glass" padding="lg">
                <Stack gap={3}>
                  <IconLabel icon={<Layers3 className="size-4 text-[hsl(var(--primary))]" />}>
                    Workflow
                  </IconLabel>
                  <BodyText size="sm">
                    Status: <strong>{interview.workflow.status.replace('_', ' ')}</strong>
                    {interview.workflow.currentStage
                      ? ` • stage: ${formatWorkflowStage(interview.workflow.currentStage)}`
                      : ''}
                  </BodyText>
                  <BodyText size="sm">
                    Last update {new Date(interview.workflow.lastUpdatedAt).toLocaleString()}
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

      {error ? (
        <Alert variant="danger">
          <AlertTitle>Interview action failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Section gap={4}>
        <Inline gap={4} align="end" justify="between" wrap="wrap">
          <Stack gap={2}>
            <EyebrowLabel size="lg">Candidate packet</EyebrowLabel>
            <SectionHeading>Questions and uploads</SectionHeading>
          </Stack>
          <BodyText size="sm">
            Upload audio/video manually if the candidate flow was completed outside the browser.
          </BodyText>
        </Inline>

        <Stack gap={4}>
          {interview.questions.map((question, questionIndex) => {
            const answer = interview.answers.find((item) => item.questionIndex === questionIndex)
            const hasAnswer = Boolean(answer)
            const uploadState = uploadStates[questionIndex] ?? { status: 'idle' }

            return (
              <HoverGroup key={question.id}>
                <Card variant="surface" interaction="hover">
                  <CardHeader spacing="md">
                    <Inline gap={4} align="start" justify="between" wrap="wrap">
                      <Stack gap={3}>
                        <Inline gap={2} align="center" wrap="wrap">
                          <StatusPill tone="neutral">Q{questionIndex + 1}</StatusPill>
                          <StatusPill tone={question.difficulty}>{question.difficulty}</StatusPill>
                          {question.category ? (
                            <StatusPill tone="neutral" casing="chip">
                              {question.category}
                            </StatusPill>
                          ) : null}
                          <StatusPill tone="neutral">weight {question.weight}</StatusPill>
                        </Inline>
                        <CardTitle size="md" width="xl">
                          {question.questionText}
                        </CardTitle>
                      </Stack>

                      <Stack gap={2} align="end">
                        {answer?.status === 'submitted' ? (
                          <StatusPill tone="completed">Submitted</StatusPill>
                        ) : hasAnswer || uploadState.status === 'uploaded' ? (
                          <StatusPill tone="processing">Draft saved</StatusPill>
                        ) : uploadState.status === 'uploading' ? (
                          <StatusPill tone="processing">Uploading</StatusPill>
                        ) : uploadState.status === 'error' ? (
                          <StatusPill tone="failed">Upload failed</StatusPill>
                        ) : (
                          <StatusPill tone="pending">Pending</StatusPill>
                        )}

                        {!isTerminal && interview.status !== 'processing' ? (
                          <>
                            <HiddenFileInput
                              accept="video/*,audio/*"
                              ref={(element) => setFileInputRef(questionIndex, element)}
                              onChange={() => handleUpload(questionIndex)}
                            />
                            <Button
                              type="button"
                              variant={
                                uploadState.status === 'error' ? 'destructive' : 'outline-pill'
                              }
                              shape="pill"
                              size="sm"
                              onClick={() => fileInputRefs.current[questionIndex]?.click()}
                            >
                              <Upload className="size-4" />
                              {uploadState.status === 'error' ? 'Retry upload' : 'Upload file'}
                            </Button>
                          </>
                        ) : null}
                      </Stack>
                    </Inline>
                  </CardHeader>
                  <CardContent spacing="md">
                    {answer ? (
                      <Grid columns="metrics-2-md" gap={4}>
                        <SurfaceTile rounded="xl">
                          <Stack gap={3}>
                            <EyebrowLabel>Recorded answer</EyebrowLabel>
                            <BodyText size="sm">
                              Duration {formatAnswerDuration(answer.durationSeconds)} • retakes{' '}
                              {answer.retakeCount ?? 0}
                            </BodyText>
                            <BodyText size="sm">
                              Camera {formatFileSize(answer.camera?.fileSizeBytes)} • screen{' '}
                              {formatFileSize(answer.screen?.fileSizeBytes)}
                            </BodyText>
                            <BodyText size="sm">
                              Status {answer.status} • versions {answer.versions?.length ?? 1}
                            </BodyText>
                            <BodyText size="sm">
                              Uploaded {new Date(answer.uploadedAt).toLocaleString()}
                            </BodyText>
                          </Stack>
                        </SurfaceTile>
                        <SurfaceTile rounded="xl">
                          <Stack gap={3}>
                            <EyebrowLabel>Evaluation signals</EyebrowLabel>
                            <BodyText size="sm">
                              Hidden tabs {answer.behaviorSignals?.tabHiddenCount ?? 0} • blur{' '}
                              {answer.behaviorSignals?.windowBlurCount ?? 0} • paste{' '}
                              {answer.behaviorSignals?.pasteCount ?? 0}
                            </BodyText>
                            <BodyText size="sm">
                              Keydown {answer.behaviorSignals?.keydownCount ?? 0} • resize{' '}
                              {answer.behaviorSignals?.resizeCount ?? 0}
                            </BodyText>
                            <BodyText size="sm">
                              Transcript {answer.transcript?.text ? 'ready' : 'pending'} •
                              evaluation{' '}
                              {answer.evaluation?.overallScore !== undefined ? 'ready' : 'pending'}
                            </BodyText>
                          </Stack>
                        </SurfaceTile>
                      </Grid>
                    ) : null}

                    <Grid columns="metrics-2-md" gap={4}>
                      <SurfaceTile rounded="xl">
                        <Stack gap={3}>
                          <EyebrowLabel>Expected concepts</EyebrowLabel>
                          <BodyText size="sm">
                            {question.expectedConcepts.length > 0
                              ? question.expectedConcepts.map((item) => item.label).join(', ')
                              : 'Not specified'}
                          </BodyText>
                        </Stack>
                      </SurfaceTile>
                      <SurfaceTile rounded="xl">
                        <Stack gap={3}>
                          <EyebrowLabel>Red flags</EyebrowLabel>
                          <BodyText size="sm">
                            {question.redFlags.length > 0
                              ? question.redFlags.map((item) => item.label).join(', ')
                              : 'Not specified'}
                          </BodyText>
                        </Stack>
                      </SurfaceTile>
                    </Grid>

                    {uploadState.status === 'error' && uploadState.errorMessage ? (
                      <Alert variant="danger">
                        <CircleAlert className="size-4" />
                        <AlertTitle>Upload error</AlertTitle>
                        <AlertDescription>{uploadState.errorMessage}</AlertDescription>
                      </Alert>
                    ) : null}
                  </CardContent>
                </Card>
              </HoverGroup>
            )
          })}
        </Stack>
      </Section>

      {results ? (
        <Section gap={4}>
          <Inline gap={4} align="end" justify="between" wrap="wrap">
            <Stack gap={2}>
              <EyebrowLabel size="lg">Scorecard</EyebrowLabel>
              <SectionHeading>Interview results</SectionHeading>
            </Stack>
            <BodyText size="sm">
              Candidate feedback remains a tokenized route shared separately from the recruiter UI.
            </BodyText>
          </Inline>

          <Grid columns="split-85-115" gap={4}>
            <Card variant="surface" size="lg">
              <CardContent spacing="lg">
                <EyebrowBadge icon={<FileVideo2 className="size-3.5" />} tone="primary">
                  Overall score
                </EyebrowBadge>
                <HeroNumber>{results.overallScore}</HeroNumber>
                <BodyText size="lead">{results.summary}</BodyText>
                <Inline gap={2} wrap="wrap">
                  {results.decision ? (
                    <StatusPill tone="neutral">{results.decision}</StatusPill>
                  ) : null}
                  {results.trustScore !== undefined ? (
                    <StatusPill tone="neutral">trust {results.trustScore}</StatusPill>
                  ) : null}
                  {results.rubricVersion ? (
                    <StatusPill tone="neutral">{results.rubricVersion}</StatusPill>
                  ) : null}
                </Inline>
                {results.trustFlags?.length ? (
                  <BodyText size="lead">Flags: {results.trustFlags.join(', ')}</BodyText>
                ) : null}
              </CardContent>
            </Card>

            <Grid columns="metrics-3" gap={4}>
              {Object.entries(results.categoryScores).map(([category, score]) => (
                <MetricPanel
                  key={category}
                  tone="surface"
                  label={category}
                  value={score}
                  description="out of 100"
                  valueSize="hero"
                  valueTone="primary"
                />
              ))}
            </Grid>
          </Grid>
        </Section>
      ) : null}
    </PageShell>
  )
}
