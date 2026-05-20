'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { similarQuestionsQueryKey } from '@/components/questions/picker/query-keys'
import {
  findSimilarQuestions,
  type QuestionInput,
  type SimilarQuestionMatch,
} from '@/lib/api'
import {
  normalizeComparable,
  tokenize,
  type SimilaritySignalSummary,
  type SimilarStatus,
} from '@/lib/question-editor/parsers'

interface UseSimilaritySearchOptions {
  value: QuestionInput
  questionId?: string
  debounceMs?: number
  minQuestionTextLength?: number
}

interface UseSimilaritySearchResult {
  status: SimilarStatus
  matches: SimilarQuestionMatch[]
  error: string | null
  signalSummary: SimilaritySignalSummary
  hasInput: boolean
  resultsStale: boolean
  runManualSearch: () => Promise<void>
}

const DEFAULT_DEBOUNCE_MS = 1000
const DEFAULT_MIN_TEXT_LENGTH = 20

export function useSimilaritySearch({
  value,
  questionId,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  minQuestionTextLength = DEFAULT_MIN_TEXT_LENGTH,
}: UseSimilaritySearchOptions): UseSimilaritySearchResult {
  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  }, [value])

  const [manualError, setManualError] = useState<string | null>(null)

  const signalSummary = useMemo<SimilaritySignalSummary>(() => {
    const textTokens = tokenize(value.questionText)
    return {
      conceptCount: (value.expectedConcepts || []).filter((item) => {
        if (typeof item === 'string') return item.trim().length > 0
        return Boolean(item.label?.trim() || item.id?.trim())
      }).length,
      tagCount: (value.tags || []).filter((item) => item.trim()).length,
      taxonomyCount: [value.category, value.subcategory, value.role, value.focus].filter(
        (item) => item?.trim(),
      ).length,
      textTokenCount: textTokens.length,
    }
  }, [
    value.category,
    value.expectedConcepts,
    value.focus,
    value.questionText,
    value.role,
    value.subcategory,
    value.tags,
  ])

  const hasInput =
    signalSummary.textTokenCount > 0 ||
    signalSummary.tagCount > 0 ||
    signalSummary.conceptCount > 0 ||
    signalSummary.taxonomyCount > 0

  const signature = useMemo(
    () =>
      JSON.stringify({
        category: normalizeComparable(value.category),
        concepts: (value.expectedConcepts || []).map((item) =>
          typeof item === 'string'
            ? {
                description: '',
                id: normalizeComparable(item),
                label: normalizeComparable(item),
              }
            : {
                description: normalizeComparable(item.description),
                id: normalizeComparable(item.id),
                label: normalizeComparable(item.label),
              },
        ),
        difficulty: value.difficulty,
        focus: normalizeComparable(value.focus),
        questionText: normalizeComparable(value.questionText),
        role: normalizeComparable(value.role),
        subcategory: normalizeComparable(value.subcategory),
        tags: (value.tags || []).map((item) => normalizeComparable(item)).filter(Boolean),
      }),
    [
      value.category,
      value.difficulty,
      value.expectedConcepts,
      value.focus,
      value.questionText,
      value.role,
      value.subcategory,
      value.tags,
    ],
  )

  const [debouncedSignature, setDebouncedSignature] = useState(signature)
  useEffect(() => {
    if (signature === debouncedSignature) return
    const handle = window.setTimeout(() => {
      setDebouncedSignature(signature)
    }, debounceMs)
    return () => window.clearTimeout(handle)
  }, [signature, debouncedSignature, debounceMs])

  const textLongEnough =
    value.questionText.trim().length >= minQuestionTextLength

  const query = useQuery({
    queryKey: similarQuestionsQueryKey(debouncedSignature, questionId),
    queryFn: ({ signal }) =>
      findSimilarQuestions(valueRef.current, questionId, 5, { signal }),
    enabled: hasInput && textLongEnough,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })

  const queryClient = useQueryClient()
  const runManualSearch = useCallback(async () => {
    if (!hasInput) {
      setManualError(
        'Add prompt text, taxonomy, tags, or rubric concepts before searching.',
      )
      return
    }
    setManualError(null)
    setDebouncedSignature(signature)
    await queryClient.fetchQuery({
      queryKey: similarQuestionsQueryKey(signature, questionId),
      queryFn: ({ signal }) =>
        findSimilarQuestions(valueRef.current, questionId, 5, { signal }),
      staleTime: Infinity,
    })
  }, [hasInput, queryClient, questionId, signature])

  useEffect(() => {
    if (manualError && hasInput) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale manual error once input becomes searchable again
      setManualError(null)
    }
  }, [manualError, hasInput])

  const matches: SimilarQuestionMatch[] = query.data ?? []
  const queryErrorMessage =
    query.error instanceof Error ? query.error.message : null
  const error = manualError ?? queryErrorMessage

  const status: SimilarStatus = manualError
    ? 'error'
    : !hasInput || !textLongEnough
      ? matches.length > 0
        ? 'success'
        : 'idle'
      : query.isFetching
        ? 'loading'
        : queryErrorMessage
          ? 'error'
          : query.data
            ? 'success'
            : 'idle'

  const resultsStale = query.isPlaceholderData || signature !== debouncedSignature

  return {
    status,
    matches,
    error,
    signalSummary,
    hasInput,
    resultsStale,
    runManualSearch,
  }
}
