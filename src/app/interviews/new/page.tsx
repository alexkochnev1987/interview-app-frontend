'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, BriefcaseBusiness, CirclePlus, Sparkles, UserRound } from 'lucide-react'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { FormField } from '@/components/ui/form-field'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { IconAffix } from '@/components/ui/icon-affix'
import { MetricPanel } from '@/components/ui/metric-panel'
import { SelectableTile } from '@/components/ui/selectable-tile'
import { StatusPill } from '@/components/ui/status-pill'
import { EmptyStateCard, LoadingStateCard } from '@/components/ui/state-card'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Input } from '@/components/ui/input'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { createInterview, fetchQuestions, type Question } from '@/lib/api'
import { runMutation } from '@/lib/run-mutation'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

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
    let interview: Awaited<ReturnType<typeof createInterview>> | null = null

    try {
      interview = await runMutation(
        () =>
          createInterview({
            candidateName: candidateName.trim(),
            position: position.trim(),
            questionIds: selectedQuestionIds,
          }),
        {
          successMessage: TOAST_MESSAGES.interview.createSuccess,
          errorMessage: TOAST_MESSAGES.interview.createError,
        }
      )
    } catch {
      interview = null
    } finally {
      setSubmitting(false)
    }

    if (interview) {
      router.push(`/interviews/${interview.id}`)
    }

  }

  const selectedQuestions = questions.filter((question) => selectedQuestionIds.includes(question.id))

  return (
    <PageShell>
      <Grid as="section" columns="split-12-8" gap={6}>
        <Card variant="floating" size="lg">
          <CardContent spacing="xl">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
              Create Interview Flow
            </EyebrowBadge>
            <Stack gap={3}>
              <HeroTitle>
                Assemble the candidate packet before you send the interview link.
              </HeroTitle>
              <HeroLead width="prose">
                Capture the role, choose only the questions that matter, and keep the decision
                criteria explicit before the recording session starts.
              </HeroLead>
            </Stack>
            <Inline gap={3} wrap="wrap">
              <Button asChild variant="gradient">
                <Link href="/questions/new">
                  <CirclePlus className="size-4" />
                  Create Question
                </Link>
              </Button>
              <Button asChild variant="outline-pill" shape="pill">
                <Link href="/questions">Open Question Bank</Link>
              </Button>
            </Inline>
          </CardContent>
        </Card>

        <Card variant="tinted">
          <CardHeader spacing="xs">
            <CardTitle size="lg">Selection summary</CardTitle>
            <CardDescription>
              Keep the prompt set tight. Dense but intentional interviews score better than generic
              long-form sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Grid columns="metrics-2-md" gap={4}>
              <MetricPanel tone="elevated" label="Selected" value={selectedQuestionIds.length} />
              <MetricPanel
                tone="elevated"
                label="Available"
                value={loadingQuestions ? '...' : questions.length}
              />
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {error ? (
        <Alert variant="danger">
          <AlertTitle>Interview setup blocked</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit}>
        <Grid columns="split-72-128" gap={6}>
          <Card variant="surface">
            <CardHeader spacing="xs">
              <CardTitle size="lg">Candidate brief</CardTitle>
              <CardDescription>
                This metadata will anchor the scoring context once answers arrive.
              </CardDescription>
            </CardHeader>
            <CardContent spacing="lg">
              <FormField htmlFor="candidateName" label="Candidate name">
                <IconAffix icon={<UserRound className="size-4" />}>
                  <Input
                    id="candidateName"
                    iconAffix="leading"
                    value={candidateName}
                    onChange={(event) => setCandidateName(event.target.value)}
                    placeholder="e.g. Jane Doe"
                    disabled={submitting}
                  />
                </IconAffix>
              </FormField>

              <FormField htmlFor="position" label="Position">
                <IconAffix icon={<BriefcaseBusiness className="size-4" />}>
                  <Input
                    id="position"
                    iconAffix="leading"
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    disabled={submitting}
                  />
                </IconAffix>
              </FormField>

              <MetricPanel
                label="Ready to send"
                description="Once the interview is created, the candidate flow can start uploading answers immediately against this curated question packet."
              />
              <Button
                type="submit"
                variant="gradient"
                width="full"
                disabled={submitting || loadingQuestions || questions.length === 0}
              >
                {submitting ? 'Creating...' : 'Create Interview'}
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>

          <Card variant="surface">
            <CardHeader spacing="xs">
              <Inline gap={4} align="start" justify="between">
                <Stack gap={1.5}>
                  <CardTitle size="lg">Question selection</CardTitle>
                  <CardDescription>
                    Pick the prompts that actually differentiate the candidate.
                  </CardDescription>
                </Stack>
                <StatusPill tone="neutral">{selectedQuestionIds.length} selected</StatusPill>
              </Inline>
            </CardHeader>
            <CardContent spacing="md">
              {loadingQuestions ? (
                <LoadingStateCard tone="ghost" label="Loading question bank..." />
              ) : questions.length === 0 ? (
                <EmptyStateCard
                  tone="ghost"
                  title="No saved questions yet"
                  description="Create the first reusable prompt before you assemble an interview packet."
                  action={
                    <Button asChild variant="gradient">
                      <Link href="/questions/new">Create your first question</Link>
                    </Button>
                  }
                />
              ) : (
                <Stack gap={3}>
                  {questions.map((question) => {
                    const selected = selectedQuestionIds.includes(question.id)

                    return (
                      <SelectableTile key={question.id} selected={selected}>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleQuestion(question.id)}
                          disabled={submitting}
                          align="top"
                        />

                        <Stack gap={3} grow="fill">
                          <Inline gap={2} align="center" wrap="wrap">
                            <StatusPill tone={question.difficulty}>{question.difficulty}</StatusPill>
                            {question.category ? (
                              <StatusPill tone="neutral" casing="chip">
                                {question.category}
                              </StatusPill>
                            ) : null}
                          </Inline>

                          <Stack gap={1.5}>
                            <SectionHeading size="prompt" as="h3">
                              {question.questionText}
                            </SectionHeading>
                            <BodyText size="sm">
                              {question.role ? `${question.role} · ` : ''}
                              weight {question.weight}
                            </BodyText>
                          </Stack>

                          <Grid columns="metrics-2-md" gap={3}>
                            <Stack gap={2}>
                              <EyebrowLabel>Concepts</EyebrowLabel>
                              <BodyText size="sm">
                                {question.expectedConcepts.length > 0
                                  ? question.expectedConcepts.map((item) => item.label).join(', ')
                                  : 'Not specified'}
                              </BodyText>
                            </Stack>
                            <Stack gap={2}>
                              <EyebrowLabel>Red flags</EyebrowLabel>
                              <BodyText size="sm">
                                {question.redFlags.length > 0
                                  ? question.redFlags.map((item) => item.label).join(', ')
                                  : 'Not specified'}
                              </BodyText>
                            </Stack>
                          </Grid>
                        </Stack>
                      </SelectableTile>
                    )
                  })}
                </Stack>
              )}

              {selectedQuestions.length > 0 ? (
                <SurfaceTile>
                  <Stack gap={2}>
                    <EyebrowLabel>Current packet</EyebrowLabel>
                    <BodyText size="sm">
                      {selectedQuestions.map((question) => question.questionText).join(' · ')}
                    </BodyText>
                  </Stack>
                </SurfaceTile>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </form>
    </PageShell>
  )
}
