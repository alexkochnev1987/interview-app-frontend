'use client'

import { useSearchParams } from 'next/navigation'
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { usePathname, useRouter } from '@/i18n/navigation'
import {
    fetchInterviews,
    type InterviewListItem,
    type InterviewSortField,
    type InterviewSortOrder,
    type InterviewStatusFilter,
} from '@/lib/api'
import {
    buildInterviewsFetchParams,
    DEFAULT_INTERVIEWS_LIMIT,
    DEFAULT_INTERVIEWS_QUERY,
    INTERVIEWS_SEARCH_DEBOUNCE_MS,
    readInterviewsFromSearchParams,
    InterviewPageLimit,
    type InterviewView,
    type InterviewsQueryState,
} from '@/lib/interviews-query-state'

import { interviewsListQueryKey } from '../library/query-keys'
import { isPlaceholderLoading, useVoidCallback } from '@/components/questions/picker/query-hook-helpers'
import { splitListQueryErrors } from '@/components/questions/picker/split-questions-query-errors'
import {getErrorMessage} from '@/lib/api-error';
import { useToastMessages } from '@/lib/use-toast-messages'

const VIEW_STORAGE_KEY = 'interviews:view'

function withLockedDefaults(
    initial?: Partial<InterviewsQueryState>,
): InterviewsQueryState {
    const base = { ...DEFAULT_INTERVIEWS_QUERY, ...(initial ?? {}) }
    return base
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
    } = options
    const [capturedInitial] = useState<Partial<InterviewsQueryState> | undefined>(initial)
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const toastMessages = useToastMessages()

    const [state, setState] = useState<InterviewsQueryState>(() => {
        const base = withLockedDefaults(capturedInitial)
        const start =
            syncUrl && searchParams
                ? readInterviewsFromSearchParams(searchParams, base)
                : base
        if (start.view === 'cards' && start.page !== 1) start.page = 1
        return start
    })
    const hydratedStoredViewRef = useRef(false)
    useEffect(() => {
        if (hydratedStoredViewRef.current) return
        hydratedStoredViewRef.current = true
        if (serverHydrated) return
        if (syncUrl && searchParams?.get('view') !== null) return
        const stored = readStoredView()
        if (stored) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount SSR-safe localStorage hydration of view preference
            setState((prev) => (prev.view === stored ? prev : { ...prev, view: stored }))
        }
    }, [serverHydrated, syncUrl, searchParams])
    const [debouncedQ, setDebouncedQ] = useState(() => state.q)
    const lastWrittenUrlRef = useRef<string | null>(
        syncUrl && searchParams ? searchParams.toString() : null,
    )

    useEffect(() => {
        if (state.q === debouncedQ) return
        const handle = window.setTimeout(
            () => setDebouncedQ(state.q),
            INTERVIEWS_SEARCH_DEBOUNCE_MS,
        )
        return () => window.clearTimeout(handle)
    }, [state.q, debouncedQ])

    const isSearchPending = state.q !== debouncedQ

    const stateUrl = useMemo(
        () =>
            writeToSearchParams({
                ...state,
                q: debouncedQ,
            }).toString(),
        [
            debouncedQ,
            state.limit,
            state.page,
            state.position,
            state.sortBy,
            state.sortOrder,
            state.status,
            state.view,
        ],
    )

    useEffect(() => {
        if (!syncUrl) return
        const currentUrl = searchParams ? searchParams.toString() : ''
        if (stateUrl === currentUrl) {
            lastWrittenUrlRef.current = currentUrl
            return
        }
        if (currentUrl !== lastWrittenUrlRef.current) {
            const base = withLockedDefaults(capturedInitial)
            const fromUrl = searchParams
                ? readInterviewsFromSearchParams(searchParams, base)
                : base
            if (fromUrl.view === 'cards' && fromUrl.page !== 1) fromUrl.page = 1
            lastWrittenUrlRef.current = currentUrl
            setState(fromUrl)
            setDebouncedQ(fromUrl.q)
            return
        }
        const url = stateUrl.length > 0 ? `${pathname}?${stateUrl}` : pathname
        lastWrittenUrlRef.current = stateUrl
        router.replace(url, { scroll: false })
    }, [stateUrl, pathname, router, syncUrl, capturedInitial, searchParams])

    const fetchParams = useMemo(
        () => buildInterviewsFetchParams(state, debouncedQ),
        [
            debouncedQ,
            state.limit,
            state.page,
            state.position,
            state.sortBy,
            state.sortOrder,
            state.status,
        ],
    )

    const query = useQuery({
        queryKey: interviewsListQueryKey(fetchParams),
        queryFn: ({ signal }) => fetchInterviews(fetchParams, { signal }),
        placeholderData: keepPreviousData,
        enabled: !disableFetchInCardsView || state.view !== 'cards',
    })

    const total = query.data?.total
    useEffect(() => {
        if (query.data === undefined) return
        const resolvedTotal = query.data.total
        // eslint-disable-next-line react-hooks/set-state-in-effect -- clamp page after fetch when filters reduce total below current page
        setState((prev) => {
            const maxPage = Math.max(1, Math.ceil(resolvedTotal / prev.limit))
            return prev.page > maxPage ? { ...prev, page: maxPage } : prev
        })
    }, [query.data])

    const items = query.data?.items ?? []
    const loading = isPlaceholderLoading(query)
    const errorMessage = getErrorMessage(query.error, toastMessages.interviewsLibrary.loadFailedFallback) ?? null
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
            const next = typeof value === 'function' ? value(prev.q) : value
            if (next === prev.q) return prev
            return { ...prev, q: next, page: 1 }
        })
    }, [])

    const resetToPageOne = useCallback(
        (patch: Partial<InterviewsQueryState>) =>
            setState((prev) => ({ ...prev, ...patch, page: 1 })),
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
        (val: InterviewPageLimit) => resetToPageOne({limit: val}),
        [resetToPageOne]
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
    const reset = useCallback(
        () => {
            const base = withLockedDefaults(capturedInitial)
            setState((prev) => ({ ...base, view: prev.view }))
            setDebouncedQ(base.q)
        },
        [capturedInitial],
    )
    const refetch = useVoidCallback(query.refetch)

    const canReset = useMemo(() => {
        const base = withLockedDefaults(capturedInitial)
        return (
            state.q !== base.q ||
            state.position !== base.position ||
            state.status !== base.status ||
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
        setSort,
        setPage,
        setLimit,
        setView,
        reset,
        refetch,
    }
}
