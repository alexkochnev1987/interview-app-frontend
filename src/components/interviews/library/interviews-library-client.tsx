'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { CardGrid } from '@/components/ui/layout/card-grid'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Icon } from '@/components/ui/icon'
import { Pagination } from '@/components/ui/pagination'
import { useRouter } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'
import { useInterviewChipLabels } from '@/i18n/use-interview-chip-labels'
import type { InterviewsLibraryPrefetch } from '@/lib/interviews-library-prefetch'
import { useAuth } from '@/lib/auth-context'
import { canAssignInterviewHr } from '@/lib/auth-roles'
import {
  buildInterviewsInfiniteParams,
  DEFAULT_INTERVIEWS_LIMIT,
} from '@/lib/interviews-query-state'

import { buildActiveInterviewFilterChips } from '../picker/build-active-chips'
import { InfiniteCardsLoader } from './infinite-cards-loader'
import { InterviewCard } from './interview-card'
import { InterviewFacetSidebar } from '../picker/interview-facet-sidebar'
import { InterviewPickerFeed } from '../picker/interview-picker-feed'
import { InterviewPickerRefetchAlert } from '../picker/interview-picker-refetch-alert'
import { InterviewPickerToolbar } from '../picker/interview-picker-toolbar'
import { useInterviewFacets } from '../hooks/use-interview-facets'
import { useInterviewsInfinite } from '../hooks/use-interviews-infinite'
import { useInterviewsQuery } from '../hooks/use-interviews-query'
import { pickInterviewsViewSource } from '../picker/pick-interviews-view-source'
import { InterviewViewToggle } from '../picker/interview-view-toggle'
import { InterviewTable } from './interview-table'
import { InterviewsLibraryHeader } from './interviews-library-header'

type InterviewsLibraryClientProps = {
  initialPrefetch?: InterviewsLibraryPrefetch
  showHeader?: boolean
}

export function InterviewsLibraryClient({
  initialPrefetch,
  showHeader = true,
}: InterviewsLibraryClientProps) {
  const router = useRouter()
  const t = useTranslations('interviews.library.client')
  const getChipLabel = useInterviewChipLabels()
  const { user } = useAuth()
  const showAssignedHrFilter = canAssignInterviewHr(user?.role)

  const query = useInterviewsQuery({
    initial: initialPrefetch?.queryState,
    serverHydrated: Boolean(initialPrefetch),
    syncUrl: true,
    disableFetchInCardsView: true,
  })

  const isCardsView = query.state.view === 'cards'
  const cardsInfiniteParams = useMemo(
    () =>
      buildInterviewsInfiniteParams(
        { ...query.state, limit: DEFAULT_INTERVIEWS_LIMIT },
        query.debouncedQ,
      ),
    [
      query.debouncedQ,
      query.state,
    ],
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
    query.debouncedQ ||
      query.state.position ||
      query.state.status ||
      query.state.assignedHrId,
  )

  const view = pickInterviewsViewSource(
    isCardsView,
    query,
    infinite,
    query.isSearchPending,
  )

  const [sidebarHidden, setSidebarHidden] = useState(false)
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
      window.localStorage.setItem(
        'interviews:sidebarHidden',
        sidebarHidden ? 'true' : 'false',
      )
    } catch {}
  }, [sidebarHidden])

  function toggleSidebar() {
    setSidebarHidden((prev) => !prev)
  }

  const sidebar = (
    <InterviewFacetSidebar
      positions={facetsResult.facets.positions}
      statuses={facetsResult.facets.statuses}
      selected={{
        position: query.state.position,
        status: query.state.status,
        assignedHrId: query.state.assignedHrId,
      }}
      onPositionChange={query.setPosition}
      onStatusChange={query.setStatus}
      onAssignedHrIdChange={query.setAssignedHrId}
      showAssignedHrFilter={showAssignedHrFilter}
      onReset={query.reset}
      canReset={query.canReset}
      loading={facetsResult.loading}
      error={facetsResult.error}
      onRetry={facetsResult.refetch}
    />
  )

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
            <InterviewViewToggle
              view={query.state.view}
              onViewChange={query.setView}
            />
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
            onRowClick={(interview) =>
              router.push(routes.interviews.detail(interview.id))
            }
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
        <InterviewPickerRefetchAlert
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
      {showHeader ? (
        <InterviewsLibraryHeader
          loading={view.loading}
          totalCount={view.total}
          visibleCount={view.items.length}
        />
      ) : null}

      {sidebarHidden ? (
        mainContent
      ) : (
        <Grid columns="aside-22-left" gap={6}>
          {sidebar}
          {mainContent}
        </Grid>
      )}
    </>
  )
}
