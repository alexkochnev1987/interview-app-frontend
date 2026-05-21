'use client'

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import {
  fetchQuestions,
  type FetchQuestionsParams,
  type Question,
} from '@/lib/api'

import { questionsInfiniteQueryKey } from './query-keys'

export type UseQuestionsInfiniteOptions = {
  params: Omit<FetchQuestionsParams, 'page'>
  enabled: boolean
  serverHydrated?: boolean
}

export type UseQuestionsInfiniteResult = {
  items: Question[]
  total: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isInitialLoading: boolean
  isFetching: boolean
  blockingError: string | null
  paginationError: string | null
  fetchNextPage: () => void
  refetch: () => void
}

export function useQuestionsInfinite({
  params,
  enabled,
  serverHydrated,
}: UseQuestionsInfiniteOptions): UseQuestionsInfiniteResult {
  const query = useInfiniteQuery({
    queryKey: questionsInfiniteQueryKey(params),
    queryFn: ({ pageParam, signal }) =>
      fetchQuestions({ ...params, page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0)
      if (loaded >= lastPage.total) return undefined
      return allPages.length + 1
    },
    enabled,
    placeholderData: keepPreviousData,
  })

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  )
  const total = query.data?.pages[0]?.total ?? 0

  const queryFetchNextPage = query.fetchNextPage
  const queryRefetch = query.refetch
  const fetchNextPage = useCallback(() => {
    void queryFetchNextPage()
  }, [queryFetchNextPage])
  const refetch = useCallback(() => {
    void queryRefetch()
  }, [queryRefetch])

  const errorMessage =
    query.error instanceof Error ? query.error.message : null
  const paginationError =
    errorMessage != null && items.length > 0 && !query.isPlaceholderData
      ? errorMessage
      : null
  const blockingError =
    errorMessage != null && paginationError == null ? errorMessage : null

  return {
    items,
    total,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    isInitialLoading:
      (!serverHydrated && query.isPending && enabled) ||
      (query.isFetching && query.isPlaceholderData && enabled),
    isFetching: query.isFetching,
    blockingError,
    paginationError,
    fetchNextPage,
    refetch,
  }
}
