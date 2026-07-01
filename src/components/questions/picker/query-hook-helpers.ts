'use client'

import { useCallback, useEffect, useState } from 'react'

type PlaceholderLoadingFlags = {
  isPending: boolean
  isFetching: boolean
  isPlaceholderData: boolean
}

export function isPlaceholderLoading(query: PlaceholderLoadingFlags): boolean {
  return query.isPending || (query.isFetching && query.isPlaceholderData)
}

export function useVoidCallback(callback: () => Promise<unknown>): () => void {
  return useCallback(() => {
    void callback()
  }, [callback])
}

export function useDebouncedSearchValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    if (value === '') {
      setDebounced('')
      return
    }
    const handle = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(handle)
  }, [value, delayMs])

  return debounced
}
