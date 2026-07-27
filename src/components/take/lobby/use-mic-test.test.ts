import { describe, expect, it, vi } from 'vitest'
import { useMicTest } from './use-mic-test'
import * as React from 'react'

// Mock React hooks since we are running in a Node environment without a DOM or test renderer
vi.mock('react', () => {
  return {
    useState: vi.fn(),
    useRef: vi.fn(),
    useEffect: vi.fn(),
    useCallback: vi.fn((fn) => fn),
  }
})

describe('useMicTest', () => {
  it('initializes with default state', () => {
    // Return values for our state: [value, setter]
    vi.mocked(React.useState)
      .mockReturnValueOnce([false, vi.fn()]) // isRecording
      .mockReturnValueOnce([null, vi.fn()])  // audioUrl
      .mockReturnValueOnce([false, vi.fn()]) // isPlaying
      .mockReturnValueOnce([null, vi.fn()])  // error

    vi.mocked(React.useRef).mockReturnValue({ current: null })

    const result = useMicTest(null, true, true)

    expect(result.isRecording).toBe(false)
    expect(result.audioUrl).toBeNull()
    expect(result.isPlaying).toBe(false)
    expect(result.error).toBeNull()
    expect(typeof result.startRecording).toBe('function')
    expect(typeof result.stopRecording).toBe('function')
    expect(typeof result.togglePlayback).toBe('function')
  })

  it('sets error when trying to start recording without a stream', () => {
    const setError = vi.fn()

    vi.mocked(React.useState)
      .mockReturnValueOnce([false, vi.fn()]) 
      .mockReturnValueOnce([null, vi.fn()])  
      .mockReturnValueOnce([false, vi.fn()]) 
      .mockReturnValueOnce([null, setError]) // error

    vi.mocked(React.useRef).mockReturnValue({ current: null })

    const { startRecording } = useMicTest(null, true, true)
    
    startRecording()

    expect(setError).toHaveBeenCalledWith('Microphone is not available.')
  })
})
