'use client'

import { fetchInterviews, type FetchInterviewsParams, type InterviewListItem } from '@/lib/api'
import { useInfiniteResource, type UseInfiniteResourceResult } from '@/lib/use-infinite-resource'
import { useToastMessages } from '@/lib/use-toast-messages'

import { interviewsInfiniteQueryKey } from '../library/query-keys'

export type UseInterviewsInfiniteOptions = {
  params: Omit<FetchInterviewsParams, 'page'>
  enabled: boolean
  serverHydrated?: boolean
}

export type UseInterviewsInfiniteResult = UseInfiniteResourceResult<InterviewListItem>

export function useInterviewsInfinite({
  params,
  enabled,
  serverHydrated,
}: UseInterviewsInfiniteOptions): UseInterviewsInfiniteResult {
  const toastMessages = useToastMessages()

  return useInfiniteResource({
    queryKey: interviewsInfiniteQueryKey(params),
    queryFn: ({ pageParam, signal }) => fetchInterviews({ ...params, page: pageParam }, { signal }),
    enabled,
    serverHydrated,
    fallbackErrorMessage: toastMessages.interviewsLibrary.loadFailedFallback,
  })
}
