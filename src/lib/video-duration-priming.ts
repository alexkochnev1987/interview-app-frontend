export const DURATION_PRIMING_SEEK_TARGET = 1e7

export const DURATION_PRIMING_TIMEOUT_MS = 15_000

type PrimingEvent = 'timeupdate' | 'durationchange'

export interface PrimeableVideo {
  duration: number
  currentTime: number
  addEventListener(type: PrimingEvent, listener: () => void): void
  removeEventListener(type: PrimingEvent, listener: () => void): void
}

export interface PrimeVideoDurationOptions {
  timeoutMs?: number
  onSettled?: (resolved: boolean) => void
}

export function isDurationKnown(duration: number): boolean {
  return Number.isFinite(duration) && duration > 0
}

export function primeVideoDuration(
  video: PrimeableVideo,
  options: PrimeVideoDurationOptions = {},
): () => void {
  if (isDurationKnown(video.duration)) {
    return () => {}
  }

  const { timeoutMs = DURATION_PRIMING_TIMEOUT_MS, onSettled } = options
  let settled = false
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  function detach(): boolean {
    if (settled) {
      return false
    }
    settled = true
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    video.removeEventListener('timeupdate', handleDurationResolved)
    video.removeEventListener('durationchange', handleDurationResolved)
    return true
  }

  function handleDurationResolved() {
    if (!isDurationKnown(video.duration)) {
      return
    }
    if (!detach()) {
      return
    }
    video.currentTime = 0
    onSettled?.(true)
  }

  timeoutId = setTimeout(() => {
    if (!detach()) {
      return
    }
    video.currentTime = 0
    onSettled?.(false)
  }, timeoutMs)

  video.addEventListener('timeupdate', handleDurationResolved)
  video.addEventListener('durationchange', handleDurationResolved)
  video.currentTime = DURATION_PRIMING_SEEK_TARGET

  return detach
}
