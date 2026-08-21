'use client'

import { fetchQuestions, type FetchQuestionsParams, type Question } from '@/lib/api'
import { useInfiniteResource, type UseInfiniteResourceResult } from '@/lib/use-infinite-resource'
import { useToastMessages } from '@/lib/use-toast-messages'

import { questionsInfiniteQueryKey } from './query-keys'

export type UseQuestionsInfiniteOptions = {
  params: Omit<FetchQuestionsParams, 'page'>
  enabled: boolean
  serverHydrated?: boolean
}

export type UseQuestionsInfiniteResult = UseInfiniteResourceResult<Question>

export function useQuestionsInfinite({
  params,
  enabled,
  serverHydrated,
}: UseQuestionsInfiniteOptions): UseQuestionsInfiniteResult {
  const toastMessages = useToastMessages()

  return useInfiniteResource({
    queryKey: questionsInfiniteQueryKey(params),
    queryFn: ({ pageParam, signal }) => fetchQuestions({ ...params, page: pageParam }, { signal }),
    enabled,
    serverHydrated,
    fallbackErrorMessage: toastMessages.questions.loadFailedFallback,
  })
}
