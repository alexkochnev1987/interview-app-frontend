'use client'

import { useCallback, useMemo } from 'react'
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

export type QuestionFacets = QuestionFacetsResponse
export type UseQuestionFacetsResult = {
  facets: QuestionFacets
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
  initialFacets?: QuestionFacetsResponse,
): UseQuestionFacetsResult {
  const params = useMemo(
    () => buildQuestionFacetsParams(snapshot, debouncedQ),
    [snapshot, debouncedQ],
  )

  const query = useQuery({
    queryKey: questionFacetsQueryKey(params),
    queryFn: ({ signal }) => fetchQuestionFacets(params, { signal }),
    placeholderData: keepPreviousData,
    initialData: initialFacets,
  })

  const queryRefetch = query.refetch
  const refetch = useCallback(() => {
    void queryRefetch()
  }, [queryRefetch])

  return {
    facets: query.data ?? EMPTY_QUESTION_FACETS,
    loading:
      query.isPending || (query.isFetching && query.isPlaceholderData),
    error: query.error instanceof Error ? query.error.message : null,
    refetch,
  }
}