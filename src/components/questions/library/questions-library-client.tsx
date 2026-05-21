'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle, PanelLeftClose, PanelLeftOpen, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { questionsRootQueryKey } from '@/components/questions/picker/query-keys'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CardGrid } from '@/components/ui/layout/card-grid'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BulkDeleteResultAlerts } from '@/components/questions/library/bulk-delete-result-alerts'
import { InfiniteCardsLoader } from '@/components/questions/library/infinite-cards-loader'
import { QuestionCard } from '@/components/questions/library/question-card'
import { QuestionTable } from '@/components/questions/library/question-table'
import { QuestionsLibraryHeader } from '@/components/questions/library/questions-library-header'
import {
  buildActiveFilterChips,
  pickQuestionsViewSource,
  QuestionFacetSidebar,
  QuestionPickerFeed,
  QuestionPickerRefetchAlert,
  QuestionPickerToolbar,
  QuestionViewToggle,
  useQuestionFacets,
  useQuestionsInfinite,
  useQuestionsQuery,
} from '@/components/questions/picker'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Pagination } from '@/components/ui/pagination'
import { deleteQuestionsBulk, type BulkDeleteResult, type Question } from '@/lib/api'
import type { QuestionsLibraryPrefetch } from '@/lib/questions-library-prefetch'
import { notifyBulkDeleteOutcome } from '@/lib/notify-bulk-delete'
import { notifyError } from '@/lib/toast'
import { runMutation } from '@/lib/run-mutation'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

type QuestionsLibraryClientProps = {
  isSuperAdmin: boolean
  initialPrefetch?: QuestionsLibraryPrefetch
}

export function QuestionsLibraryClient({
  isSuperAdmin,
  initialPrefetch,
}: QuestionsLibraryClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const query = useQuestionsQuery({
    initial: initialPrefetch?.queryState,
    serverHydrated: Boolean(initialPrefetch),
    syncUrl: true,
    lockStatus: isSuperAdmin ? undefined : 'active',
    disableFetchInCardsView: true,
  })
  const isCardsView = query.state.view === 'cards'
  const {
    difficulty, category, subcategory, role, tags, status,
    sortBy, sortOrder, limit,
  } = query.state
  const { debouncedQ } = query
  const cardsInfiniteParams = useMemo(() => ({
    q: debouncedQ || undefined,
    difficulty,
    category,
    subcategory,
    tags: tags.length > 0 ? tags : undefined,
    role,
    status,
    sortBy,
    sortOrder,
    limit,
  }), [
    difficulty, category, subcategory, role, tags, status,
    sortBy, sortOrder, limit, debouncedQ,
  ])
  const infinite = useQuestionsInfinite({
    params: cardsInfiniteParams,
    enabled: isCardsView,
    serverHydrated: Boolean(initialPrefetch),
  })

  const cardsScrollRootRef = useRef<HTMLDivElement>(null)
  const cardsFilterSignature = useMemo(
    () => JSON.stringify(cardsInfiniteParams),
    [cardsInfiniteParams],
  )
  const prevCardsFilterSignatureRef = useRef<string | null>(null)
  useEffect(() => {
    if (!isCardsView) {
      prevCardsFilterSignatureRef.current = null
      return
    }
    if (prevCardsFilterSignatureRef.current === null) {
      prevCardsFilterSignatureRef.current = cardsFilterSignature
      return
    }
    if (prevCardsFilterSignatureRef.current === cardsFilterSignature) return
    prevCardsFilterSignatureRef.current = cardsFilterSignature
    cardsScrollRootRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [cardsFilterSignature, isCardsView])
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
  const prevSelectionFilterSigRef = useRef<string | null>(null)
  useEffect(() => {
    if (prevSelectionFilterSigRef.current === cardsFilterSignature) return
    if (prevSelectionFilterSigRef.current !== null) {
      setSelectedIds(new Set())
    }
    prevSelectionFilterSigRef.current = cardsFilterSignature
  }, [cardsFilterSignature])
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkResult, setBulkResult] = useState<BulkDeleteResult | null>(null)
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const hydratedSidebarRef = useRef(false)
  useEffect(() => {
    if (hydratedSidebarRef.current) return
    hydratedSidebarRef.current = true
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem('questions:sidebarHidden')
      if (stored === 'true' || stored === 'false') {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount SSR-safe localStorage hydration
        setSidebarHidden(stored === 'true')
      }
    } catch {}
  }, [])
  useEffect(() => {
    if (!hydratedSidebarRef.current) return
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        'questions:sidebarHidden',
        sidebarHidden ? 'true' : 'false',
      )
    } catch {}
  }, [sidebarHidden])
  function toggleSidebar() {
    setSidebarHidden((prev) => !prev)
  }

  function toggleSelected(question: Question) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(question.id)) next.delete(question.id)
      else next.add(question.id)
      return next
    })
  }

  function toggleSelectAll(questions: Question[], select: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (select) {
        questions.forEach((q) => next.add(q.id))
      } else {
        questions.forEach((q) => next.delete(q.id))
      }
      return next
    })
  }

  async function performBulkDelete() {
    if (bulkDeleting) return
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    setBulkDeleting(true)
    try {
      const result = await runMutation(() => deleteQuestionsBulk(ids), {
        showSuccessToast: false,
        showErrorToast: false,
      })
      notifyBulkDeleteOutcome(result)
      setSelectedIds(new Set())
      setBulkConfirmOpen(false)
      setBulkResult(result)
      void queryClient.invalidateQueries({ queryKey: questionsRootQueryKey() })
    } catch (error) {
      setBulkResult(null)
      notifyError(TOAST_MESSAGES.bulkDelete.failedTitle, {
        id: 'bulk-delete-error',
        description:
          error instanceof Error ? error.message : 'Bulk delete failed.',
      })
      setBulkConfirmOpen(false)
    } finally {
      setBulkDeleting(false)
    }
  }

  const selectedCount = selectedIds.size
  const view = pickQuestionsViewSource(isCardsView, query, infinite)

  const sidebar = (
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
      onRetry={facetsResult.refetch}
    />
  )

  const mainContent = (
    <Stack gap={4}>
      <QuestionPickerToolbar
        q={query.state.q}
        onQChange={query.setQ}
        sortBy={query.state.sortBy}
        sortOrder={query.state.sortOrder}
        onSortChange={query.setSort}
        activeChips={activeChips}
        resultCount={view.total}
        loading={view.toolbarLoading}
        viewToggle={
          <Inline gap={2} align="center">
            <Button
              type="button"
              variant="outline-pill"
              shape="pill"
              size="icon-sm"
              onClick={toggleSidebar}
              aria-label={sidebarHidden ? 'Show filters sidebar' : 'Hide filters sidebar'}
              aria-pressed={sidebarHidden}
            >
              {sidebarHidden ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
            <QuestionViewToggle
              view={query.state.view}
              onViewChange={query.setView}
            />
          </Inline>
        }
        bulkActions={
          isSuperAdmin ? (
            <Button
              type="button"
              variant="destructive"
              shape="pill"
              size="xl"
              disabled={selectedCount === 0 || bulkDeleting}
              onClick={() => {
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
        <BulkDeleteResultAlerts result={bulkResult} />
      )}

      <QuestionPickerFeed
        items={view.items}
        total={view.total}
        loading={view.loading}
        error={view.error}
        onRetry={view.retry}
        view={query.state.view}
        debouncedQ={query.debouncedQ}
        filterState={query.state}
        onReset={query.reset}
        copyVariant="library"
        requireActiveStatusForEmptyBank={isSuperAdmin}
        renderTable={() => (
          <QuestionTable
            items={query.items}
            selectable={isSuperAdmin}
            selectedIds={selectedIds}
            onToggleSelected={toggleSelected}
            onToggleSelectAll={toggleSelectAll}
            onRowClick={(q) => router.push(`/questions/${q.id}`)}
            sortBy={query.state.sortBy}
            sortOrder={query.state.sortOrder}
            onSortChange={query.setSort}
            page={query.state.page}
            loading={query.loading}
          />
        )}
        renderCards={() => (
          <div ref={cardsScrollRootRef}>
            <CardGrid>
              {view.items.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  selectable={isSuperAdmin}
                  selected={selectedIds.has(question.id)}
                  onToggleSelected={() => toggleSelected(question)}
                />
              ))}
            </CardGrid>
          </div>
        )}
      />

      {!isCardsView ? (
        <QuestionPickerRefetchAlert
          error={query.paginationError}
          onRetry={query.refetch}
        />
      ) : null}

      {isCardsView && view.items.length > 0 ? (
        <InfiniteCardsLoader
          hasNextPage={infinite.hasNextPage}
          isFetchingNextPage={infinite.isFetchingNextPage}
          totalLoaded={infinite.items.length}
          total={infinite.total}
          error={infinite.paginationError}
          onLoadMore={infinite.fetchNextPage}
        />
      ) : null}

      {!isCardsView && !view.error ? (
        <Pagination
          page={query.state.page}
          totalPages={query.totalPages}
          total={query.total}
          limit={query.state.limit}
          onPageChange={query.setPage}
        />
      ) : null}
    </Stack>
  )

  return (
    <>
      <QuestionsLibraryHeader
        loading={view.loading}
        totalCount={view.total}
        visibleCount={view.items.length}
      />

      {sidebarHidden ? (
        mainContent
      ) : (
        <Grid columns="aside-22-left" gap={6}>
          {sidebar}
          {mainContent}
        </Grid>
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
    </>
  )
}
