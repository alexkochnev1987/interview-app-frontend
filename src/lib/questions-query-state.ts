import type {
  FetchQuestionFacetsParams,
  FetchQuestionsParams,
  PaginatedQuestions,
  QuestionDifficulty,
  QuestionFacetsResponse,
  QuestionSortField,
  QuestionSortOrder,
  QuestionStatusFilter,
} from '@/lib/api'

export const DEFAULT_QUESTIONS_LIMIT = 20
export const MAX_QUESTIONS_Q_LENGTH = 200

export const EMPTY_QUESTION_FACETS: QuestionFacetsResponse = {
  difficulties: [],
  categories: [],
  subcategories: [],
  roles: [],
  tags: [],
}

export function emptyPaginatedQuestions(limit = DEFAULT_QUESTIONS_LIMIT): PaginatedQuestions {
  return { items: [], total: 0, page: 1, limit }
}

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
  limit: DEFAULT_QUESTIONS_LIMIT,
  view: 'cards',
}

export function readQuestionsFromSearchParams(
  params: URLSearchParams,
  fallback: QuestionsQueryState = DEFAULT_QUESTIONS_QUERY,
): QuestionsQueryState {
  const next: QuestionsQueryState = { ...fallback }
  const q = params.get('q')
  if (q !== null) next.q = q.slice(0, MAX_QUESTIONS_Q_LENGTH)
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

function buildQuestionFilterParams(
  state: Pick<
    QuestionsQueryState,
    'difficulty' | 'category' | 'subcategory' | 'tags' | 'role' | 'status'
  >,
  debouncedQ: string,
): Omit<FetchQuestionsParams, 'sortBy' | 'sortOrder' | 'page' | 'limit'> {
  return {
    q: debouncedQ || undefined,
    difficulty: state.difficulty,
    category: state.category,
    subcategory: state.subcategory,
    tags: state.tags.length > 0 ? state.tags : undefined,
    role: state.role,
    status: state.status,
  }
}

export function buildQuestionsFetchParams(
  state: QuestionsQueryState,
  debouncedQ: string,
): FetchQuestionsParams {
  return {
    ...buildQuestionFilterParams(state, debouncedQ),
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    page: state.page,
    limit: state.limit,
  }
}

export function buildQuestionFacetsParams(
  state: Pick<
    QuestionsQueryState,
    'q' | 'difficulty' | 'category' | 'subcategory' | 'tags' | 'role' | 'status'
  >,
  debouncedQ: string,
): FetchQuestionFacetsParams {
  return buildQuestionFilterParams(state, debouncedQ)
}

export function toQuestionsSearchParams(
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

export function resolveQuestionsQueryState(
  searchParams: URLSearchParams,
  options?: { lockStatus?: QuestionStatusFilter },
): QuestionsQueryState {
  const state = readQuestionsFromSearchParams(searchParams)
  if (options?.lockStatus) state.status = options.lockStatus
  if (state.view === 'cards' && state.page !== 1) state.page = 1
  return state
}
