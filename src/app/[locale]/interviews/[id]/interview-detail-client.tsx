'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { PageShell } from '@/components/ui/layout/page-shell'
import { Grid } from '@/components/ui/layout/grid'
import type { Interview, InterviewResult } from '@/lib/api'
import { formatCandidateLinkPreview } from '@/lib/interview-detail-format'
import { useToastMessages } from '@/lib/use-toast-messages'
import { useAuth, useIsDemo } from '@/lib/auth-context'
import { DemoTakeExperience } from '@/components/take/demo/demo-take-experience'
import { CandidateAccessPanel } from '@/components/interviews/detail/candidate-access-panel'
import { InterviewSummaryCard } from '@/components/interviews/detail/interview-summary-card'
import { AnswerPacketList } from '@/components/interviews/detail/answer-packet-list'
import { InterviewScorecard } from '@/components/interviews/detail/interview-scorecard'

import { useCandidateLink } from './use-candidate-link'
import { useInterviewValidation } from './use-interview-validation'
import { useAnswerUploads } from './use-answer-uploads'
import { useAnswerMedia } from './use-answer-media'

interface InterviewDetailClientProps {
  id: string
  initialInterview: Interview
  initialResults: InterviewResult | null
}

export default function InterviewDetailClient({
  id,
  initialInterview,
  initialResults,
}: InterviewDetailClientProps) {
  const t = useTranslations('questions.common')
  const toastMessages = useToastMessages()
  const { user } = useAuth()
  const isDemo = useIsDemo()

  const [showDemoTake, setShowDemoTake] = useState(false)
  const [interview, setInterview] = useState<Interview | null>(initialInterview)
  const [results, setResults] = useState<InterviewResult | null>(initialResults)

  const {
    candidateLink,
    candidateLinkStatus,
    candidateLinkError,
    copyStatus,
    loadCandidateLink,
    handleCopyCandidateLink,
  } = useCandidateLink({ id, isDemo, user, toastMessages })

  const { validating, handleValidate } = useInterviewValidation({
    id,
    interview,
    setInterview,
    setResults,
    toastMessages,
    resultsWarningLabel: t('resultsNotAfterValidation'),
  })

  const { uploadStates, handleUpload } = useAnswerUploads({
    initialInterview,
    interview,
    setInterview,
    toastMessages,
    uploadToStorageFailedLabel: t('uploadToStorageFailed'),
    uploadFailedLabel: t('uploadFailed'),
  })

  const { mediaByQuestion } = useAnswerMedia({
    id,
    interview,
    failedLoadMediaLabel: t('failedLoadMedia'),
  })

  if (!interview) {
    return null
  }

  const canPreviewDemoTake = isDemo && interview.status === 'pending'

  if (showDemoTake) {
    return (
      <PageShell>
        <DemoTakeExperience
          candidateName={interview.candidateName}
          position={interview.position}
          questionTexts={interview.questions.map(
            (question) => question.questionText,
          )}
          onExit={() => setShowDemoTake(false)}
        />
      </PageShell>
    )
  }

  const answeredCount = interview.answers.filter(
    (answer) => answer.status === 'submitted',
  ).length
  const validatedCount = interview.answers.filter(
    (answer) => answer.validation?.status === 'completed',
  ).length
  const hasActiveValidation = interview.answers.some(
    (answer) =>
      answer.validation?.status === 'queued' ||
      answer.validation?.status === 'processing',
  )
  const totalQuestions = interview.questions.length
  const answersByIndex = new Map(
    interview.answers.map((a) => [a.questionIndex, a]),
  )
  const progressValue =
    answeredCount === 0
      ? 0
      : Math.round((validatedCount / answeredCount) * 100)
  const allAnswered = interview.questions.every((_, qi) =>
    interview.answers.some(
      (answer) => answer.questionIndex === qi && answer.status === 'submitted',
    ),
  )
  const isTerminal =
    interview.status === 'completed' || interview.status === 'failed'
  const canValidate =
    allAnswered && !hasActiveValidation && interview.status !== 'completed'
  const candidateLinkPreview = formatCandidateLinkPreview(candidateLink)

  return (
    <PageShell>
      <Grid as="section" columns="split-115-85" gap={6}>
        <InterviewSummaryCard
          interview={interview}
          results={results}
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          canValidate={canValidate}
          validating={validating}
          hasActiveValidation={hasActiveValidation}
          onValidate={handleValidate}
        />

        <CandidateAccessPanel
          interview={interview}
          isDemo={isDemo}
          candidateLink={candidateLink}
          candidateLinkStatus={candidateLinkStatus}
          candidateLinkError={candidateLinkError}
          candidateLinkPreview={candidateLinkPreview}
          copyStatus={copyStatus}
          onRefreshLink={() => void loadCandidateLink('refresh')}
          onCopyLink={handleCopyCandidateLink}
          canValidate={canValidate}
          hasActiveValidation={hasActiveValidation}
          progressValue={progressValue}
          validatedCount={validatedCount}
          answeredCount={answeredCount}
          canPreviewDemoTake={canPreviewDemoTake}
          onPreviewDemoTake={() => setShowDemoTake(true)}
        />
      </Grid>

      <AnswerPacketList
        interview={interview}
        answersByIndex={answersByIndex}
        uploadStates={uploadStates}
        mediaByQuestion={mediaByQuestion}
        isTerminal={isTerminal}
        hasActiveValidation={hasActiveValidation}
        validating={validating}
        onUpload={handleUpload}
      />

      {results ? <InterviewScorecard results={results} /> : null}
    </PageShell>
  )
}
