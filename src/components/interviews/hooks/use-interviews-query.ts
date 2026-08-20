'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { type Dispatch, type SetStateAction, useCallback, useMemo, useState } from 'react'

import {
  isPlaceholderLoading,
  useVoidCallback,
} from '@/components/questions/picker/query-hook-helpers'
import {
  fetchInterviews,
  type InterviewListItem,
  type InterviewSortField,
  type InterviewSortOrder,
  type InterviewStatusFilter,
} from '@/lib/api'
import { getErrorMessage } from '@/lib/api-error'
import {
  buildInterviewsFetchParams,
  clampInterviewsSearchQuery,
  DEFAULT_INTERVIEWS_LIMIT,
  DEFAULT_INTERVIEWS_QUERY,
  InterviewPageLimit,
  INTERVIEWS_SEARCH_DEBOUNCE_MS,
  type InterviewsQueryState,
  type InterviewView,
  readInterviewsFromSearchParams,
} from '@/lib/interviews-query-state'
import { splitListQueryErrors } from '@/lib/split-query-errors'
import {
  usePageClamp,
  useSearchDebounce,
  useStoredViewHydration,
  useUrlStateSync,
} from '@/lib/use-facet-query-sync'
import { useToastMessages } from '@/lib/use-toast-messages'

import { interviewsListQueryKey } from '../library/query-keys'

const VIEW_STORAGE_KEY = 'interviews:view'

function withLockedDefaults(initial?: Partial<InterviewsQueryState>): InterviewsQueryState {
  return { ...DEFAULT_INTERVIEWS_QUERY, ...initial }
}

function readStoredView(): InterviewView | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY)
    return stored === 'cards' || stored === 'table' ? stored : null
  } catch {
    return null
  }
}

function writeStoredView(view: InterviewView) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view)
  } catch {}
}

type UseInterviewsQueryOptions = {
  initial?: Partial<InterviewsQueryState>
  serverHydrated?: boolean
  syncUrl?: boolean
  disableFetchInCardsView?: boolean
  allowAssignedHrFilter?: boolean
}

export type UseInterviewsQueryResult = {
  state: InterviewsQueryState
  debouncedQ: string
  isSearchPending: boolean
  items: InterviewListItem[]
  total: number
  totalPages: number
  loading: boolean
  blockingError: string | null
  paginationError: string | null
  canReset: boolean
  setQ: Dispatch<SetStateAction<string>>
  setPosition: (value: string | undefined) => void
  setStatus: (value: InterviewStatusFilter | undefined) => void
  setAssignedHrId: (value: string | undefined) => void
  setSort: (sortBy: InterviewSortField, sortOrder: InterviewSortOrder) => void
  setPage: (value: number) => void
  setView: (value: InterviewView) => void
  reset: () => void
  refetch: () => void
  setLimit: (val: InterviewPageLimit) => void
}

function writeToSearchParams(state: InterviewsQueryState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.q) params.set('q', state.q)
  if (state.position) params.set('position', state.position)
  if (state.status) params.set('status', state.status)
  if (state.assignedHrId) params.set('assignedHrId', state.assignedHrId)
  if (state.sortBy !== 'updatedAt') params.set('sortBy', state.sortBy)
  if (state.sortOrder !== 'desc') params.set('sortOrder', state.sortOrder)
  if (state.view === 'table' && state.page !== 1) {
    params.set('page', String(state.page))
  }
  if (state.view === 'table' && state.limit !== DEFAULT_INTERVIEWS_LIMIT) {
    params.set('limit', String(state.limit))
  }
  if (state.view !== 'cards') params.set('view', state.view)
  return params
}

export function useInterviewsQuery(
  options: UseInterviewsQueryOptions = {},
): UseInterviewsQueryResult {
  const {
    initial,
    serverHydrated,
    syncUrl,
    disableFetchInCardsView,
    allowAssignedHrFilter = true,
  } = options
  const [capturedInitial] = useState<Partial<InterviewsQueryState> | undefined>(initial)
  const searchParams = useSearchParams()

  const toastMessages = useToastMessages()

  const [state, setState] = useState<InterviewsQueryState>(() => {
    const base = withLockedDefaults(capturedInitial)
    const start =
      syncUrl && searchParams
        ? readInterviewsFromSearchParams(searchParams, base, {
            allowAssignedHrFilter,
          })
        : base
    if (start.view === 'cards' && start.page !== 1) start.page = 1
    return start
  })

  useStoredViewHydration({
    serverHydrated,
    syncUrl,
    searchParams,
    readStoredView,
    onHydrate: (view) => setState((prev) => (prev.view === view ? prev : { ...prev, view })),
  })

  const {
    debouncedValue: debouncedQ,
    isPending: isSearchPending,
    setDebouncedValue: setDebouncedQ,
  } = useSearchDebounce({
    value: state.q,
    delayMs: INTERVIEWS_SEARCH_DEBOUNCE_MS,
  })

  const stateUrl = useMemo(
    () =>
      writeToSearchParams({
        ...state,
        q: debouncedQ,
      }).toString(),
    [debouncedQ, state],
  )

  const readFromUrl = useCallback(
    (params: URLSearchParams) => {
      const base = withLockedDefaults(capturedInitial)
      const fromUrl = readInterviewsFromSearchParams(params, base, {
        allowAssignedHrFilter,
      })
      if (fromUrl.view === 'cards' && fromUrl.page !== 1) fromUrl.page = 1
      return fromUrl
    },
    [capturedInitial, allowAssignedHrFilter],
  )

  const handleExternalUrlChange = useCallback(
    (nextState: InterviewsQueryState) => {
      setState(nextState)
      setDebouncedQ(nextState.q)
    },
    [setDebouncedQ],
  )

  useUrlStateSync({
    syncUrl,
    stateUrl,
    searchParams,
    readFromUrl,
    onExternalUrlChange: handleExternalUrlChange,
  })

  const fetchParams = useMemo(
    () => buildInterviewsFetchParams(state, debouncedQ),
    [debouncedQ, state],
  )

  const query = useQuery({
    queryKey: interviewsListQueryKey(fetchParams),
    queryFn: ({ signal }) => fetchInterviews(fetchParams, { signal }),
    placeholderData: keepPreviousData,
    enabled: !disableFetchInCardsView || state.view !== 'cards',
  })

  const total = query.data?.total ?? 0
  usePageClamp(query.data?.total, state.limit, state.page, (clampedPage) => {
    setState((prev) => (prev.page === clampedPage ? prev : { ...prev, page: clampedPage }))
  })

  const items = query.data?.items ?? []
  const loading = isPlaceholderLoading(query)
  const errorMessage =
    getErrorMessage(query.error, toastMessages.interviewsLibrary.loadFailedFallback) ?? null
  const { blockingError, paginationError } = splitListQueryErrors(
    errorMessage,
    items.length,
    query.isPlaceholderData,
  )

  const totalPages = useMemo(() => {
    if (query.data === undefined) {
      return Math.max(1, state.page)
    }
    return Math.max(1, Math.ceil(query.data.total / state.limit))
  }, [query.data, state.limit, state.page])

  const setQ = useCallback<Dispatch<SetStateAction<string>>>((value) => {
    setState((prev) => {
      const raw = typeof value === 'function' ? value(prev.q) : value
      const next = clampInterviewsSearchQuery(raw)
      if (next === prev.q) return prev
      return { ...prev, q: next, page: 1 }
    })
  }, [])

  const resetToPageOne = useCallback(
    (patch: Partial<InterviewsQueryState>) => setState((prev) => ({ ...prev, ...patch, page: 1 })),
    [],
  )

  const setPosition = useCallback(
    (value: string | undefined) => resetToPageOne({ position: value }),
    [resetToPageOne],
  )
  const setStatus = useCallback(
    (value: InterviewStatusFilter | undefined) => {
      resetToPageOne({ status: value })
    },
    [resetToPageOne],
  )
  const setAssignedHrId = useCallback(
    (value: string | undefined) => resetToPageOne({ assignedHrId: value }),
    [resetToPageOne],
  )
  const setSort = useCallback(
    (sortBy: InterviewSortField, sortOrder: InterviewSortOrder) =>
      resetToPageOne({ sortBy, sortOrder }),
    [resetToPageOne],
  )
  const setPage = useCallback(
    (value: number) => setState((prev) => ({ ...prev, page: Math.max(1, Math.floor(value)) })),
    [],
  )
  const setLimit = useCallback(
    (val: InterviewPageLimit) => resetToPageOne({ limit: val }),
    [resetToPageOne],
  )
  const setView = useCallback((value: InterviewView) => {
    setState((prev) => {
      if (prev.view === value) return prev
      const next = { ...prev, view: value }
      if (value === 'cards') next.page = 1
      return next
    })
    writeStoredView(value)
  }, [])
  const reset = useCallback(() => {
    const base = withLockedDefaults(capturedInitial)
    setState((prev) => ({ ...base, view: prev.view }))
    setDebouncedQ(base.q)
  }, [capturedInitial, setDebouncedQ])
  const refetch = useVoidCallback(query.refetch)

  const canReset = useMemo(() => {
    const base = withLockedDefaults(capturedInitial)
    return (
      state.q !== base.q ||
      state.position !== base.position ||
      state.status !== base.status ||
      state.assignedHrId !== base.assignedHrId ||
      state.sortBy !== base.sortBy ||
      state.sortOrder !== base.sortOrder
    )
  }, [state, capturedInitial])

  return {
    state,
    debouncedQ,
    isSearchPending,
    items,
    total: total ?? 0,
    totalPages,
    loading,
    blockingError,
    paginationError,
    canReset,
    setQ,
    setPosition,
    setStatus,
    setAssignedHrId,
    setSort,
    setPage,
    setLimit,
    setView,
    reset,
    refetch,
  }
}
