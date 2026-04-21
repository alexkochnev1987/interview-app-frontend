'use client'

import Link from 'next/link'
import { useDeferredValue, useEffect, useState } from 'react'
import { Filter, Plus, Search, Sparkles } from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { MetricPanel } from '@/components/app/metric-panel'
import { StatusPill } from '@/components/app/status-pill'
import { EmptyStateCard, LoadingStateCard } from '@/components/app/state-card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchQuestions, type Question } from '@/lib/api'
import { truncateText } from '@/lib/text'

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchQuestions()
        if (!cancelled) {
          setQuestions(data)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load questions.')
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const normalizedQuery = deferredQuery.trim().toLowerCase()
  const filteredQuestions = questions.filter((question) => {
    const matchesDifficulty = difficulty === 'all' || question.difficulty === difficulty
    if (!matchesDifficulty) {
      return false
    }

    if (!normalizedQuery) {
      return true
    }

    const haystack = [
      question.questionText,
      question.role ?? '',
      question.category ?? '',
      question.subcategory ?? '',
      question.tags.join(' '),
      question.expectedConcepts.map((item) => item.label).join(' '),
      question.redFlags.map((item) => item.label).join(' '),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery)
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

      <Card className="border-white/60 bg-white/86 shadow-soft">
        <CardContent className="grid gap-4 px-6 py-6 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by prompt, role, category, concept, or red flag"
              className="h-12 rounded-full border-white/70 bg-[hsl(var(--surface-low)/0.8)] pl-11 shadow-none"
            />
          </div>
          <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyFilter)}>
            <SelectTrigger className="h-12 w-full rounded-full border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 shadow-none">
              <SelectValue placeholder="All difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

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
            <Link key={question.id} href={`/questions/${question.id}`} className="group no-underline">
              <Card className="h-full border-white/65 bg-white/88 transition-transform duration-200 hover:-translate-y-1 hover:shadow-float">
                <CardHeader className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={question.difficulty}>{question.difficulty}</StatusPill>
                    {question.category ? (
                      <StatusPill tone="neutral" className="normal-case tracking-[0.08em]">
                        {question.category}
                      </StatusPill>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="line-clamp-3 text-lg leading-7 tracking-[-0.03em]">
                      {truncateText(question.questionText)}
                    </CardTitle>
                    <CardDescription>
                      {question.role ? `${question.role} · ` : ''}
                      weight {question.weight}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <MetricPanel
                      tone="compact"
                      label="Concepts"
                      value={question.expectedConcepts.length}
                      valueClassName="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground"
                    />
                    <MetricPanel
                      tone="compact"
                      label="Red flags"
                      value={question.redFlags.length}
                      valueClassName="mt-2 text-xl font-semibold tracking-[-0.03em] text-foreground"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Expected concepts
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {question.expectedConcepts.length > 0
                          ? question.expectedConcepts
                              .slice(0, 3)
                              .map((item) => item.label)
                              .join(', ')
                          : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Red flag signals
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {question.redFlags.length > 0
                          ? question.redFlags
                              .slice(0, 2)
                              .map((item) => item.label)
                              .join(', ')
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}
    </main>
  )
}
