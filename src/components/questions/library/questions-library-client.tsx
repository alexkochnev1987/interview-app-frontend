'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle, PanelLeftClose, PanelLeftOpen, Trash2 } from 'lucide-react'
import { useLocale } from 'next-intl'

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
import { useBulkDeleteQuestions } from '@/components/questions/use-question-mutations'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import { useQuestionChipLabels } from '@/i18n/use-question-chip-labels'
import { type BulkDeleteResult, type Question } from '@/lib/api'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import type { QuestionsLibraryPrefetch } from '@/lib/questions-library-prefetch'
import { buildQuestionsInfiniteParams } from '@/lib/questions-query-state'

type QuestionsLibraryClientProps = {
  isSuperAdmin: boolean
  initialPrefetch?: QuestionsLibraryPrefetch
}

export function QuestionsLibraryClient({
  isSuperAdmin,
  initialPrefetch,
}: QuestionsLibraryClientProps) {
  const uiLocale = useLocale()
  const router = useRouter()
  const t = useTranslations('questions.library.client')
  const tToolbar = useTranslations('questions.picker.toolbar')
  const getChipLabel = useQuestionChipLabels()
  const { mutate: bulkDeleteQuestions, isPending: bulkDeleting } =
    useBulkDeleteQuestions()

  const query = useQuestionsQuery({
    initial: initialPrefetch?.queryState,
    serverHydrated: Boolean(initialPrefetch),
    syncUrl: true,
    lockStatus: isSuperAdmin ? undefined : 'active',
    disableFetchInCardsView: true,
  })
  const listLocale = query.state.locale ?? uiLocale
  const isCardsView = query.state.view === 'cards'
  const cardsInfiniteParams = useMemo(
    () => buildQuestionsInfiniteParams(query.state, query.debouncedQ),
    [
      query.debouncedQ,
      query.state.category,
      query.state.difficulty,
      query.state.limit,
      query.state.locale,
      query.state.role,
      query.state.sortBy,
      query.state.sortOrder,
      query.state.status,
      query.state.subcategory,
      query.state.tags,
    ],
  )
  const infinite = useQuestionsInfinite({
    params: cardsInfiniteParams,
    enabled: isCardsView,
    serverHydrated: Boolean(initialPrefetch),
  })

  const cardsFilterSignature = useMemo(
    () => JSON.stringify(cardsInfiniteParams),
    [cardsInfiniteParams],
  )
  const facetsResult = useQuestionFacets(query.state, query.debouncedQ)
  const facets = facetsResult.facets

  const activeChips = buildActiveFilterChips(
    query.state,
    {
      setLocale: query.setLocale,
      setDifficulty: query.setDifficulty,
      setCategory: query.setCategory,
      setSubcategory: query.setSubcategory,
      setRole: query.setRole,
      setTags: query.setTags,
      setStatus: query.setStatus,
    },
    { showStatusFilter: isSuperAdmin },
    getChipLabel,
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

  function performBulkDelete() {
    if (bulkDeleting) return
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    bulkDeleteQuestions(ids, {
      onSuccess: result=>{
        setSelectedIds(new Set())
        setBulkConfirmOpen(false)
        setBulkResult(result)
      },
      onError: ()=>{
        setBulkResult(null)
        setBulkConfirmOpen(false)
      }
    })
  }

  const selectedCount = selectedIds.size
  const view = pickQuestionsViewSource(
    isCardsView,
    query,
    infinite,
    query.isSearchPending,
  )

  const sidebar = (
    <QuestionFacetSidebar
      difficulties={facets.difficulties}
      categories={facets.categories}
      subcategories={facets.subcategories}
      roles={facets.roles}
      tags={facets.tags}
      selected={{
        locale: query.state.locale,
        difficulty: query.state.difficulty,
        category: query.state.category,
        subcategory: query.state.subcategory,
        role: query.state.role,
        tags: query.state.tags,
        status: query.state.status,
      }}
      onDifficultyChange={query.setDifficulty}
      onLocaleChange={query.setLocale}
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
      <SearchInput
        value={query.state.q}
        onChange={(event) => query.setQ(event.target.value)}
        placeholder={tToolbar('searchPlaceholder')}
      />
      <QuestionPickerToolbar
        sortBy={query.state.sortBy}
        sortOrder={query.state.sortOrder}
        onSortChange={query.setSort}
        activeChips={activeChips}
        resultCount={view.total}
        loading={view.toolbarLoading}
        limit={query.state.limit}
        onLimitChange={query.setLimit}
        pageSizeDisabled={isCardsView}
        viewToggle={
          <Inline gap={2} align="center">
            <Button
              type="button"
              variant="outline-pill"
              shape="pill"
              size="icon-sm"
              onClick={toggleSidebar}
              aria-label={
                sidebarHidden ? t('showFiltersSidebar') : t('hideFiltersSidebar')
              }
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
            <DemoWriteGuard disabled={selectedCount === 0 || bulkDeleting}>
              <Button
                type="button"
                variant="destructive"
                shape="pill"
                size="xl"
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
                  ? t('deleting')
                  : selectedCount > 0
                    ? t('bulkDeleteWithCount', { count: selectedCount })
                    : t('bulkDelete')}
              </Button>
            </DemoWriteGuard>
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
            listLocale={listLocale}
            selectable={isSuperAdmin}
            selectedIds={selectedIds}
            onToggleSelected={toggleSelected}
            onToggleSelectAll={toggleSelectAll}
            onRowClick={(q) => router.push(routes.questions.detail(q.id))}
            sortBy={query.state.sortBy}
            sortOrder={query.state.sortOrder}
            onSortChange={query.setSort}
            page={query.state.page}
            loading={query.loading}
          />
        )}
        renderCards={() => (
          <CardGrid>
            {view.items.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                listLocale={listLocale}
                mode={isSuperAdmin ? 'select' : 'navigate'}
                selected={selectedIds.has(question.id)}
                onToggleSelected={() => toggleSelected(question)}
              />
            ))}
          </CardGrid>
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
        title={t('deleteTitle', { count: selectedCount })}
        description={t('bulkDeleteDescription')}
        confirmLabel={bulkDeleting ? t('deleting') : t('confirmBulkDelete')}
        cancelLabel={t('cancel')}
        loading={bulkDeleting}
        onConfirm={performBulkDelete}
        onCancel={() => {
          if (!bulkDeleting) setBulkConfirmOpen(false)
        }}
      />
    </>
  )
}
