'use client'

import { useEffect, useMemo, useState } from 'react'

import { fetchQuestionFacets, type FacetCount, type FetchQuestionFacetsParams } from '@/lib/api'

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
  retry: () => void
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

function buildParams(snapshot: FilterSnapshot, debouncedQ: string): FetchQuestionFacetsParams {
  return {
    q: debouncedQ || undefined,
    difficulty: snapshot.difficulty,
    category: snapshot.category,
    subcategory: snapshot.subcategory,
    tags: snapshot.tags.length > 0 ? snapshot.tags : undefined,
    role: snapshot.role,
    status: snapshot.status,
  }
}

export function useQuestionFacets(
  snapshot: FilterSnapshot,
  debouncedQ: string,
): UseQuestionFacetsResult {
  const [facets, setFacets] = useState<QuestionFacets>(EMPTY_FACETS)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [completedKey, setCompletedKey] = useState<string | null>(null)

  const params = useMemo(() => buildParams(snapshot, debouncedQ), [snapshot, debouncedQ])
  const paramsKey = useMemo(
    () => `${JSON.stringify(params)}::${attempt}`,
    [params, attempt],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchQuestionFacets(params, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return
        setFacets({
          difficulties: response.difficulties,
          categories: response.categories,
          subcategories: response.subcategories,
          roles: response.roles,
          tags: response.tags,
        })
        setError(null)
        setCompletedKey(paramsKey)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Failed to load filter options.')
        setCompletedKey(paramsKey)
      })

    return () => controller.abort()
  }, [paramsKey, params])

  const loading = completedKey !== paramsKey

  return {
    facets,
    loading,
    error,
    retry: () => setAttempt((value) => value + 1),
  }
}
