'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CirclePlus, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { InterviewSetupFormGrid, TwoPanelHeroGrid, TwoUpSmGrid } from '@/components/layout/grid-layouts'
import { CandidateBriefForm } from '@/components/interviews/new/candidate-brief-form'
import { MetricPanel } from '@/components/app/metric-panel'
import { SurfaceCard } from '@/components/app/surface-card'
import { QuestionSelector } from '@/components/interviews/new/question-selector'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ActionRow, CardContentSpacious, HeroDescription, HeroTitle, SectionCardTitle } from '@/components/layout/content-presets'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageMainWideGap } from '@/components/layout/page-shell'
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
    <PageMainWideGap>
      <TwoPanelHeroGrid>
        <SurfaceCard tone="glassFloat">
          <CardContentSpacious>
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
              Create Interview Flow
            </EyebrowBadge>
            <div className="space-y-3">
              <HeroTitle>Assemble the candidate packet before you send the interview link.</HeroTitle>
              <HeroDescription>
                Capture the role, choose only the questions that matter, and keep the decision
                criteria explicit before the recording session starts.
              </HeroDescription>
            </div>
            <ActionRow>
              <Button asChild variant="gradient">
                <Link href="/questions/new">
                  <CirclePlus className="size-4" />
                  Create Question
                </Link>
              </Button>
              <Button
                asChild
                variant="outline-soft"
              >
                <Link href="/questions">Open Question Bank</Link>
              </Button>
            </ActionRow>
          </CardContentSpacious>
        </SurfaceCard>

        <SurfaceCard tone="mutedSoft">
          <CardHeader>
            <SectionCardTitle>Selection summary</SectionCardTitle>
            <CardDescription className="text-sm leading-6">
              Keep the prompt set tight. Dense but intentional interviews score better than generic
              long-form sessions.
            </CardDescription>
          </CardHeader>
          <TwoUpSmGrid>
            <MetricPanel tone="elevated" label="Selected" value={selectedQuestionIds.length} />
            <MetricPanel
              tone="elevated"
              label="Available"
              value={loadingQuestions ? '...' : questions.length}
            />
          </TwoUpSmGrid>
        </SurfaceCard>
      </TwoPanelHeroGrid>

      {error ?? questionsError ? (
        <Alert variant="destructive">
          <AlertTitle>Interview setup blocked</AlertTitle>
          <AlertDescription>{error ?? questionsError}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit}>
        <InterviewSetupFormGrid>
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
        </InterviewSetupFormGrid>
      </form>
    </PageMainWideGap>
  )
}
