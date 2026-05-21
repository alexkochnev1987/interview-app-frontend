import { dehydrate, type DehydratedState } from '@tanstack/react-query'

import {
  questionFacetsQueryKey,
  questionsInfiniteQueryKey,
  questionsListQueryKey,
} from '@/components/questions/picker/query-keys'
import type {
  PaginatedQuestions,
  QuestionFacetsResponse,
  QuestionStatusFilter,
} from '@/lib/api'
import { getQueryClient } from '@/lib/get-query-client'
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
  dehydratedState: DehydratedState
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

async function hydrateQuestionsPicker(
  ctx: ServerRequestContext,
  queryState: QuestionsQueryState,
  options: { prefetchList: boolean; prefetchInfinite: boolean },
): Promise<QuestionsLibraryPrefetch> {
  const queryClient = getQueryClient()
  const debouncedQ = queryState.q
  const fetchParams = buildQuestionsFetchParams(queryState, debouncedQ)
  const facetsParams = buildQuestionFacetsParams(queryState, debouncedQ)
  const {
    page: _page,
    ...infiniteParams
  } = fetchParams

  const prefetches: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: questionFacetsQueryKey(facetsParams),
      queryFn: () => fetchFacetsPage(facetsParams, ctx),
    }),
  ]

  if (options.prefetchList) {
    prefetches.push(
      queryClient.prefetchQuery({
        queryKey: questionsListQueryKey(fetchParams),
        queryFn: () => fetchQuestionsPage(fetchParams, ctx),
      }),
    )
  }

  if (options.prefetchInfinite) {
    prefetches.push(
      queryClient.prefetchInfiniteQuery({
        queryKey: questionsInfiniteQueryKey(infiniteParams),
        queryFn: ({ pageParam }) =>
          fetchQuestionsPage({ ...infiniteParams, page: pageParam }, ctx),
        initialPageParam: 1,
      }),
    )
  }

  await Promise.all(prefetches)

  return {
    queryState,
    dehydratedState: dehydrate(queryClient),
  }
}

export async function prefetchQuestionsLibrary(
  ctx: ServerRequestContext,
  searchParams: URLSearchParams,
  options?: { lockStatus?: QuestionStatusFilter },
): Promise<QuestionsLibraryPrefetch> {
  const queryState = resolveQuestionsQueryState(searchParams, options)
  const isTableView = queryState.view === 'table'

  return hydrateQuestionsPicker(ctx, queryState, {
    prefetchList: isTableView,
    prefetchInfinite: !isTableView,
  })
}

export async function prefetchInterviewCreatePicker(
  ctx: ServerRequestContext,
): Promise<QuestionsLibraryPrefetch> {
  const queryState = resolveQuestionsQueryState(new URLSearchParams(), {
    lockStatus: 'active',
  })

  return hydrateQuestionsPicker(ctx, queryState, {
    prefetchList: true,
    prefetchInfinite: false,
  })
}
