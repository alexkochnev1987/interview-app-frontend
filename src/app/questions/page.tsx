'use client'

import Link from 'next/link'
import { useDeferredValue, useEffect, useState } from 'react'
import { Search } from 'lucide-react'

import { ConfirmDialog } from '@/components/app/confirm-dialog'
import { EmptyStateCard, LoadingStateCard } from '@/components/app/state-card'
import { CardGrid } from '@/components/layout/card-grid'
import { PageShell } from '@/components/layout/page-shell'
import { BulkDeleteResultAlerts } from '@/components/questions/library/bulk-delete-result-alerts'
import { QuestionCard } from '@/components/questions/library/question-card'
import { QuestionsLibraryHeader } from '@/components/questions/library/questions-library-header'
import {
  QuestionsLibraryToolbar,
  type DifficultyFilter,
} from '@/components/questions/library/questions-library-toolbar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  deleteQuestionsBulk,
  fetchQuestions,
  type BulkDeleteResult,
  type Question,
} from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

function matchesQuery(question: Question, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true
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
}

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
    if (difficulty !== 'all' && question.difficulty !== difficulty) return false
    return matchesQuery(question, normalizedQuery)
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
      setBulkError(err instanceof Error ? err.message : 'Bulk delete failed.')
      setBulkConfirmOpen(false)
    } finally {
      setBulkDeleting(false)
    }
  }

  const selectedCount = selectedIds.size

  return (
    <PageShell>
      <QuestionsLibraryHeader
        loading={loading}
        totalCount={questions.length}
        visibleCount={filteredQuestions.length}
      />

      {error && (
        <Alert variant="danger">
          <AlertTitle>Question feed unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <QuestionsLibraryToolbar
        query={query}
        onQueryChange={setQuery}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        canBulkDelete={canDelete}
        selectedCount={selectedCount}
        bulkDeleting={bulkDeleting}
        onRequestBulkDelete={() => {
          setBulkError(null)
          setBulkResult(null)
          setBulkConfirmOpen(true)
        }}
      />

      {canDelete && (
        <BulkDeleteResultAlerts result={bulkResult} error={bulkError} />
      )}

      {loading ? (
        <LoadingStateCard label="Loading questions..." />
      ) : filteredQuestions.length === 0 ? (
        <EmptyStateCard
          icon={<Search className="size-5" />}
          title={
            questions.length === 0
              ? 'No saved questions yet'
              : 'No questions match the current filters'
          }
          description={
            questions.length === 0
              ? 'Create your first reusable prompt and start building a structured question bank.'
              : 'Try widening the search or reset the difficulty filter to bring more prompts back in.'
          }
          action={
            <Button asChild variant="gradient" className="px-5">
              <Link href="/questions/new">Create Question</Link>
            </Button>
          }
        />
      ) : (
        <CardGrid>
          {filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              selectable={canDelete}
              selected={selectedIds.has(question.id)}
              onToggleSelected={toggleSelected}
            />
          ))}
        </CardGrid>
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
    </PageShell>
  )
}
