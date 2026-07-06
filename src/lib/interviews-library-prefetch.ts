import { dehydrate, type DehydratedState } from '@tanstack/react-query'

import {
  interviewFacetsQueryKey,
  interviewsInfiniteQueryKey,
  interviewsListQueryKey,
} from '@/components/interviews/library/query-keys'
import type {
  InterviewFacetsResponse,
  PaginatedInterviews,
} from '@/lib/api'
import { getQueryClient } from '@/lib/get-query-client'
import {
  buildInterviewFacetsParams,
  buildInterviewsFetchParams,
  buildInterviewsInfiniteParams,
  DEFAULT_INTERVIEWS_LIMIT,
  emptyPaginatedInterviews,
  EMPTY_INTERVIEW_FACETS,
  resolveInterviewsQueryState,
  type InterviewsQueryState,
} from '@/lib/interviews-query-state'
import { type ServerRequestContext, requestServer } from '@/lib/server-fetch'

export type InterviewsLibraryPrefetch = {
  queryState: InterviewsQueryState
  dehydratedState: DehydratedState
}

async function fetchInterviewsPage(
  params: Record<string, unknown>,
  ctx: ServerRequestContext,
): Promise<PaginatedInterviews> {
  return (
    (await requestServer<PaginatedInterviews>('/interviews', ctx, { query: params })) ??
    emptyPaginatedInterviews(
      typeof params.limit === 'number' ? params.limit : undefined,
    )
  )
}

async function fetchFacetsPage(
  params: Record<string, unknown>,
  ctx: ServerRequestContext,
): Promise<InterviewFacetsResponse> {
  return (
    (await requestServer<InterviewFacetsResponse>('/interviews/facets', ctx, {
      query: params,
    })) ?? EMPTY_INTERVIEW_FACETS
  )
}

async function hydrateInterviewsLibrary(
  ctx: ServerRequestContext,
  queryState: InterviewsQueryState,
  options: { prefetchList: boolean; prefetchInfinite: boolean },
): Promise<InterviewsLibraryPrefetch> {
  const queryClient = getQueryClient()
  const debouncedQ = queryState.q
  const fetchParams = buildInterviewsFetchParams(queryState, debouncedQ)
  const facetsParams = buildInterviewFacetsParams(queryState, debouncedQ)
  const infiniteParams = buildInterviewsInfiniteParams(
    { ...queryState, limit: DEFAULT_INTERVIEWS_LIMIT },
    debouncedQ,
  )

  const prefetches: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: interviewFacetsQueryKey(facetsParams),
      queryFn: () => fetchFacetsPage(facetsParams, ctx),
    }),
  ]

  if (options.prefetchList) {
    prefetches.push(
      queryClient.prefetchQuery({
        queryKey: interviewsListQueryKey(fetchParams),
        queryFn: () => fetchInterviewsPage(fetchParams, ctx),
      }),
    )
  }

  if (options.prefetchInfinite) {
    prefetches.push(
      queryClient.prefetchInfiniteQuery({
        queryKey: interviewsInfiniteQueryKey(infiniteParams),
        queryFn: ({ pageParam }) =>
          fetchInterviewsPage({ ...infiniteParams, page: pageParam }, ctx),
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

export async function prefetchInterviewsLibrary(
  ctx: ServerRequestContext,
  searchParams: URLSearchParams,
): Promise<InterviewsLibraryPrefetch> {
  const queryState = resolveInterviewsQueryState(searchParams)
  const isTableView = queryState.view === 'table'

  return hydrateInterviewsLibrary(ctx, queryState, {
    prefetchList: isTableView,
    prefetchInfinite: !isTableView,
  })
}
