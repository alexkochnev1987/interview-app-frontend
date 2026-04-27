'use client'

import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import { Filter, Plus, Search, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { MetricPanel } from '@/components/app/metric-panel'
import { EmptyStateCard, LoadingStateCard } from '@/components/app/state-card'
import { QuestionCard } from '@/components/questions/question-card'
import { QuestionsToolbar } from '@/components/questions/questions-toolbar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
    <main className="container space-y-8 py-10 md:space-y-10 md:py-12">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/65 bg-white/88 shadow-float">
          <CardContent className="flex h-full flex-col gap-6 px-8 py-8">
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
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-primary-gradient px-5 shadow-soft hover:brightness-105"
              >
                <Link href="/questions/new">
                  <Plus className="size-4" />
                  New Question
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full bg-white/70 backdrop-blur-sm"
              >
                <Link href="/interviews/new">Build an interview</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
          <CardHeader>
            <EyebrowBadge icon={<Filter className="size-3.5" />} tone="muted">
              Overview
            </EyebrowBadge>
            <CardTitle className="text-2xl tracking-[-0.03em]">Library health</CardTitle>
            <CardDescription className="text-sm leading-6">
              The new surface emphasizes utility metadata and evaluation depth rather than generic
              admin cards.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <MetricPanel tone="elevated" label="Total questions" value={loading ? '...' : questions.length} />
            <MetricPanel tone="elevated" label="Visible now" value={loading ? '...' : filteredQuestions.length} />
          </CardContent>
        </Card>
      </section>

      {error && (
        <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
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
            <Button
              asChild
              className="rounded-full bg-primary-gradient px-5 shadow-soft hover:brightness-105"
            >
              <Link href="/questions/new">Create Question</Link>
            </Button>
          }
        />
      ) : (
        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </section>
      )}
    </main>
  )
}
