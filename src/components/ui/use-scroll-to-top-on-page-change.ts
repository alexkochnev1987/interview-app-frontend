'use client'

import { useEffect, useRef } from 'react'

/** Scrolls the returned ref's element into view on every page change after the first render. */
export function useScrollToTopOnPageChange(page: number) {
  const rootRef = useRef<HTMLDivElement>(null)
  const firstRenderRef = useRef(true)

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [page])

  return rootRef
}
