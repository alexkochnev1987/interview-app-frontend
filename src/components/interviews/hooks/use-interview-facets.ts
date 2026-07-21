'use client'

import { useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
    fetchInterviewFacets,
    type InterviewFacetsResponse,
} from '@/lib/api'
import {
    buildInterviewFacetsParams,
    EMPTY_INTERVIEW_FACETS,
    type InterviewsQueryState,
} from '@/lib/interviews-query-state'
import { interviewFacetsQueryKey } from '../library/query-keys'
import { isPlaceholderLoading, useVoidCallback } from '@/components/questions/picker/query-hook-helpers'
import {getErrorMessage} from '@/lib/api-error';
import { useToastMessages } from '@/lib/use-toast-messages'

export type UseInterviewFacetsResult = {
    facets: InterviewFacetsResponse
    loading: boolean
    error: string | null
    refetch: () => void
}

type FilterSnapshot = Pick<InterviewsQueryState, 'position' | 'status' | 'assignedHrId'>

export function useInterviewFacets(
    snapshot: FilterSnapshot,
    debouncedQ: string,
): UseInterviewFacetsResult {
    const toastMessages = useToastMessages()
    const params = useMemo(
        () => buildInterviewFacetsParams(snapshot, debouncedQ),
        [snapshot, debouncedQ],
    )

    const query = useQuery({
        queryKey: interviewFacetsQueryKey(params),
        queryFn: ({ signal }) => fetchInterviewFacets(params, { signal }),
        placeholderData: keepPreviousData,
    })

    const refetch = useVoidCallback(query.refetch)

    return {
        facets: query.data ?? EMPTY_INTERVIEW_FACETS,
        loading: isPlaceholderLoading(query),
        error: getErrorMessage(query.error, toastMessages.interviewsLibrary.loadFailedFallback) ?? null,
        refetch,
    }
}