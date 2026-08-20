'use client'

import { keepPreviousData, useInfiniteQuery, type QueryKey } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { getErrorMessage } from '@/lib/api-error'
import { splitInfiniteQueryErrors } from '@/lib/split-query-errors'

export type UseInfiniteResourceOptions<TItem, TPage extends { items?: TItem[]; total: number }> = {
  queryKey: QueryKey
  queryFn: (context: { pageParam: number; signal: AbortSignal }) => Promise<TPage>
  enabled: boolean
  serverHydrated?: boolean
  fallbackErrorMessage: string
}

export type UseInfiniteResourceResult<TItem> = {
  items: TItem[]
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

export function useInfiniteResource<TItem, TPage extends { items?: TItem[]; total: number }>({
  queryKey,
  queryFn,
  enabled,
  serverHydrated,
  fallbackErrorMessage,
}: UseInfiniteResourceOptions<TItem, TPage>): UseInfiniteResourceResult<TItem> {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) => queryFn({ pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + (p.items?.length ?? 0), 0)
      const total = lastPage?.total ?? 0
      if (loaded >= total) return undefined
      return allPages.length + 1
    },
    enabled,
    placeholderData: keepPreviousData,
  })

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items ?? []) ?? [], [query.data])
  const total = query.data?.pages[0]?.total ?? 0

  const queryFetchNextPage = query.fetchNextPage
  const fetchNextPage = useCallback(() => {
    void queryFetchNextPage()
  }, [queryFetchNextPage])

  const queryRefetch = query.refetch
  const refetch = useCallback(() => {
    void queryRefetch()
  }, [queryRefetch])

  const errorMessage = getErrorMessage(query.error, fallbackErrorMessage) ?? null
  const { blockingError, paginationError } = splitInfiniteQueryErrors(
    errorMessage,
    items.length,
    query.isPlaceholderData,
  )

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
