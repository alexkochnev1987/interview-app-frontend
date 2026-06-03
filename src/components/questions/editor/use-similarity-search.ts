'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

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
import {getErrorMessage} from "@/lib/api-error";

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
  runManualSearch: () => void
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

function buildSignature(value: QuestionInput): string {
  return JSON.stringify({
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
  })
}

type SimilarStatusState = {
  manualError: string | null
  canSearch: boolean
  isFetching: boolean
  queryError: string | null
  hasData: boolean
}

const SIMILAR_STATUS_RULES: ReadonlyArray<{
  status: SimilarStatus
  when: (state: SimilarStatusState) => boolean
}> = [
  { status: 'error', when: (state) => Boolean(state.manualError) },
  { status: 'idle', when: (state) => !state.canSearch },
  { status: 'loading', when: (state) => state.isFetching },
  { status: 'error', when: (state) => Boolean(state.queryError) },
  { status: 'success', when: (state) => state.hasData },
]

function deriveSimilarStatus(state: SimilarStatusState): SimilarStatus {
  return SIMILAR_STATUS_RULES.find((rule) => rule.when(state))?.status ?? 'idle'
}

type SimilarRequest = {
  signature: string
  value: QuestionInput
}

export function useSimilaritySearch({
  value,
  questionId,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  minQuestionTextLength = DEFAULT_MIN_TEXT_LENGTH,
}: UseSimilaritySearchOptions): UseSimilaritySearchResult {
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
  }, [value])

  const hasInput =
    signalSummary.textTokenCount > 0 ||
    signalSummary.tagCount > 0 ||
    signalSummary.conceptCount > 0 ||
    signalSummary.taxonomyCount > 0

  const signature = useMemo(() => buildSignature(value), [value])
  const canSearch = !questionTextTooShort(value.questionText, minQuestionTextLength)

  const [request, setRequest] = useState<SimilarRequest>(() => ({ signature, value }))

  useEffect(() => {
    if (signature === request.signature) return
    const handle = window.setTimeout(() => {
      setRequest({ signature, value })
    }, debounceMs)
    return () => window.clearTimeout(handle)
  }, [signature, value, request.signature, debounceMs])

  const query = useQuery({
    queryKey: similarQuestionsQueryKey(request.signature, questionId),
    queryFn: ({ signal }) =>
      findSimilarQuestions(request.value, questionId, 5, { signal }),
    enabled: canSearch,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })

  const runManualSearch = useCallback(() => {
    const currentText = value.questionText.trim()
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
    setRequest({ signature, value })
  }, [minQuestionTextLength, signature, value])

  useEffect(() => {
    if (manualError && canSearch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale manual error once input becomes searchable again
      setManualError(null)
    }
  }, [manualError, canSearch])

  const matches: SimilarQuestionMatch[] = query.data ?? []
  const queryError = getErrorMessage(query.error) ?? null
  const error = manualError ?? queryError

  const status = deriveSimilarStatus({
    manualError,
    canSearch,
    isFetching: query.isFetching,
    queryError,
    hasData: Boolean(query.data),
  })

  const resultsStale = query.isPlaceholderData || signature !== request.signature

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
