import type {
  FetchInterviewFacetsParams,
  FetchInterviewsParams,
  InterviewFacetsResponse,
  InterviewSortField,
  InterviewSortOrder,
  InterviewStatusFilter,
} from '@/lib/api'

export { emptyPaginatedInterviews } from '@/lib/api'

export const DEFAULT_INTERVIEWS_LIMIT = 20
/** Delay before search hits the API / URL; input stays instant. */
export const INTERVIEWS_SEARCH_DEBOUNCE_MS = 500
const MAX_INTERVIEWS_Q_LENGTH = 200

export const INTERVIEW_PAGE_LIMIT_OPTIONS = [5, 10, 15, 20, 50] as const
export type InterviewPageLimit = (typeof INTERVIEW_PAGE_LIMIT_OPTIONS)[number]

const INTERVIEW_VIEWS = ['cards', 'table'] as const
export type InterviewView = (typeof INTERVIEW_VIEWS)[number]

export type InterviewsQueryState = {
  q: string
  position?: string
  status?: InterviewStatusFilter
  sortBy: InterviewSortField
  sortOrder: InterviewSortOrder
  page: number
  limit: number
  view: InterviewView
}

export const DEFAULT_INTERVIEWS_QUERY: InterviewsQueryState = {
  q: '',
  position: undefined,
  status: undefined,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  page: 1,
  limit: DEFAULT_INTERVIEWS_LIMIT,
  view: 'cards',
}

export const EMPTY_INTERVIEW_FACETS: InterviewFacetsResponse = {
  positions: [],
  statuses: [],
}

export function readInterviewsFromSearchParams(
  params: URLSearchParams,
  fallback: InterviewsQueryState = DEFAULT_INTERVIEWS_QUERY,
): InterviewsQueryState {
  const next: InterviewsQueryState = { ...fallback }

  const q = params.get('q')
  if (q !== null) next.q = q.slice(0, MAX_INTERVIEWS_Q_LENGTH)

  const position = params.get('position')
  if (position) next.position = position

  const status = params.get('status')
  if (
    status === 'pending' ||
    status === 'in_progress' ||
    status === 'processing' ||
    status === 'completed' ||
    status === 'failed'
  ) {
    next.status = status
  }

  const sortBy = params.get('sortBy')
  if (
    sortBy === 'candidateName' ||
    sortBy === 'updatedAt' ||
    sortBy === 'createdAt'
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
  if (
    Number.isFinite(limit) &&
    (INTERVIEW_PAGE_LIMIT_OPTIONS as readonly number[]).includes(Math.floor(limit))
  ) {
    next.limit = Math.floor(limit) as InterviewPageLimit
  }

  const view = params.get('view')
  if (view === 'cards' || view === 'table') next.view = view

  return next
}

export function toInterviewsSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item))
    } else {
      params.set(key, value)
    }
  }
  return params
}

function buildInterviewFilterParams(
  state: Pick<InterviewsQueryState, 'position' | 'status'>,
  debouncedQ: string,
): Omit<FetchInterviewsParams, 'sortBy' | 'sortOrder' | 'page' | 'limit'> {
  return {
    q: debouncedQ || undefined,
    position: state.position,
    status: state.status,
  }
}

export function buildInterviewsFetchParams(
  state: InterviewsQueryState,
  debouncedQ: string,
): FetchInterviewsParams {
  return {
    ...buildInterviewFilterParams(state, debouncedQ),
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    page: state.page,
    limit: state.limit,
  }
}

export function buildInterviewsInfiniteParams(
  state: InterviewsQueryState,
  debouncedQ: string,
): Omit<FetchInterviewsParams, 'page'> {
  const { page: _page, ...infiniteParams } = buildInterviewsFetchParams(
    state,
    debouncedQ,
  )
  return infiniteParams
}

export function buildInterviewFacetsParams(
  state: Pick<InterviewsQueryState, 'position' | 'status'>,
  debouncedQ: string,
): FetchInterviewFacetsParams {
  return buildInterviewFilterParams(state, debouncedQ)
}

export function resolveInterviewsQueryState(
  searchParams: URLSearchParams,
): InterviewsQueryState {
  const state = readInterviewsFromSearchParams(searchParams)
  if (state.view === 'cards' && state.page !== 1) state.page = 1
  return state
}
