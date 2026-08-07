'use client'

import { PanelLeftClose, PanelLeftOpen, SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'

import { InterviewFacetSidebar } from '@/components/interviews/picker'
import { InterviewPickerFeed } from '@/components/interviews/picker'
import { InterviewPickerRefetchAlert } from '@/components/interviews/picker'
import { InterviewPickerToolbar } from '@/components/interviews/picker'
import { InterviewViewToggle } from '@/components/interviews/picker'
import { pickInterviewsViewSource } from '@/components/interviews/picker'
import type { InterviewFacetSidebarProps } from '@/components/interviews/picker/interview-facet-sidebar'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { CardGrid } from '@/components/ui/layout/card-grid'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Pagination } from '@/components/ui/pagination'
import { Sheet, SheetBody, SheetHeader } from '@/components/ui/sheet'
import { StatusPill } from '@/components/ui/status-pill'
import { useRouter } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import { useInterviewChipLabels } from '@/i18n/use-interview-chip-labels'
import { isAssignedHrFilterUnassigned } from '@/lib/assigned-hr-filter'
import { useAuth } from '@/lib/auth-context'
import { canAssignInterviewHr } from '@/lib/auth-roles'
import type { InterviewsLibraryPrefetch } from '@/lib/interviews-library-prefetch'
import {
  buildInterviewsInfiniteParams,
  DEFAULT_INTERVIEWS_LIMIT,
  INTERVIEW_PAGE_LIMIT_OPTIONS,
} from '@/lib/interviews-query-state'

import { useInterviewFacets } from '../hooks/use-interview-facets'
import { useInterviewsInfinite } from '../hooks/use-interviews-infinite'
import { useInterviewsQuery } from '../hooks/use-interviews-query'
import { buildActiveInterviewFilterChips } from '../picker/build-active-chips'
import { InfiniteCardsLoader } from './infinite-cards-loader'
import { InterviewCard } from './interview-card'
import { InterviewTable } from './interview-table'

type InterviewsLibraryClientProps = {
  initialPrefetch?: InterviewsLibraryPrefetch
}

export function InterviewsLibraryClient({ initialPrefetch }: InterviewsLibraryClientProps) {
  const router = useRouter()
  const t = useTranslations('interviews.library.client')
  const tFacet = useTranslations('interviews.library.facet')
  const tCommon = useTranslations('common')
  const { user } = useAuth()
  const showAssignedHrFilter = canAssignInterviewHr(user?.role)

  const query = useInterviewsQuery({
    initial: initialPrefetch?.queryState,
    serverHydrated: Boolean(initialPrefetch),
    syncUrl: true,
    disableFetchInCardsView: true,
    allowAssignedHrFilter: showAssignedHrFilter,
  })

  const needsHrUserLookup = Boolean(
    showAssignedHrFilter &&
    query.state.assignedHrId &&
    !isAssignedHrFilterUnassigned(query.state.assignedHrId),
  )
  const getChipLabel = useInterviewChipLabels({ needsHrUserLookup })

  const isCardsView = query.state.view === 'cards'
  const cardsInfiniteParams = useMemo(
    () =>
      buildInterviewsInfiniteParams(
        { ...query.state, limit: DEFAULT_INTERVIEWS_LIMIT },
        query.debouncedQ,
      ),
    [query.debouncedQ, query.state],
  )

  const infinite = useInterviewsInfinite({
    params: cardsInfiniteParams,
    enabled: isCardsView,
    serverHydrated: Boolean(initialPrefetch),
  })

  const facetsResult = useInterviewFacets(
    {
      position: query.state.position,
      status: query.state.status,
      assignedHrId: query.state.assignedHrId,
    },
    query.debouncedQ,
  )

  const activeChips = buildActiveInterviewFilterChips(
    query.state,
    {
      setPosition: query.setPosition,
      setStatus: query.setStatus,
      setAssignedHrId: query.setAssignedHrId,
    },
    getChipLabel,
  )

  const hasActiveFilters = Boolean(
    query.debouncedQ || query.state.position || query.state.status || query.state.assignedHrId,
  )

  const view = pickInterviewsViewSource(isCardsView, query, infinite, query.isSearchPending)

  const [sidebarHidden, setSidebarHidden] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const hydratedSidebarRef = useRef(false)

  useEffect(() => {
    if (hydratedSidebarRef.current) return
    hydratedSidebarRef.current = true
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem('interviews:sidebarHidden')
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
      window.localStorage.setItem('interviews:sidebarHidden', sidebarHidden ? 'true' : 'false')
    } catch {}
  }, [sidebarHidden])

  function toggleSidebar() {
    setSidebarHidden((prev) => !prev)
  }

  const facetSidebarProps: Omit<InterviewFacetSidebarProps, 'hideHeading'> = {
    positions: facetsResult.facets.positions,
    statuses: facetsResult.facets.statuses,
    selected: {
      position: query.state.position,
      status: query.state.status,
      assignedHrId: query.state.assignedHrId,
    },
    onPositionChange: query.setPosition,
    onStatusChange: query.setStatus,
    onAssignedHrIdChange: query.setAssignedHrId,
    showAssignedHrFilter: showAssignedHrFilter,
    onReset: query.reset,
    canReset: query.canReset,
    loading: facetsResult.loading,
    error: facetsResult.error,
    onRetry: facetsResult.refetch,
  }

  const mainContent = (
    <Stack gap={4}>
      <InterviewPickerToolbar
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
            <Inline visibility="lg-up">
              <Button
                type="button"
                variant="outline-pill"
                shape="pill"
                size="icon-sm"
                onClick={toggleSidebar}
                aria-label={sidebarHidden ? t('showFiltersSidebar') : t('hideFiltersSidebar')}
                aria-pressed={sidebarHidden}
              >
                {sidebarHidden ? (
                  <Icon size="md">
                    <PanelLeftOpen />
                  </Icon>
                ) : (
                  <Icon size="md">
                    <PanelLeftClose />
                  </Icon>
                )}
              </Button>
            </Inline>
            <Inline visibility="below-lg">
              <Button
                type="button"
                variant="outline-pill"
                shape="pill"
                size="sm"
                onClick={() => setFiltersOpen(true)}
                aria-expanded={filtersOpen}
              >
                <Icon size="sm">
                  <SlidersHorizontal />
                </Icon>
                {tFacet('filtersTitle')}
                {activeChips.length > 0 ? (
                  <StatusPill tone="neutral" size="compact" casing="chip">
                    {activeChips.length}
                  </StatusPill>
                ) : null}
              </Button>
            </Inline>
            <InterviewViewToggle view={query.state.view} onViewChange={query.setView} />
          </Inline>
        }
      />

      <InterviewPickerFeed
        items={view.items}
        total={view.total}
        loading={view.loading}
        error={view.error}
        onRetry={view.retry}
        view={query.state.view}
        debouncedQ={query.debouncedQ}
        hasActiveFilters={hasActiveFilters}
        onReset={query.reset}
        renderTable={() => (
          <InterviewTable
            items={query.items}
            sortBy={query.state.sortBy}
            sortOrder={query.state.sortOrder}
            onSortChange={query.setSort}
            onRowClick={(interview) => router.push(routes.interviews.detail(interview.id))}
            page={query.state.page}
            loading={query.loading}
          />
        )}
        renderCards={() => (
          <CardGrid>
            {view.items.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </CardGrid>
        )}
      />

      {!isCardsView ? (
        <InterviewPickerRefetchAlert error={query.paginationError} onRetry={query.refetch} />
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
          limitOptions={INTERVIEW_PAGE_LIMIT_OPTIONS}
          onLimitChange={query.setLimit}
        />
      ) : null}
    </Stack>
  )

  return (
    <>
      {sidebarHidden ? (
        mainContent
      ) : (
        <Grid columns="aside-22-left" gap={6}>
          <Stack visibility="lg-up">
            <InterviewFacetSidebar {...facetSidebarProps} />
          </Stack>
          {mainContent}
        </Grid>
      )}

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetHeader
          title={tFacet('filtersTitle')}
          onClose={() => setFiltersOpen(false)}
          closeLabel={tCommon('close')}
        />
        <SheetBody>
          <InterviewFacetSidebar {...facetSidebarProps} hideHeading />
        </SheetBody>
      </Sheet>
    </>
  )
}
