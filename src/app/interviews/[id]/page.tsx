'use client'

import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { LoadingStateCard } from '@/components/app/state-card'
import { InterviewDetailHero } from '@/components/interviews/detail/interview-detail-hero'
import { InterviewQuestionCard } from '@/components/interviews/detail/interview-question-card'
import { InterviewResultsSection } from '@/components/interviews/detail/interview-results-section'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useInterviewDetail } from '@/features/interviews/use-interview-detail'

export default function InterviewDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const {
    interview,
    results,
    loading,
    error,
    completing,
    uploadStates,
    fileInputRefs,
    setFileInputRef,
    handleUpload,
    handleComplete,
  } = useInterviewDetail(id)

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
        <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
          <AlertTitle>Interview unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          asChild
          variant="outline"
          className="rounded-full bg-white/75"
        >
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
    interview.answers.some((answer) => answer.questionIndex === qi && answer.status === 'submitted')
  )
  const isTerminal = interview.status === 'completed' || interview.status === 'failed'
  const canComplete = allAnswered && !isTerminal && interview.status !== 'processing'

  return (
    <main className="container space-y-8 py-10 md:space-y-10 md:py-12">
      <InterviewDetailHero
        interview={interview}
        results={results}
        completing={completing}
        isTerminal={isTerminal}
        canComplete={canComplete}
        onComplete={handleComplete}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        progressValue={progressValue}
      />

      {error ? (
        <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
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
            const uploadState = uploadStates[questionIndex] ?? { status: 'idle' }

            return (
              <InterviewQuestionCard
                key={question.id}
                question={question}
                questionIndex={questionIndex}
                answer={answer}
                uploadState={uploadState}
                isTerminal={isTerminal}
                interviewStatus={interview.status}
                onUploadClick={() => fileInputRefs.current[questionIndex]?.click()}
                onFileChange={() => handleUpload(questionIndex)}
                setFileInputRef={(element) => setFileInputRef(questionIndex, element)}
              />
            )
          })}
        </div>
      </section>

      {results ? <InterviewResultsSection results={results} /> : null}
    </main>
  )
}
