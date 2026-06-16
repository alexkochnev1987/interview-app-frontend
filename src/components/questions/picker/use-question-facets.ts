'use client'

import { useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  fetchQuestionFacets,
  type QuestionFacetsResponse,
} from '@/lib/api'
import {
  buildQuestionFacetsParams,
  EMPTY_QUESTION_FACETS,
  type QuestionsQueryState,
} from '@/lib/questions-query-state'
import { questionFacetsQueryKey } from './query-keys'
import { isPlaceholderLoading, useVoidCallback } from './query-hook-helpers'
import {getErrorMessage} from '@/lib/api-error';
import { useToastMessages } from '@/lib/use-toast-messages'

export type UseQuestionFacetsResult = {
  facets: QuestionFacetsResponse
  loading: boolean
  error: string | null
  refetch: () => void
}

type FilterSnapshot = Pick<
  QuestionsQueryState,
  | 'q'
  | 'difficulty'
  | 'category'
  | 'subcategory'
  | 'tags'
  | 'role'
  | 'status'
>

export function useQuestionFacets(
  snapshot: FilterSnapshot,
  debouncedQ: string,
): UseQuestionFacetsResult {
  const toastMessages = useToastMessages()
  const params = useMemo(
    () => buildQuestionFacetsParams(snapshot, debouncedQ),
    [snapshot, debouncedQ],
  )

  const query = useQuery({
    queryKey: questionFacetsQueryKey(params),
    queryFn: ({ signal }) => fetchQuestionFacets(params, { signal }),
    placeholderData: keepPreviousData,
  })

  const refetch = useVoidCallback(query.refetch)

  return {
    facets: query.data ?? EMPTY_QUESTION_FACETS,
    loading: isPlaceholderLoading(query),
    error: getErrorMessage(query.error, toastMessages.questions.loadFailedFallback) ?? null,
    refetch,
  }
}