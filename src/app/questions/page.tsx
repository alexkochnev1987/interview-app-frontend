'use client'

import Link from 'next/link'
import { useDeferredValue, useEffect, useState } from 'react'
import { Filter, LoaderCircle, Plus, Search, Sparkles, Trash2 } from 'lucide-react'

import { ConfirmDialog } from '@/components/app/confirm-dialog'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  deleteQuestionsBulk,
  fetchQuestions,
  type BulkDeleteResult,
  type Question,
} from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { truncateText } from '@/lib/text'
import { cn } from '@/lib/utils'

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const deferredQuery = useDeferredValue(query)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkResult, setBulkResult] = useState<BulkDeleteResult | null>(null)
  const [bulkError, setBulkError] = useState<string | null>(null)
  const { user } = useAuth()
  const canDelete = user?.role === 'super_admin'

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

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function performBulkDelete() {
    if (bulkDeleting) return
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    setBulkDeleting(true)
    setBulkError(null)
    try {
      const result = await deleteQuestionsBulk(ids)
      const fresh = await fetchQuestions()
      setQuestions(fresh)
      setSelectedIds(new Set())
      setBulkConfirmOpen(false)
      setBulkResult(result)
    } catch (err) {
      setBulkError(
        err instanceof Error ? err.message : 'Bulk delete failed.',
      )
      setBulkConfirmOpen(false)
    } finally {
      setBulkDeleting(false)
    }
  }

  const selectedCount = selectedIds.size

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
            <div>
              <Button
                asChild
                className="h-14 rounded-full bg-primary-gradient px-8 text-base font-semibold shadow-soft hover:brightness-105"
              >
                <Link href="/questions/new">
                  <Plus className="size-5" />
                  New Question
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
          <CardContent className="flex h-full flex-col gap-6 px-8 py-8">
            <EyebrowBadge icon={<Filter className="size-3.5" />} tone="muted">
              Overview
            </EyebrowBadge>
            <div className="space-y-3">
              <CardTitle className="text-2xl tracking-[-0.03em]">Library health</CardTitle>
              <CardDescription className="text-sm leading-6">
                The new surface emphasizes utility metadata and evaluation depth rather than generic
                admin cards.
              </CardDescription>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricPanel tone="elevated" label="Total questions" value={loading ? '...' : questions.length} />
              <MetricPanel tone="elevated" label="Visible now" value={loading ? '...' : filteredQuestions.length} />
            </div>
          </CardContent>
        </Card>
      </section>

      {error && (
        <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
          <AlertTitle>Question feed unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-white/60 bg-white/86 py-2 shadow-soft">
        <CardContent
          className={cn(
            'grid items-center gap-4 px-6',
            canDelete ? 'md:grid-cols-[1fr_220px_auto]' : 'md:grid-cols-[1fr_220px]',
          )}
        >
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
          {canDelete && (
            <Button
              type="button"
              variant="destructive"
              className="h-12 rounded-full px-5 md:shrink-0"
              disabled={selectedCount === 0 || bulkDeleting}
              onClick={() => {
                setBulkError(null)
                setBulkResult(null)
                setBulkConfirmOpen(true)
              }}
            >
              {bulkDeleting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {bulkDeleting
                ? 'Deleting...'
                : selectedCount > 0
                  ? `Delete selected (${selectedCount})`
                  : 'Delete selected'}
            </Button>
          )}
        </CardContent>
      </Card>

      {canDelete && bulkError && (
        <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
          <AlertTitle>Bulk delete failed</AlertTitle>
          <AlertDescription>{bulkError}</AlertDescription>
        </Alert>
      )}

      {canDelete && bulkResult && bulkResult.blocked.length > 0 && (
        <Alert className="border-amber-200/70 bg-amber-50/85">
          <AlertTitle>
            Deleted {bulkResult.deleted.length}, blocked {bulkResult.blocked.length}
          </AlertTitle>
          <AlertDescription>
            <p className="mb-2">These questions are used in active interviews and were not deleted:</p>
            <ul className="list-disc space-y-1 pl-5">
              {bulkResult.blocked.map((item) => (
                <li key={item.id}>
                  <span className="font-medium">{truncateText(item.questionText, 80)}</span>
                  {' — '}
                  <span className="text-muted-foreground">{item.reason}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {canDelete && bulkResult && bulkResult.blocked.length === 0 && bulkResult.deleted.length > 0 && (
        <Alert className="border-emerald-200/70 bg-emerald-50/85">
          <AlertTitle>Deleted {bulkResult.deleted.length} question(s)</AlertTitle>
          <AlertDescription>The library is up to date.</AlertDescription>
        </Alert>
      )}

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
          {filteredQuestions.map((question) => {
            const isSelected = selectedIds.has(question.id)
            return (
            <div key={question.id} className="group relative">
              {canDelete && (
                <span
                  className="absolute right-4 top-4 z-10 transition-transform duration-200 group-hover:-translate-y-1"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelected(question.id)}
                    aria-label="Select question for bulk delete"
                    className="size-5 bg-white"
                  />
                </span>
              )}
              <Link href={`/questions/${question.id}`} className="no-underline">
              <Card
                className={cn(
                  'h-full border-white/65 bg-white/88 transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-float',
                  question.deleted && 'border-rose-200/70 bg-rose-50/55 opacity-80',
                  isSelected && canDelete && 'ring-2 ring-rose-400/70',
                )}
              >
                <CardHeader className="space-y-4">
                  <div
                    className={cn(
                      'flex flex-wrap items-center gap-2',
                      canDelete && 'pr-8',
                    )}
                  >
                    {question.deleted ? (
                      <StatusPill tone="failed">Deleted</StatusPill>
                    ) : null}
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
            </div>
            )
          })}
        </section>
      )}

      <ConfirmDialog
        open={bulkConfirmOpen}
        destructive
        title={`Delete ${selectedCount} question${selectedCount === 1 ? '' : 's'}?`}
        description="Selected questions will be hidden from the library and from new interviews. Past interviews keep their snapshot. Questions used by active interviews will be skipped."
        confirmLabel={bulkDeleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        loading={bulkDeleting}
        onConfirm={performBulkDelete}
        onCancel={() => {
          if (!bulkDeleting) setBulkConfirmOpen(false)
        }}
      />
    </main>
  )
}
