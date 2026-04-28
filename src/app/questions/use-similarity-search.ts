'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

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
  const [status, setStatus] = useState<SimilarStatus>('idle')
  const [matches, setMatches] = useState<SimilarQuestionMatch[]>([])
  const [error, setError] = useState<string | null>(null)
  const [lastFetchedSignature, setLastFetchedSignature] = useState<string | null>(null)

  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  })

  const signalSummary = useMemo<SimilaritySignalSummary>(() => {
    const textTokens = tokenize(value.questionText)
    return {
      conceptCount: value.expectedConcepts.filter((item) => item.label || item.id).length,
      tagCount: value.tags.filter((item) => item.trim()).length,
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
        concepts: value.expectedConcepts.map((item) => ({
          description: normalizeComparable(item.description),
          id: normalizeComparable(item.id),
          label: normalizeComparable(item.label),
        })),
        difficulty: value.difficulty,
        focus: normalizeComparable(value.focus),
        questionText: normalizeComparable(value.questionText),
        role: normalizeComparable(value.role),
        subcategory: normalizeComparable(value.subcategory),
        tags: value.tags.map((item) => normalizeComparable(item)).filter(Boolean),
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

  const resultsStale = lastFetchedSignature !== null && lastFetchedSignature !== signature

  useEffect(() => {
    if (!hasInput) return
    if (lastFetchedSignature === signature) return
    if (valueRef.current.questionText.trim().length < minQuestionTextLength) return

    let cancelled = false
    const timer = setTimeout(async () => {
      setError(null)
      setStatus('loading')

      try {
        const result = await findSimilarQuestions(valueRef.current, questionId)
        if (cancelled) return
        setMatches(result)
        setStatus('success')
        setLastFetchedSignature(signature)
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to load similar questions.')
        setLastFetchedSignature(signature)
      }
    }, debounceMs)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [signature, hasInput, lastFetchedSignature, questionId, debounceMs, minQuestionTextLength])

  async function runManualSearch() {
    if (!hasInput) {
      setStatus('error')
      setError('Add prompt text, taxonomy, tags, or rubric concepts before searching.')
      return
    }

    setError(null)
    setStatus('loading')
    setLastFetchedSignature(signature)

    try {
      const result = await findSimilarQuestions(valueRef.current, questionId)
      setMatches(result)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to load similar questions.')
    }
  }

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
