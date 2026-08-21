'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { usePathname, useRouter } from '@/i18n/navigation'

export interface UseSearchDebounceOptions {
  value: string
  delayMs?: number
}

export function useSearchDebounce({ value, delayMs = 300 }: UseSearchDebounceOptions): {
  debouncedValue: string
  isPending: boolean
  setDebouncedValue: (value: string) => void
} {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    if (value === debouncedValue) return
    const handle = window.setTimeout(() => setDebouncedValue(value), delayMs)
    return () => window.clearTimeout(handle)
  }, [value, debouncedValue, delayMs])

  return {
    debouncedValue,
    isPending: value !== debouncedValue,
    setDebouncedValue,
  }
}

export interface UseStoredViewHydrationOptions<TView extends string> {
  serverHydrated?: boolean
  syncUrl?: boolean
  searchParams: ReturnType<typeof useSearchParams>
  readStoredView: () => TView | null
  onHydrate: (view: TView) => void
}

export function useStoredViewHydration<TView extends string>({
  serverHydrated,
  syncUrl,
  searchParams,
  readStoredView,
  onHydrate,
}: UseStoredViewHydrationOptions<TView>): void {
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    if (serverHydrated) return
    if (syncUrl && searchParams?.get('view') !== null) return
    const stored = readStoredView()
    if (stored) {
      onHydrate(stored)
    }
  }, [serverHydrated, syncUrl, searchParams, readStoredView, onHydrate])
}

export interface UseUrlStateSyncOptions<TState> {
  syncUrl?: boolean
  stateUrl: string
  searchParams: ReturnType<typeof useSearchParams>
  readFromUrl: (params: URLSearchParams) => TState
  onExternalUrlChange: (nextState: TState) => void
}

export function useUrlStateSync<TState>({
  syncUrl,
  stateUrl,
  searchParams,
  readFromUrl,
  onExternalUrlChange,
}: UseUrlStateSyncOptions<TState>): void {
  const router = useRouter()
  const pathname = usePathname()
  const lastWrittenUrlRef = useRef<string | null>(
    syncUrl && searchParams ? searchParams.toString() : null,
  )

  useEffect(() => {
    if (!syncUrl) return
    const currentUrl = searchParams ? searchParams.toString() : ''
    if (stateUrl === currentUrl) {
      lastWrittenUrlRef.current = currentUrl
      return
    }
    if (currentUrl !== lastWrittenUrlRef.current) {
      const nextState = readFromUrl(searchParams ?? new URLSearchParams())
      lastWrittenUrlRef.current = currentUrl
      onExternalUrlChange(nextState)
      return
    }
    const url = stateUrl.length > 0 ? `${pathname}?${stateUrl}` : pathname
    lastWrittenUrlRef.current = stateUrl
    router.replace(url, { scroll: false })
  }, [stateUrl, pathname, router, syncUrl, searchParams, readFromUrl, onExternalUrlChange])
}

export function usePageClamp(
  total: number | undefined,
  limit: number,
  page: number,
  onClampPage: (clampedPage: number) => void,
): void {
  const stableOnClamp = useCallback(
    (clampedPage: number) => onClampPage(clampedPage),
    [onClampPage],
  )

  useEffect(() => {
    if (total === undefined) return
    const maxPage = Math.max(1, Math.ceil(total / limit))
    if (page > maxPage) {
      stableOnClamp(maxPage)
    }
  }, [total, limit, page, stableOnClamp])
}
