'use client'

import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import { Filter, Plus, Search, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { MetricPanel } from '@/components/app/metric-panel'
import { SurfaceCard } from '@/components/app/surface-card'
import { ThreeColumnCardsGrid, TwoPanelHeroGrid } from '@/components/layout/grid-layouts'
import { ActionRow, CardContentHero, SectionCardTitle } from '@/components/layout/content-presets'
import { PageMainWideGap } from '@/components/layout/page-shell'
import { EmptyStateCard, LoadingStateCard } from '@/components/app/state-card'
import { QuestionCard } from '@/components/questions/question-card'
import { QuestionsToolbar } from '@/components/questions/questions-toolbar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { filterQuestions, type DifficultyFilter } from '@/features/questions/filter-questions'
import { useQuestions } from '@/hooks/use-questions'

export default function QuestionsPage() {
  const { questions, loading, error } = useQuestions()
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const deferredQuery = useDeferredValue(query)

  const filteredQuestions = filterQuestions({
    questions,
    query: deferredQuery,
    difficulty,
  })

  return (
    <PageMainWideGap>
      <TwoPanelHeroGrid>
        <SurfaceCard tone="glassFloat">
          <CardContentHero>
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
              Question Library
            </EyebrowBadge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                Curate the question bank before AI scoring ever sees a candidate.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Store reusable prompts, codify expected concepts and red flags, and keep your
                evaluation rubric visible instead of buried in JSON.
              </p>
            </div>
            <ActionRow>
              <Button asChild variant="gradient">
                <Link href="/questions/new">
                  <Plus className="size-4" />
                  New Question
                </Link>
              </Button>
              <Button
                asChild
                variant="outline-soft"
              >
                <Link href="/interviews/new">Build an interview</Link>
              </Button>
            </ActionRow>
          </CardContentHero>
        </SurfaceCard>

        <SurfaceCard tone="mutedSoft">
          <CardHeader>
            <EyebrowBadge icon={<Filter className="size-3.5" />} tone="muted">
              Overview
            </EyebrowBadge>
            <SectionCardTitle>Library health</SectionCardTitle>
            <CardDescription className="text-sm leading-6">
              The new surface emphasizes utility metadata and evaluation depth rather than generic
              admin cards.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <MetricPanel tone="elevated" label="Total questions" value={loading ? '...' : questions.length} />
            <MetricPanel tone="elevated" label="Visible now" value={loading ? '...' : filteredQuestions.length} />
          </CardContent>
        </SurfaceCard>
      </TwoPanelHeroGrid>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Question feed unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <QuestionsToolbar
        query={query}
        difficulty={difficulty}
        onQueryChange={setQuery}
        onDifficultyChange={setDifficulty}
      />

      {loading ? (
        <LoadingStateCard label="Loading questions..." />
      ) : filteredQuestions.length === 0 ? (
        <EmptyStateCard
          icon={<Search className="size-5" />}
          title={questions.length === 0 ? 'No saved questions yet' : 'No questions match the current filters'}
          description={
            questions.length === 0
              ? 'Create your first reusable prompt and start building a structured question bank.'
              : 'Try widening the search or reset the difficulty filter to bring more prompts back in.'
          }
          action={
            <Button asChild variant="gradient">
              <Link href="/questions/new">Create Question</Link>
            </Button>
          }
        />
      ) : (
        <ThreeColumnCardsGrid>
          {filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </ThreeColumnCardsGrid>
      )}
    </PageMainWideGap>
  )
}
