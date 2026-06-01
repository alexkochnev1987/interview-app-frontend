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
  canSearch: boolean
  resultsStale: boolean
  runManualSearch: () => Promise<void>
}

export const SIMILARITY_MIN_QUESTION_TEXT_LENGTH = 20

const DEFAULT_DEBOUNCE_MS = 1000
const DEFAULT_MIN_TEXT_LENGTH = SIMILARITY_MIN_QUESTION_TEXT_LENGTH

function questionTextTooShort(
  questionText: string,
  minQuestionTextLength: number,
): boolean {
  return questionText.trim().length < minQuestionTextLength
}

function deriveSimilarStatus({
  manualError,
  canSearch,
  matchCount,
  isFetching,
  queryErrorMessage,
  hasData,
}: {
  manualError: string | null
  canSearch: boolean
  matchCount: number
  isFetching: boolean
  queryErrorMessage: string | null
  hasData: boolean
}): SimilarStatus {
  if (manualError) return 'error'
  if (!canSearch) return matchCount > 0 ? 'success' : 'idle'
  if (isFetching) return 'loading'
  if (queryErrorMessage) return 'error'
  if (hasData) return 'success'
  return 'idle'
}

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

  const debouncedValueRef = useRef(value)

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
      debouncedValueRef.current = valueRef.current
      setDebouncedSignature(signature)
    }, debounceMs)
    return () => window.clearTimeout(handle)
  }, [signature, debouncedSignature, debounceMs])

  const trimmedQuestionText = value.questionText.trim()
  const textLongEnough = trimmedQuestionText.length >= minQuestionTextLength
  const canSearch = textLongEnough

  const query = useQuery({
    queryKey: similarQuestionsQueryKey(debouncedSignature, questionId),
    queryFn: ({ signal }) =>
      findSimilarQuestions(debouncedValueRef.current, questionId, 5, { signal }),
    enabled: canSearch,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })

  const queryClient = useQueryClient()
  const runManualSearch = useCallback(async () => {
    const currentText = valueRef.current.questionText.trim()
    if (!currentText) {
      setManualError('Add question text before searching for similar questions.')
      return
    }
    if (questionTextTooShort(currentText, minQuestionTextLength)) {
      setManualError(
        `Add at least ${minQuestionTextLength} characters of question text before searching.`,
      )
      return
    }
    setManualError(null)
    debouncedValueRef.current = valueRef.current
    setDebouncedSignature(signature)
    try {
      await queryClient.fetchQuery({
        queryKey: similarQuestionsQueryKey(signature, questionId),
        queryFn: ({ signal }) =>
          findSimilarQuestions(debouncedValueRef.current, questionId, 5, { signal }),
        staleTime: Infinity,
      })
    } catch (err) {
      setManualError(
        err instanceof Error ? err.message : 'Similarity search failed.',
      )
    }
  }, [minQuestionTextLength, queryClient, questionId, signature])

  useEffect(() => {
    if (manualError && canSearch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale manual error once input becomes searchable again
      setManualError(null)
    }
  }, [manualError, canSearch])

  const matches: SimilarQuestionMatch[] = query.data ?? []
  const queryErrorMessage =
    query.error instanceof Error ? query.error.message : null
  const error = manualError ?? queryErrorMessage

  const status = deriveSimilarStatus({
    manualError,
    canSearch,
    matchCount: matches.length,
    isFetching: query.isFetching,
    queryErrorMessage,
    hasData: Boolean(query.data),
  })

  const resultsStale = query.isPlaceholderData || signature !== debouncedSignature

  return {
    status,
    matches,
    error,
    signalSummary,
    hasInput,
    canSearch,
    resultsStale,
    runManualSearch,
  }
}
