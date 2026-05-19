'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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

import {
  fetchQuestions,
  type FetchQuestionsParams,
  type Question,
  type QuestionDifficulty,
  type QuestionSortField,
  type QuestionSortOrder,
  type QuestionStatusFilter,
} from '@/lib/api'

import { questionsListQueryKey } from './query-keys'

const DEFAULT_LIMIT = 20
const SEARCH_DEBOUNCE_MS = 300
const MAX_Q_LENGTH = 200
const VIEW_STORAGE_KEY = 'questions:view'

export const QUESTION_VIEWS = ['cards', 'table'] as const
export type QuestionView = (typeof QUESTION_VIEWS)[number]

export type QuestionsQueryState = {
  q: string
  difficulty?: QuestionDifficulty
  category?: string
  subcategory?: string
  tags: string[]
  role?: string
  status: QuestionStatusFilter
  sortBy: QuestionSortField
  sortOrder: QuestionSortOrder
  page: number
  limit: number
  view: QuestionView
}

export const DEFAULT_QUESTIONS_QUERY: QuestionsQueryState = {
  q: '',
  difficulty: undefined,
  category: undefined,
  subcategory: undefined,
  tags: [],
  role: undefined,
  status: 'active',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  page: 1,
  limit: DEFAULT_LIMIT,
  view: 'cards',
}

function readStoredView(): QuestionView | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY)
    return stored === 'cards' || stored === 'table' ? stored : null
  } catch {
    return null
  }
}

function writeStoredView(view: QuestionView) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view)
  } catch {}
}

type UseQuestionsQueryOptions = {
  initial?: Partial<QuestionsQueryState>
  syncUrl?: boolean
  lockStatus?: QuestionStatusFilter
}

export type UseQuestionsQueryResult = {
  state: QuestionsQueryState
  debouncedQ: string
  items: Question[]
  total: number
  totalPages: number
  loading: boolean
  error: string | null
  canReset: boolean
  setQ: Dispatch<SetStateAction<string>>
  setDifficulty: (value: QuestionDifficulty | undefined) => void
  setCategory: (value: string | undefined) => void
  setSubcategory: (value: string | undefined) => void
  setTags: (value: string[]) => void
  setRole: (value: string | undefined) => void
  setStatus: (value: QuestionStatusFilter) => void
  setSort: (sortBy: QuestionSortField, sortOrder: QuestionSortOrder) => void
  setPage: (value: number) => void
  setView: (value: QuestionView) => void
  reset: () => void
  refetch: () => void
}

function readFromSearchParams(
  params: URLSearchParams,
  fallback: QuestionsQueryState,
): QuestionsQueryState {
  const next: QuestionsQueryState = { ...fallback }
  const q = params.get('q')
  if (q !== null) next.q = q.slice(0, MAX_Q_LENGTH)
  const difficulty = params.get('difficulty')
  if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
    next.difficulty = difficulty
  }
  const category = params.get('category')
  if (category) next.category = category
  const subcategory = params.get('subcategory')
  if (subcategory) next.subcategory = subcategory
  const tags = params.getAll('tags').filter(Boolean)
  if (tags.length > 0) next.tags = tags
  const role = params.get('role')
  if (role) next.role = role
  const status = params.get('status')
  if (status === 'active' || status === 'inactive' || status === 'all') {
    next.status = status
  }
  const sortBy = params.get('sortBy')
  if (
    sortBy === 'createdAt' ||
    sortBy === 'updatedAt' ||
    sortBy === 'difficulty' ||
    sortBy === 'questionText' ||
    sortBy === 'popularity'
  ) {
    next.sortBy = sortBy
  }
  const sortOrder = params.get('sortOrder')
  if (sortOrder === 'asc' || sortOrder === 'desc') {
    next.sortOrder = sortOrder
  }
  const page = Number(params.get('page'))
  if (Number.isFinite(page) && page >= 1) next.page = Math.floor(page)
  const limit = Number(params.get('limit'))
  if (Number.isFinite(limit) && limit >= 1 && limit <= 100) {
    next.limit = Math.floor(limit)
  }
  const view = params.get('view')
  if (view === 'cards' || view === 'table') next.view = view
  return next
}

function writeToSearchParams(state: QuestionsQueryState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.q) params.set('q', state.q)
  if (state.difficulty) params.set('difficulty', state.difficulty)
  if (state.category) params.set('category', state.category)
  if (state.subcategory) params.set('subcategory', state.subcategory)
  state.tags.forEach((tag) => params.append('tags', tag))
  if (state.role) params.set('role', state.role)
  if (state.status !== 'active') params.set('status', state.status)
  if (state.sortBy !== 'updatedAt') params.set('sortBy', state.sortBy)
  if (state.sortOrder !== 'desc') params.set('sortOrder', state.sortOrder)
  if (state.view === 'table' && state.page !== 1) {
    params.set('page', String(state.page))
  }
  if (state.limit !== DEFAULT_LIMIT) params.set('limit', String(state.limit))
  if (state.view !== 'cards') params.set('view', state.view)
  return params
}

export function buildFetchParams(
  state: QuestionsQueryState,
  debouncedQ: string,
): FetchQuestionsParams {
  return {
    q: debouncedQ || undefined,
    difficulty: state.difficulty,
    category: state.category,
    subcategory: state.subcategory,
    tags: state.tags.length > 0 ? state.tags : undefined,
    role: state.role,
    status: state.status,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    page: state.page,
    limit: state.limit,
  }
}

export function useQuestionsQuery(
  options: UseQuestionsQueryOptions = {},
): UseQuestionsQueryResult {
  const { initial, syncUrl, lockStatus } = options
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [state, setState] = useState<QuestionsQueryState>(() => {
    const base = { ...DEFAULT_QUESTIONS_QUERY, ...(initial ?? {}) }
    const start =
      syncUrl && searchParams ? readFromSearchParams(searchParams, base) : base
    if (lockStatus) start.status = lockStatus
    if (start.view === 'cards' && start.page !== 1) start.page = 1
    return start
  })
  const hydratedStoredViewRef = useRef(false)
  useEffect(() => {
    if (hydratedStoredViewRef.current) return
    hydratedStoredViewRef.current = true
    if (syncUrl && searchParams?.get('view') !== null) return
    const stored = readStoredView()
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount SSR-safe localStorage hydration of view preference
      setState((prev) => (prev.view === stored ? prev : { ...prev, view: stored }))
    }
  }, [syncUrl, searchParams])
  const [debouncedQ, setDebouncedQ] = useState(() => state.q)
  const lastWrittenUrlRef = useRef<string | null>(
    syncUrl && searchParams ? searchParams.toString() : null,
  )

  useEffect(() => {
    if (state.q === debouncedQ) return
    const handle = window.setTimeout(() => setDebouncedQ(state.q), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [state.q, debouncedQ])

  useEffect(() => {
    if (!syncUrl) return
    const stateUrl = writeToSearchParams(state).toString()
    const currentUrl = searchParams ? searchParams.toString() : ''
    if (stateUrl === currentUrl) {
      lastWrittenUrlRef.current = currentUrl
      return
    }
    if (currentUrl !== lastWrittenUrlRef.current) {
      const base = { ...DEFAULT_QUESTIONS_QUERY, ...(initial ?? {}) }
      const fromUrl = searchParams ? readFromSearchParams(searchParams, base) : base
      if (lockStatus) fromUrl.status = lockStatus
      lastWrittenUrlRef.current = currentUrl
      setState(fromUrl)
      setDebouncedQ(fromUrl.q)
      return
    }
    const url = stateUrl.length > 0 ? `${pathname}?${stateUrl}` : pathname
    lastWrittenUrlRef.current = stateUrl
    router.replace(url, { scroll: false })
  }, [state, pathname, router, syncUrl, initial, lockStatus, searchParams])

  const fetchParams = useMemo(
    () => buildFetchParams(state, debouncedQ),
    [state, debouncedQ],
  )

  const query = useQuery({
    queryKey: questionsListQueryKey(fetchParams),
    queryFn: ({ signal }) => fetchQuestions(fetchParams, { signal }),
    placeholderData: keepPreviousData,
  })

  const total = query.data?.total ?? 0
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clamp page after fetch when filters reduce total below current page
    setState((prev) => {
      const maxPage = Math.max(1, Math.ceil(total / prev.limit))
      return prev.page > maxPage ? { ...prev, page: maxPage } : prev
    })
  }, [total])

  const loading = query.isPending || query.isFetching
  const error =
    query.error instanceof Error ? query.error.message : null

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / state.limit)),
    [total, state.limit],
  )

  const setQ = useCallback<Dispatch<SetStateAction<string>>>((value) => {
    setState((prev) => {
      const next = typeof value === 'function' ? value(prev.q) : value
      if (next === prev.q) return prev
      return { ...prev, q: next, page: 1 }
    })
  }, [])

  const resetToPageOne = useCallback(
    (patch: Partial<QuestionsQueryState>) =>
      setState((prev) => ({ ...prev, ...patch, page: 1 })),
    [],
  )

  const setDifficulty = useCallback(
    (value: QuestionDifficulty | undefined) => resetToPageOne({ difficulty: value }),
    [resetToPageOne],
  )
  const setCategory = useCallback(
    (value: string | undefined) => resetToPageOne({ category: value }),
    [resetToPageOne],
  )
  const setSubcategory = useCallback(
    (value: string | undefined) => resetToPageOne({ subcategory: value }),
    [resetToPageOne],
  )
  const setTags = useCallback(
    (value: string[]) => resetToPageOne({ tags: value }),
    [resetToPageOne],
  )
  const setRole = useCallback(
    (value: string | undefined) => resetToPageOne({ role: value }),
    [resetToPageOne],
  )
  const setStatus = useCallback(
    (value: QuestionStatusFilter) => {
      if (lockStatus) return
      resetToPageOne({ status: value })
    },
    [resetToPageOne, lockStatus],
  )
  const setSort = useCallback(
    (sortBy: QuestionSortField, sortOrder: QuestionSortOrder) =>
      resetToPageOne({ sortBy, sortOrder }),
    [resetToPageOne],
  )
  const setPage = useCallback(
    (value: number) => setState((prev) => ({ ...prev, page: Math.max(1, Math.floor(value)) })),
    [],
  )
  const setView = useCallback((value: QuestionView) => {
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
      const base = { ...DEFAULT_QUESTIONS_QUERY, ...(initial ?? {}) }
      if (lockStatus) base.status = lockStatus
      setState((prev) => ({ ...base, view: prev.view }))
    },
    [initial, lockStatus],
  )
  const queryRefetch = query.refetch
  const refetch = useCallback(() => {
    void queryRefetch()
  }, [queryRefetch])

  const canReset = useMemo(() => {
    const base = { ...DEFAULT_QUESTIONS_QUERY, ...(initial ?? {}) }
    if (lockStatus) base.status = lockStatus
    return (
      state.q !== base.q ||
      state.difficulty !== base.difficulty ||
      state.category !== base.category ||
      state.subcategory !== base.subcategory ||
      state.role !== base.role ||
      state.tags.length > 0 ||
      state.status !== base.status ||
      state.sortBy !== base.sortBy ||
      state.sortOrder !== base.sortOrder ||
      state.page !== base.page ||
      state.limit !== base.limit
    )
  }, [state, initial, lockStatus])

  return {
    state,
    debouncedQ,
    items: query.data?.items ?? [],
    total,
    totalPages,
    loading,
    error,
    canReset,
    setQ,
    setDifficulty,
    setCategory,
    setSubcategory,
    setTags,
    setRole,
    setStatus,
    setSort,
    setPage,
    setView,
    reset,
    refetch,
  }
}
