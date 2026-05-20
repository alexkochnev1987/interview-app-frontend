'use client'

import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fetchQuestionFacets, type FacetCount, type FetchQuestionFacetsParams } from '@/lib/api'

import { questionFacetsQueryKey } from './query-keys'
import type { QuestionsQueryState } from './use-questions-query'

export type QuestionFacets = {
  difficulties: FacetCount[]
  categories: FacetCount[]
  subcategories: FacetCount[]
  roles: FacetCount[]
  tags: FacetCount[]
}

const EMPTY_FACETS: QuestionFacets = {
  difficulties: [],
  categories: [],
  subcategories: [],
  roles: [],
  tags: [],
}

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
): UseQuestionFacetsResult {
  const { difficulty, category, subcategory, role, status, tags } = snapshot

  const params = useMemo<FetchQuestionFacetsParams>(
    () => ({
      q: debouncedQ || undefined,
      difficulty,
      category,
      subcategory,
      tags: tags.length > 0 ? tags : undefined,
      role,
      status,
    }),
    [debouncedQ, difficulty, category, subcategory, role, status, tags],
  )

  const query = useQuery({
    queryKey: questionFacetsQueryKey(params),
    queryFn: ({ signal }) => fetchQuestionFacets(params, { signal }),
  })

  const facets: QuestionFacets = query.data
    ? {
        difficulties: query.data.difficulties,
        categories: query.data.categories,
        subcategories: query.data.subcategories,
        roles: query.data.roles,
        tags: query.data.tags,
      }
    : EMPTY_FACETS

  const queryRefetch = query.refetch
  const refetch = useCallback(() => {
    void queryRefetch()
  }, [queryRefetch])

  return {
    facets,
    loading: query.isPending || query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch,
  }
}
