'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { LoaderCircle, Search, Trash2 } from 'lucide-react'

import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyStateCard, LoadingStateCard } from '@/components/ui/state-card'
import { CardGrid } from '@/components/ui/layout/card-grid'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { PageShell } from '@/components/ui/layout/page-shell'
import { BulkDeleteResultAlerts } from '@/components/questions/library/bulk-delete-result-alerts'
import { QuestionCard } from '@/components/questions/library/question-card'
import { QuestionsLibraryHeader } from '@/components/questions/library/questions-library-header'
import {
  buildActiveFilterChips,
  QuestionFacetSidebar,
  QuestionPagination,
  QuestionPickerToolbar,
  useQuestionFacets,
  useQuestionsQuery,
} from '@/components/questions/picker'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { deleteQuestionsBulk, type BulkDeleteResult } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { runMutation } from '@/lib/run-mutation'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

export default function QuestionsPage() {
  return (
    <Suspense fallback={<PageShell><LoadingStateCard label="Loading questions..." /></PageShell>}>
      <QuestionsPageContent />
    </Suspense>
  )
}

function QuestionsPageContent() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  const query = useQuestionsQuery({ syncUrl: true })
  const facetsResult = useQuestionFacets(query.state, query.debouncedQ)
  const facets = facetsResult.facets

  const activeChips = buildActiveFilterChips(
    query.state,
    {
      setDifficulty: query.setDifficulty,
      setCategory: query.setCategory,
      setSubcategory: query.setSubcategory,
      setRole: query.setRole,
      setTags: query.setTags,
      setStatus: query.setStatus,
    },
    { showStatusFilter: isSuperAdmin },
  )

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkResult, setBulkResult] = useState<BulkDeleteResult | null>(null)
  const [bulkError, setBulkError] = useState<string | null>(null)

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
      const result = await runMutation(
        () => deleteQuestionsBulk(ids),
        {
          getSuccessMessage: ({ deleted, blocked }) => {
            if (deleted.length === 0 && blocked.length > 0) {
              return TOAST_MESSAGES.question.bulkDeleteNoopSuccess
            }
            if (deleted.length > 0 && blocked.length > 0) {
              return TOAST_MESSAGES.question.bulkDeletePartialSuccess
            }
            return TOAST_MESSAGES.question.bulkDeleteSuccess
          },
          errorMessage: TOAST_MESSAGES.question.bulkDeleteError,
        }
      )
      setSelectedIds(new Set())
      setBulkConfirmOpen(false)
      setBulkResult(result)
      query.refetch()
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : 'Bulk delete failed.')
      setBulkConfirmOpen(false)
    } finally {
      setBulkDeleting(false)
    }
  }

  const selectedCount = selectedIds.size
  const showEmptyState = !query.loading && query.items.length === 0
  const allEmpty =
    showEmptyState &&
    query.total === 0 &&
    query.state.q === '' &&
    !query.state.difficulty &&
    !query.state.category &&
    !query.state.subcategory &&
    !query.state.role &&
    query.state.tags.length === 0 &&
    query.state.status === 'active'

  return (
    <PageShell>
      <QuestionsLibraryHeader
        loading={query.loading}
        totalCount={query.total}
        visibleCount={query.items.length}
      />

      <Grid columns="aside-22-left" gap={6}>
        <QuestionFacetSidebar
          difficulties={facets.difficulties}
          categories={facets.categories}
          subcategories={facets.subcategories}
          roles={facets.roles}
          tags={facets.tags}
          selected={{
            difficulty: query.state.difficulty,
            category: query.state.category,
            subcategory: query.state.subcategory,
            role: query.state.role,
            tags: query.state.tags,
            status: query.state.status,
          }}
          onDifficultyChange={query.setDifficulty}
          onCategoryChange={query.setCategory}
          onSubcategoryChange={query.setSubcategory}
          onRoleChange={query.setRole}
          onTagsChange={query.setTags}
          onStatusChange={query.setStatus}
          onReset={query.reset}
          canReset={query.canReset}
          showStatusFilter={isSuperAdmin}
          loading={facetsResult.loading}
          error={facetsResult.error}
          onRetry={facetsResult.retry}
        />

        <Stack gap={4}>
          {query.error ? (
            <Alert variant="danger">
              <AlertTitle>Question feed unavailable</AlertTitle>
              <AlertDescription>
                <Inline gap={3} align="center" wrap="wrap">
                  <span>{query.error}</span>
                  <Button type="button" variant="outline-pill" shape="pill" size="sm" onClick={query.refetch}>
                    Retry
                  </Button>
                </Inline>
              </AlertDescription>
            </Alert>
          ) : null}

          <QuestionPickerToolbar
            q={query.state.q}
            onQChange={query.setQ}
            sortBy={query.state.sortBy}
            sortOrder={query.state.sortOrder}
            onSortChange={query.setSort}
            activeChips={activeChips}
            resultCount={query.total}
            loading={query.loading}
            bulkActions={
              isSuperAdmin ? (
                <Button
                  type="button"
                  variant="destructive"
                  shape="pill"
                  size="xl"
                  disabled={selectedCount === 0 || bulkDeleting}
                  onClick={() => {
                    setBulkError(null)
                    setBulkResult(null)
                    setBulkConfirmOpen(true)
                  }}
                >
                  {bulkDeleting ? (
                    <Icon size="md" spinning><LoaderCircle /></Icon>
                  ) : (
                    <Icon size="md"><Trash2 /></Icon>
                  )}
                  {bulkDeleting
                    ? 'Deleting...'
                    : selectedCount > 0
                      ? `Delete selected (${selectedCount})`
                      : 'Delete selected'}
                </Button>
              ) : null
            }
          />

          {isSuperAdmin && (
            <BulkDeleteResultAlerts result={bulkResult} error={bulkError} />
          )}

          {query.loading && query.items.length === 0 ? (
            <LoadingStateCard label="Loading questions..." />
          ) : showEmptyState ? (
            <EmptyStateCard
              icon={<Search className="size-5" />}
              title={allEmpty ? 'No saved questions yet' : 'No questions match the current filters'}
              description={
                allEmpty
                  ? 'Create your first reusable prompt and start building a structured question bank.'
                  : 'Try widening the search, clearing a filter, or resetting back to defaults.'
              }
              action={
                allEmpty ? (
                  <Button asChild variant="gradient">
                    <Link href="/questions/new">Create Question</Link>
                  </Button>
                ) : (
                  <Button type="button" variant="outline-pill" shape="pill" onClick={query.reset}>
                    Reset filters
                  </Button>
                )
              }
            />
          ) : (
            <CardGrid>
              {query.items.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  selectable={isSuperAdmin}
                  selected={selectedIds.has(question.id)}
                  onToggleSelected={toggleSelected}
                />
              ))}
            </CardGrid>
          )}

          <QuestionPagination
            page={query.state.page}
            totalPages={query.totalPages}
            total={query.total}
            limit={query.state.limit}
            onPageChange={query.setPage}
          />
        </Stack>
      </Grid>

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
