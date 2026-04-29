'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  FileVideo2,
  Layers3,
  Sparkles,
  Upload,
} from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/app/hero-text'
import { IconBadge } from '@/components/app/icon-badge'
import { MetricPanel } from '@/components/app/metric-panel'
import { StatusPill } from '@/components/app/status-pill'
import { LoadingStateCard } from '@/components/app/state-card'
import { SurfaceTile } from '@/components/app/surface-tile'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  completeInterview,
  completeUpload,
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

export default function InterviewDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [interview, setInterview] = useState<Interview | null>(null)
  const [results, setResults] = useState<InterviewResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [uploadStates, setUploadStates] = useState<QuestionUploadState[]>([])
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

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

  function setFileInputRef(index: number, element: HTMLInputElement | null) {
    fileInputRefs.current[index] = element
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
      <main className="container py-12">
        <LoadingStateCard label="Loading interview..." />
      </main>
    )
  }

  if (error && !interview) {
    return (
      <main className="container space-y-6 py-12">
        <Alert variant="danger">
          <AlertTitle>Interview unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline-pill" shape="pill">
          <a href="/">
            <ArrowLeft className="size-4" />
            Back to dashboard
          </a>
        </Button>
      </main>
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

  return (
    <main className="container space-y-8 py-10 md:space-y-10 md:py-12">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card variant="floating">
          <CardContent className="space-y-8 px-8 py-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-4">
                <a href="/" className="inline-block no-underline">
                  <EyebrowBadge tone="default" icon={<ArrowLeft className="size-3.5" />}>
                    Back to dashboard
                  </EyebrowBadge>
                </a>

                <div className="flex items-center gap-4">
                  <IconBadge tone="primary" size="lg" className="text-lg font-semibold">
                    {getCandidateInitials(interview.candidateName)}
                  </IconBadge>
                  <div className="space-y-1.5">
                    <HeroTitle>{interview.candidateName}</HeroTitle>
                    <HeroLead>{interview.position}</HeroLead>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill tone={interview.status}>
                    {formatInterviewStatusLabel(interview.status)}
                  </StatusPill>
                  <StatusPill tone="neutral">
                    Created {formatInterviewDate(interview.createdAt)}
                  </StatusPill>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {!isTerminal ? (
                  <Button
                    type="button"
                    variant="gradient"
                    onClick={handleComplete}
                    disabled={!canComplete || completing}
                    className="px-5"
                  >
                    {completing
                      ? 'Completing...'
                      : interview.status === 'processing'
                        ? 'Processing...'
                        : 'Complete Interview'}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <MetricPanel
                label="Questions"
                value={totalQuestions}
                valueClassName="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground"
              />
              <MetricPanel
                label="Uploaded"
                value={answeredCount}
                valueClassName="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground"
              />
              <MetricPanel
                label="Overall score"
                value={results ? results.overallScore : '--'}
                valueClassName="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="tinted">
          <CardHeader>
            <EyebrowBadge icon={<Sparkles className="size-3.5" />} tone="muted">
              Interview progress
            </EyebrowBadge>
            <CardTitle className="text-2xl tracking-[-0.03em]">Answer packet status</CardTitle>
            <CardDescription className="text-sm leading-6">
              Recruiter-side review stays anchored to upload completion first, then shifts into
              scoring once the packet is fully assembled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SurfaceTile tone="glass" padding="lg" className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">Completion</span>
                <StatusPill tone="neutral">{progressValue}%</StatusPill>
              </div>
              <Progress value={progressValue} className="h-2.5 rounded-full bg-card" />
              <p className="text-sm leading-6 text-muted-foreground">
                {answeredCount} of {totalQuestions} answers uploaded.
              </p>
            </SurfaceTile>

            <SurfaceTile tone="glass" padding="lg" className="space-y-3">
              <div className="flex items-center gap-2 text-foreground">
                {canComplete ? (
                  <CheckCircle2 className="size-4 text-success-soft-foreground" />
                ) : (
                  <CircleDashed className="size-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">Ready state</span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {canComplete
                  ? 'All answers are in place. You can send the packet for scoring now.'
                  : 'Scoring stays locked until every question has an uploaded answer.'}
              </p>
            </SurfaceTile>

            {results ? (
              <SurfaceTile tone="glass" padding="lg" className="space-y-3">
                <div className="flex items-center gap-2 text-foreground">
                  <Layers3 className="size-4 text-[hsl(var(--primary))]" />
                  <span className="text-sm font-medium">Results summary</span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{results.summary}</p>
              </SurfaceTile>
            ) : null}

            {interview.workflow ? (
              <SurfaceTile tone="glass" padding="lg" className="space-y-3">
                <div className="flex items-center gap-2 text-foreground">
                  <Layers3 className="size-4 text-[hsl(var(--primary))]" />
                  <span className="text-sm font-medium">Workflow</span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Status: <strong>{interview.workflow.status.replace('_', ' ')}</strong>
                  {interview.workflow.currentStage
                    ? ` • stage: ${formatWorkflowStage(interview.workflow.currentStage)}`
                    : ''}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Last update {new Date(interview.workflow.lastUpdatedAt).toLocaleString()}
                </p>
                {interview.workflow.errorMessage ? (
                  <p className="text-sm leading-6 text-danger-soft-foreground">
                    {interview.workflow.errorMessage}
                  </p>
                ) : null}
              </SurfaceTile>
            ) : null}
          </CardContent>
        </Card>
      </section>

      {error ? (
        <Alert variant="danger">
          <AlertTitle>Interview action failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Candidate packet
            </div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Questions and uploads
            </h2>
          </div>
          <div className="text-sm text-muted-foreground">
            Upload audio/video manually if the candidate flow was completed outside the browser.
          </div>
        </div>

        <div className="grid gap-4">
          {interview.questions.map((question, questionIndex) => {
            const answer = interview.answers.find((item) => item.questionIndex === questionIndex)
            const hasAnswer = Boolean(answer)
            const uploadState = uploadStates[questionIndex] ?? { status: 'idle' }

            return (
              <Card
                key={question.id}
                variant="surface"
                className="transition-transform duration-200 hover:-translate-y-0.5"
              >
                <CardHeader className="gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone="neutral">Q{questionIndex + 1}</StatusPill>
                        <StatusPill tone={question.difficulty}>{question.difficulty}</StatusPill>
                        {question.category ? (
                          <StatusPill tone="neutral" className="normal-case tracking-[0.08em]">
                            {question.category}
                          </StatusPill>
                        ) : null}
                        <StatusPill tone="neutral">weight {question.weight}</StatusPill>
                      </div>
                      <CardTitle className="max-w-4xl text-xl tracking-[-0.03em]">
                        {question.questionText}
                      </CardTitle>
                    </div>

                    <div className="flex flex-col items-end gap-2">
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
                          <input
                            type="file"
                            accept="video/*,audio/*"
                            ref={(element) => setFileInputRef(questionIndex, element)}
                            className="hidden"
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
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {answer ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <SurfaceTile rounded="xl">
                        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Recorded answer
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          Duration {formatAnswerDuration(answer.durationSeconds)} • retakes {answer.retakeCount ?? 0}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Camera {formatFileSize(answer.camera?.fileSizeBytes)} • screen {formatFileSize(answer.screen?.fileSizeBytes)}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Status {answer.status} • versions {answer.versions?.length ?? 1}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Uploaded {new Date(answer.uploadedAt).toLocaleString()}
                        </p>
                      </SurfaceTile>
                      <SurfaceTile rounded="xl">
                        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Evaluation signals
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          Hidden tabs {answer.behaviorSignals?.tabHiddenCount ?? 0} • blur {answer.behaviorSignals?.windowBlurCount ?? 0} • paste {answer.behaviorSignals?.pasteCount ?? 0}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Keydown {answer.behaviorSignals?.keydownCount ?? 0} • resize {answer.behaviorSignals?.resizeCount ?? 0}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Transcript {answer.transcript?.text ? 'ready' : 'pending'} • evaluation {answer.evaluation?.overallScore !== undefined ? 'ready' : 'pending'}
                        </p>
                      </SurfaceTile>
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    <SurfaceTile rounded="xl">
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Expected concepts
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {question.expectedConcepts.length > 0
                          ? question.expectedConcepts.map((item) => item.label).join(', ')
                          : 'Not specified'}
                      </p>
                    </SurfaceTile>
                    <SurfaceTile rounded="xl">
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Red flags
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {question.redFlags.length > 0
                          ? question.redFlags.map((item) => item.label).join(', ')
                          : 'Not specified'}
                      </p>
                    </SurfaceTile>
                  </div>

                  {uploadState.status === 'error' && uploadState.errorMessage ? (
                    <Alert variant="danger">
                      <CircleAlert className="size-4" />
                      <AlertTitle>Upload error</AlertTitle>
                      <AlertDescription>{uploadState.errorMessage}</AlertDescription>
                    </Alert>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {results ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Scorecard
              </div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                Interview results
              </h2>
            </div>
            <div className="text-sm leading-6 text-muted-foreground">
              Candidate feedback remains a tokenized route shared separately from the recruiter UI.
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <Card variant="surface">
              <CardContent className="space-y-5 px-8 py-8">
                <EyebrowBadge icon={<FileVideo2 className="size-3.5" />} tone="primary">
                  Overall score
                </EyebrowBadge>
                <div className="text-6xl font-semibold tracking-[-0.06em] text-[hsl(var(--primary))]">
                  {results.overallScore}
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{results.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {results.decision ? (
                    <StatusPill tone="neutral">{results.decision}</StatusPill>
                  ) : null}
                  {results.trustScore !== undefined ? (
                    <StatusPill tone="neutral">trust {results.trustScore}</StatusPill>
                  ) : null}
                  {results.rubricVersion ? (
                    <StatusPill tone="neutral">{results.rubricVersion}</StatusPill>
                  ) : null}
                </div>
                {results.trustFlags?.length ? (
                  <p className="text-sm leading-7 text-muted-foreground">
                    Flags: {results.trustFlags.join(', ')}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(results.categoryScores).map(([category, score]) => (
                <Card key={category} variant="surface">
                  <CardContent className="space-y-3 px-6 py-6 text-center">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {category}
                    </div>
                    <div className="text-4xl font-semibold tracking-[-0.05em] text-[hsl(var(--primary))]">
                      {score}
                    </div>
                    <p className="text-sm text-muted-foreground">out of 100</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}
