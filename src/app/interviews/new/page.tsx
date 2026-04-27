'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CirclePlus, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { CandidateBriefForm } from '@/components/interviews/new/candidate-brief-form'
import { MetricPanel } from '@/components/app/metric-panel'
import { QuestionSelector } from '@/components/interviews/new/question-selector'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuestions } from '@/hooks/use-questions'
import { createInterview } from '@/lib/api'

export default function NewInterviewPage() {
  const router = useRouter()
  const [candidateName, setCandidateName] = useState('')
  const [position, setPosition] = useState('')
  const { questions, loading: loadingQuestions, error: questionsError } = useQuestions()
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleQuestion(id: string) {
    setSelectedQuestionIds((current) =>
      current.includes(id)
        ? current.filter((questionId) => questionId !== id)
        : [...current, id]
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!candidateName.trim()) {
      setError('Candidate name is required.')
      return
    }
    if (!position.trim()) {
      setError('Position is required.')
      return
    }
    if (selectedQuestionIds.length === 0) {
      setError('Select at least one question.')
      return
    }

    setSubmitting(true)
    try {
      const interview = await createInterview({
        candidateName: candidateName.trim(),
        position: position.trim(),
        questionIds: selectedQuestionIds,
      })
      router.push(`/interviews/${interview.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create interview.')
      setSubmitting(false)
    }
  }
  return (
    <main className="container space-y-8 py-10 md:space-y-10 md:py-12">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/65 bg-white/88 shadow-float">
          <CardContent className="space-y-6 px-8 py-8">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
              Create Interview Flow
            </EyebrowBadge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                Assemble the candidate packet before you send the interview link.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Capture the role, choose only the questions that matter, and keep the decision
                criteria explicit before the recording session starts.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-primary-gradient px-5 shadow-soft hover:brightness-105"
              >
                <Link href="/questions/new">
                  <CirclePlus className="size-4" />
                  Create Question
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full bg-white/70 backdrop-blur-sm"
              >
                <Link href="/questions">Open Question Bank</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl tracking-[-0.03em]">Selection summary</CardTitle>
            <CardDescription className="text-sm leading-6">
              Keep the prompt set tight. Dense but intentional interviews score better than generic
              long-form sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <MetricPanel tone="elevated" label="Selected" value={selectedQuestionIds.length} />
            <MetricPanel
              tone="elevated"
              label="Available"
              value={loadingQuestions ? '...' : questions.length}
            />
          </CardContent>
        </Card>
      </section>

      {error ?? questionsError ? (
        <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
          <AlertTitle>Interview setup blocked</AlertTitle>
          <AlertDescription>{error ?? questionsError}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <CandidateBriefForm
          candidateName={candidateName}
          position={position}
          submitting={submitting}
          loadingQuestions={loadingQuestions}
          questionsCount={questions.length}
          onCandidateNameChange={setCandidateName}
          onPositionChange={setPosition}
        />

        <QuestionSelector
          questions={questions}
          selectedQuestionIds={selectedQuestionIds}
          loadingQuestions={loadingQuestions}
          submitting={submitting}
          onToggleQuestion={toggleQuestion}
        />
      </form>
    </main>
  )
}
