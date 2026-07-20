import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DURATION_PRIMING_SEEK_TARGET,
  DURATION_PRIMING_TIMEOUT_MS,
  isDurationKnown,
  primeVideoDuration,
  type PrimeableVideo,
} from '@/lib/video-duration-priming'

type Listener = () => void

class FakeVideo implements PrimeableVideo {
  duration: number
  currentTime = 0
  private listeners = new Map<string, Set<Listener>>()

  constructor(duration: number) {
    this.duration = duration
  }

  addEventListener(type: string, listener: Listener) {
    const set = this.listeners.get(type) ?? new Set<Listener>()
    set.add(listener)
    this.listeners.set(type, set)
  }

  removeEventListener(type: string, listener: Listener) {
    this.listeners.get(type)?.delete(listener)
  }

  emit(type: string) {
    this.listeners.get(type)?.forEach((listener) => listener())
  }

  listenerCount(type: string) {
    return this.listeners.get(type)?.size ?? 0
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('isDurationKnown', () => {
  it('rejects Infinity, NaN, and non-positive values', () => {
    expect(isDurationKnown(Infinity)).toBe(false)
    expect(isDurationKnown(NaN)).toBe(false)
    expect(isDurationKnown(0)).toBe(false)
    expect(isDurationKnown(-1)).toBe(false)
  })

  it('accepts a finite positive duration', () => {
    expect(isDurationKnown(42)).toBe(true)
  })
})

describe('primeVideoDuration', () => {
  it('does nothing when the duration is already known', () => {
    const video = new FakeVideo(12)
    const onSettled = vi.fn()

    primeVideoDuration(video, { onSettled })

    expect(video.currentTime).toBe(0)
    expect(video.listenerCount('timeupdate')).toBe(0)
    expect(onSettled).not.toHaveBeenCalled()
  })

  it('seeks to the priming target to force the browser to resolve duration', () => {
    const video = new FakeVideo(Infinity)

    primeVideoDuration(video)

    expect(video.currentTime).toBe(DURATION_PRIMING_SEEK_TARGET)
    expect(video.listenerCount('timeupdate')).toBe(1)
    expect(video.listenerCount('durationchange')).toBe(1)
  })

  it('ignores interim timeupdates while the duration is still unknown', () => {
    const video = new FakeVideo(Infinity)

    primeVideoDuration(video)
    video.emit('timeupdate')

    expect(video.currentTime).toBe(DURATION_PRIMING_SEEK_TARGET)
    expect(video.listenerCount('timeupdate')).toBe(1)
  })

  it('resets to the start and reports success once the duration resolves', () => {
    const video = new FakeVideo(Infinity)
    const onSettled = vi.fn()

    primeVideoDuration(video, { onSettled })
    video.duration = 37
    video.emit('timeupdate')

    expect(video.currentTime).toBe(0)
    expect(video.listenerCount('timeupdate')).toBe(0)
    expect(onSettled).toHaveBeenCalledExactlyOnceWith(true)
  })

  it('resolves the duration from a durationchange event without a timeupdate', () => {
    const video = new FakeVideo(Infinity)
    const onSettled = vi.fn()

    primeVideoDuration(video, { onSettled })
    video.duration = 37
    video.emit('durationchange')

    expect(video.currentTime).toBe(0)
    expect(video.listenerCount('timeupdate')).toBe(0)
    expect(video.listenerCount('durationchange')).toBe(0)
    expect(onSettled).toHaveBeenCalledExactlyOnceWith(true)
  })

  it('detaches both listeners when cleanup runs before duration resolves', () => {
    const video = new FakeVideo(Infinity)
    const onSettled = vi.fn()

    const cleanup = primeVideoDuration(video, { onSettled })
    cleanup()

    expect(video.listenerCount('timeupdate')).toBe(0)
    expect(video.listenerCount('durationchange')).toBe(0)
    expect(onSettled).not.toHaveBeenCalled()
  })

  it('gives up on timeout, resets playback, and reports failure', () => {
    const video = new FakeVideo(Infinity)
    const onSettled = vi.fn()

    primeVideoDuration(video, { onSettled })
    vi.advanceTimersByTime(DURATION_PRIMING_TIMEOUT_MS)

    expect(video.currentTime).toBe(0)
    expect(video.listenerCount('timeupdate')).toBe(0)
    expect(onSettled).toHaveBeenCalledExactlyOnceWith(false)
  })

  it('does not fire the timeout after the duration already resolved', () => {
    const video = new FakeVideo(Infinity)
    const onSettled = vi.fn()

    primeVideoDuration(video, { onSettled })
    video.duration = 37
    video.emit('timeupdate')
    vi.advanceTimersByTime(DURATION_PRIMING_TIMEOUT_MS * 2)

    expect(onSettled).toHaveBeenCalledExactlyOnceWith(true)
    expect(video.currentTime).toBe(0)
  })

  it('does not report settlement after cleanup, even once the timeout elapses', () => {
    const video = new FakeVideo(Infinity)
    const onSettled = vi.fn()

    const cleanup = primeVideoDuration(video, { onSettled })
    cleanup()
    vi.advanceTimersByTime(DURATION_PRIMING_TIMEOUT_MS * 2)

    expect(onSettled).not.toHaveBeenCalled()
  })

  it('honours a custom timeout', () => {
    const video = new FakeVideo(Infinity)
    const onSettled = vi.fn()

    primeVideoDuration(video, { onSettled, timeoutMs: 500 })
    vi.advanceTimersByTime(499)
    expect(onSettled).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onSettled).toHaveBeenCalledExactlyOnceWith(false)
  })
})
