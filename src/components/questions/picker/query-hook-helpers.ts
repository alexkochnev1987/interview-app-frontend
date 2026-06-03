'use client'

import { useCallback } from 'react'

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
