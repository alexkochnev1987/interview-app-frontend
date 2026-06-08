import { useCallback, useEffect, useRef, useState } from 'react'

const REFRESH_INTERVAL_MS = 4000
const MAX_POLL_DURATION_MS = 5 * 60 * 1000
const FAILURE_THRESHOLD = 3
// After triggering backend work we keep polling for this window even before the
// data reflects it, so the live loop reliably engages despite async lag.
const KICK_WINDOW_MS = 30 * 1000

export interface LivePolling<T> {
  data: T
  /** One-shot fetch. Also re-arms the loop if it was paused. */
  refresh: () => Promise<void>
  /**
   * Force the live loop to run for a short grace window even if the data does
   * not yet show an active state. Use right after triggering backend work
   * (start/rerun evaluation) that will not be reflected by the next fetch.
   */
  kick: () => void
  /** Live updates have stopped (repeated failures or the duration cap). */
  paused: boolean
}

/**
 * Polls `fetcher` while `shouldPoll(data)` is true. Polling stops on three
 * consecutive failures or after MAX_POLL_DURATION_MS; both surface as `paused`,
 * and both resume only when the consumer calls `refresh()` (manual retry) or
 * `kick()`. There is a single pause concept and a single resume path.
 */
export function useLivePolling<T>(
  initial: T,
  fetcher: () => Promise<T>,
  shouldPoll: (data: T) => boolean,
): LivePolling<T> {
  const [data, setData] = useState(initial)
  // Resync to fresh server-provided data (navigation / router.refresh) without
  // an effect. Reference comparison is intentional: a new prop means new data.
  const [syncedFrom, setSyncedFrom] = useState(initial)
  if (syncedFrom !== initial) {
    setSyncedFrom(initial)
    setData(initial)
  }

  const [paused, setPaused] = useState(false)
  const [kicking, setKicking] = useState(false)
  const inFlightRef = useRef(false)
  const failuresRef = useRef(0)

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    try {
      const next = await fetcher()
      failuresRef.current = 0
      setData(next)
      setPaused(false)
    } catch {
      failuresRef.current += 1
      if (failuresRef.current >= FAILURE_THRESHOLD) setPaused(true)
    } finally {
      inFlightRef.current = false
    }
  }, [fetcher])

  const kick = useCallback(() => {
    failuresRef.current = 0
    setPaused(false)
    setKicking(true)
  }, [])

  // The kick window is self-clearing; once it lapses, `shouldPoll` alone decides
  // whether the loop keeps running.
  useEffect(() => {
    if (!kicking) return
    const id = setTimeout(() => setKicking(false), KICK_WINDOW_MS)
    return () => clearTimeout(id)
  }, [kicking])

  const active = !paused && (shouldPoll(data) || kicking)
  useEffect(() => {
    if (!active) return
    failuresRef.current = 0
    const startedAt = Date.now()
    const id = setInterval(() => {
      if (Date.now() - startedAt >= MAX_POLL_DURATION_MS) {
        setPaused(true)
        return
      }
      void refresh()
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [active, refresh])

  return { data, refresh, kick, paused }
}
