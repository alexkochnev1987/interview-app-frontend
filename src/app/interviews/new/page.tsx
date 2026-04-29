'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, BriefcaseBusiness, CirclePlus, Sparkles, UserRound } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { EyebrowLabel } from '@/components/app/eyebrow-label'
import { HeroLead, HeroTitle } from '@/components/app/hero-text'
import { MetricPanel } from '@/components/app/metric-panel'
import { StatusPill } from '@/components/app/status-pill'
import { EmptyStateCard, LoadingStateCard } from '@/components/app/state-card'
import { SurfaceTile } from '@/components/app/surface-tile'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createInterview, fetchQuestions, type Question } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function NewInterviewPage() {
  const router = useRouter()
  const [candidateName, setCandidateName] = useState('')
  const [position, setPosition] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadQuestions() {
      try {
        const data = await fetchQuestions()
        if (!cancelled) {
          setQuestions(data)
          setLoadingQuestions(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load questions.')
          setLoadingQuestions(false)
        }
      }
    }

    loadQuestions()
    return () => {
      cancelled = true
    }
  }, [])

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

  const selectedQuestions = questions.filter((question) => selectedQuestionIds.includes(question.id))

  return (
    <main className="container space-y-8 py-10 md:space-y-10 md:py-12">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card variant="floating">
          <CardContent className="space-y-6 px-8 py-8">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
              Create Interview Flow
            </EyebrowBadge>
            <div className="space-y-3">
              <HeroTitle>
                Assemble the candidate packet before you send the interview link.
              </HeroTitle>
              <HeroLead className="max-w-2xl">
                Capture the role, choose only the questions that matter, and keep the decision
                criteria explicit before the recording session starts.
              </HeroLead>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="gradient" className="px-5">
                <Link href="/questions/new">
                  <CirclePlus className="size-4" />
                  Create Question
                </Link>
              </Button>
              <Button asChild variant="outline-pill" shape="pill">
                <Link href="/questions">Open Question Bank</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="tinted">
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

      {error ? (
        <Alert variant="danger">
          <AlertTitle>Interview setup blocked</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <Card variant="surface">
          <CardHeader>
            <CardTitle className="text-2xl tracking-[-0.03em]">Candidate brief</CardTitle>
            <CardDescription className="text-sm leading-6">
              This metadata will anchor the scoring context once answers arrive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="candidateName">Candidate name</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="candidateName"
                  value={candidateName}
                  onChange={(event) => setCandidateName(event.target.value)}
                  placeholder="e.g. Jane Doe"
                  disabled={submitting}
                  className="pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <div className="relative">
                <BriefcaseBusiness className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="position"
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  disabled={submitting}
                  className="pl-11"
                />
              </div>
            </div>

            <MetricPanel
              label="Ready to send"
              description="Once the interview is created, the candidate flow can start uploading answers immediately against this curated question packet."
              value={null}
              valueClassName="mt-0"
            />
            <div>
              <Button
                type="submit"
                variant="gradient"
                disabled={submitting || loadingQuestions || questions.length === 0}
                className="mt-5 w-full"
              >
                {submitting ? 'Creating...' : 'Create Interview'}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="surface">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl tracking-[-0.03em]">Question selection</CardTitle>
              <CardDescription className="text-sm leading-6">
                Pick the prompts that actually differentiate the candidate.
              </CardDescription>
            </div>
            <StatusPill tone="neutral">{selectedQuestionIds.length} selected</StatusPill>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingQuestions ? (
              <LoadingStateCard
                className="border-none bg-transparent shadow-none"
                label="Loading question bank..."
              />
            ) : questions.length === 0 ? (
              <EmptyStateCard
                className="border-none bg-transparent shadow-none"
                title="No saved questions yet"
                description="Create the first reusable prompt before you assemble an interview packet."
                action={
                  <Button asChild variant="gradient" className="px-5">
                    <Link href="/questions/new">Create your first question</Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {questions.map((question) => {
                  const selected = selectedQuestionIds.includes(question.id)

                  return (
                    <label
                      key={question.id}
                      className={cn(
                        'flex cursor-pointer gap-4 rounded-3xl p-4 ring-1 transition-all',
                        selected
                          ? 'bg-[hsl(var(--primary-fixed)/0.86)] shadow-soft ring-[hsl(var(--primary)/0.24)]'
                          : 'bg-surface-low-soft ring-hairline hover:bg-surface-low-glass',
                      )}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleQuestion(question.id)}
                        disabled={submitting}
                        className="mt-1"
                      />

                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusPill tone={question.difficulty}>{question.difficulty}</StatusPill>
                          {question.category ? (
                            <StatusPill tone="neutral" className="normal-case tracking-[0.08em]">
                              {question.category}
                            </StatusPill>
                          ) : null}
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-base font-semibold tracking-[-0.02em] text-foreground">
                            {question.questionText}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {question.role ? `${question.role} · ` : ''}
                            weight {question.weight}
                          </div>
                        </div>

                        <div className="grid gap-3 text-sm md:grid-cols-2">
                          <div>
                            <EyebrowLabel>Concepts</EyebrowLabel>
                            <p className="mt-2 leading-6 text-muted-foreground">
                              {question.expectedConcepts.length > 0
                                ? question.expectedConcepts.map((item) => item.label).join(', ')
                                : 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <EyebrowLabel>Red flags</EyebrowLabel>
                            <p className="mt-2 leading-6 text-muted-foreground">
                              {question.redFlags.length > 0
                                ? question.redFlags.map((item) => item.label).join(', ')
                                : 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}

            {selectedQuestions.length > 0 ? (
              <SurfaceTile>
                <EyebrowLabel>Current packet</EyebrowLabel>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {selectedQuestions.map((question) => question.questionText).join(' · ')}
                </p>
              </SurfaceTile>
            ) : null}
          </CardContent>
        </Card>
      </form>
    </main>
  )
}
