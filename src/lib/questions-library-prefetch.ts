import type {
  PaginatedQuestions,
  QuestionFacetsResponse,
  QuestionStatusFilter,
} from '@/lib/api'
import {
  buildQuestionFacetsParams,
  buildQuestionsFetchParams,
  emptyPaginatedQuestions,
  EMPTY_QUESTION_FACETS,
  resolveQuestionsQueryState,
  type QuestionsQueryState,
} from '@/lib/questions-query-state'
import { type ServerRequestContext, requestServer } from '@/lib/server-fetch'

export type QuestionsLibraryPrefetch = {
  queryState: QuestionsQueryState
  listData?: PaginatedQuestions
  infiniteFirstPage?: PaginatedQuestions
  facets: QuestionFacetsResponse
}

async function fetchQuestionsPage(
  params: Record<string, unknown>,
  ctx: ServerRequestContext,
): Promise<PaginatedQuestions> {
  return (
    (await requestServer<PaginatedQuestions>('/questions', ctx, { query: params })) ??
    emptyPaginatedQuestions(
      typeof params.limit === 'number' ? params.limit : undefined,
    )
  )
}

async function fetchFacetsPage(
  params: Record<string, unknown>,
  ctx: ServerRequestContext,
): Promise<QuestionFacetsResponse> {
  return (
    (await requestServer<QuestionFacetsResponse>('/questions/facets', ctx, {
      query: params,
    })) ?? EMPTY_QUESTION_FACETS
  )
}

export async function prefetchQuestionsLibrary(
  ctx: ServerRequestContext,
  searchParams: URLSearchParams,
  options?: { lockStatus?: QuestionStatusFilter },
): Promise<QuestionsLibraryPrefetch> {
  const queryState = resolveQuestionsQueryState(searchParams, options)
  const debouncedQ = queryState.q
  const fetchParams = buildQuestionsFetchParams(queryState, debouncedQ)
  const facetsParams = buildQuestionFacetsParams(queryState, debouncedQ)
  const questionsParams =
    queryState.view === 'table' ? fetchParams : { ...fetchParams, page: 1 }
  const [questions, facets] = await Promise.all([
    fetchQuestionsPage(questionsParams, ctx),
    fetchFacetsPage(facetsParams, ctx),
  ])

  return queryState.view === 'table'
    ? { queryState, listData: questions, facets }
    : { queryState, infiniteFirstPage: questions, facets }
}