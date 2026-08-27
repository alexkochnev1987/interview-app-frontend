'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { fetchCandidates, type CandidateSummary } from '@/lib/api'
import { getErrorMessage } from '@/lib/api-error'

import { candidatesQueryKey } from './query-keys'

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2
/** Stable reference so callers can safely compare `candidates` by identity between renders. */
const EMPTY_CANDIDATES: CandidateSummary[] = []

/** Debounced name/email search backing the candidate-name typeahead. */
export function useCandidateSearch(query: string, options?: { enabled?: boolean }) {
  const t = useTranslations('questions.common')
  const trimmed = query.trim()
  const enabled = (options?.enabled ?? true) && trimmed.length >= MIN_QUERY_LENGTH

  const [debounced, setDebounced] = useState(trimmed)

  useEffect(() => {
    if (trimmed === debounced) return
    const handle = window.setTimeout(() => setDebounced(trimmed), DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [trimmed, debounced])

  const result = useQuery({
    queryKey: [...candidatesQueryKey(), debounced],
    queryFn: ({ signal }) => fetchCandidates({ q: debounced }, { signal }),
    enabled: enabled && debounced.length >= MIN_QUERY_LENGTH,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })

  return {
    candidates: enabled ? (result.data ?? EMPTY_CANDIDATES) : EMPTY_CANDIDATES,
    loading: enabled && (result.isLoading || debounced !== trimmed),
    error: getErrorMessage(result.error, t('candidateSelectLoadError')) ?? null,
  }
}
