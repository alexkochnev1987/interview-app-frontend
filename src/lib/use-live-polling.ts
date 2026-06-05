import { useCallback, useEffect, useRef, useState } from 'react'

const REFRESH_INTERVAL_MS = 4000
const MAX_POLL_DURATION_MS = 5 * 60 * 1000
const FAILURE_THRESHOLD = 3

export interface LivePolling<T> {
  data: T
  refresh: () => Promise<void>
  paused: boolean
}

export function useLivePolling<T>(
  initial: T,
  fetcher: () => Promise<T>,
  getActiveKey: (data: T) => string,
): LivePolling<T> {
  const [data, setData] = useState(initial)
  const [syncedFrom, setSyncedFrom] = useState(initial)
  if (syncedFrom !== initial) {
    setSyncedFrom(initial)
    setData(initial)
  }

  const [paused, setPaused] = useState(false)
  const inFlightRef = useRef(false)
  const failuresRef = useRef(0)

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    try {
      setData(await fetcher())
      failuresRef.current = 0
      setPaused(false)
    } catch {
      failuresRef.current += 1
      if (failuresRef.current >= FAILURE_THRESHOLD) setPaused(true)
    } finally {
      inFlightRef.current = false
    }
  }, [fetcher])

  const activeKey = getActiveKey(data)
  useEffect(() => {
    if (!activeKey) return
    failuresRef.current = 0
    const startedAt = Date.now()
    const id = setInterval(() => {
      if (Date.now() - startedAt >= MAX_POLL_DURATION_MS) {
        setPaused(true)
        clearInterval(id)
        return
      }
      void refresh()
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [activeKey, refresh])

  return { data, refresh, paused }
}
