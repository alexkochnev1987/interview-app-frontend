'use client'

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
    fetchInterviews,
    type FetchInterviewsParams,
    type InterviewListItem,
} from '@/lib/api'

import { interviewsInfiniteQueryKey } from '../library/query-keys'
import { useVoidCallback } from '@/components/questions/picker/query-hook-helpers'
import { splitInfiniteQueryErrors } from '@/components/questions/picker/split-questions-query-errors'
import {getErrorMessage} from '@/lib/api-error';
import { useToastMessages } from '@/lib/use-toast-messages'

export type UseInterviewsInfiniteOptions = {
    params: Omit<FetchInterviewsParams, 'page'>
    enabled: boolean
    serverHydrated?: boolean
}

export type UseInterviewsInfiniteResult = {
    items: InterviewListItem[]
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

export function useInterviewsInfinite({
                                         params,
                                         enabled,
                                         serverHydrated,
                                     }: UseInterviewsInfiniteOptions): UseInterviewsInfiniteResult {
    const toastMessages = useToastMessages()
    const query = useInfiniteQuery({
        queryKey: interviewsInfiniteQueryKey(params),
        queryFn: ({ pageParam, signal }) =>
            fetchInterviews({ ...params, page: pageParam }, { signal }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage?.items?.length) return undefined
            const loaded = allPages.reduce((sum, p) => sum + (p.items?.length ?? 0), 0)
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

    const fetchNextPage = useVoidCallback(query.fetchNextPage)
    const refetch = useVoidCallback(query.refetch)

    const errorMessage = getErrorMessage(query.error, toastMessages.interviewsLibrary.loadFailedFallback) ?? null
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
