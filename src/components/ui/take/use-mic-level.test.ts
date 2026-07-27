import { describe, expect, it, vi } from 'vitest'
import { useMicLevel } from './use-mic-level'
import * as React from 'react'

// Mock React hooks since we are running in a Node environment without a DOM or test renderer
vi.mock('react', () => ({
  useState: vi.fn(),
  useEffect: vi.fn(),
  useRef: vi.fn(),
}))

describe('useMicLevel', () => {
  it('initializes with level 0 and sets up the effect', () => {
    const setLevel = vi.fn()
    vi.mocked(React.useState).mockReturnValue([0, setLevel])
    vi.mocked(React.useRef).mockReturnValue({ current: null })
    
    // We can cast null to MediaStream for the simple test
    const level = useMicLevel(null)

    expect(level).toBe(0)
    expect(React.useState).toHaveBeenCalledWith(0)
    
    // The effect should be registered, depending on the stream
    expect(React.useEffect).toHaveBeenCalledWith(expect.any(Function), [null])
  })

  it('can be called with a mocked stream', () => {
    const setLevel = vi.fn()
    vi.mocked(React.useState).mockReturnValue([0, setLevel])
    vi.mocked(React.useRef).mockReturnValue({ current: null })
    
    const mockStream = { getAudioTracks: () => [] } as unknown as MediaStream
    const level = useMicLevel(mockStream)

    expect(level).toBe(0)
    expect(React.useEffect).toHaveBeenCalledWith(expect.any(Function), [mockStream])
  })
})
