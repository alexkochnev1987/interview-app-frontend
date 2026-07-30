import { useEffect, useRef, useState } from 'react'

const AudioCtx =
  typeof window !== 'undefined'
    ? window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    : null

let sharedAudioContext: AudioContext | null = null

function getSharedAudioContext(): AudioContext | null {
  if (!AudioCtx) return null
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    try {
      sharedAudioContext = new AudioCtx()
    } catch {
      sharedAudioContext = null
    }
  }
  return sharedAudioContext
}

export function useMicLevel(stream: MediaStream | null): number {
  const [level, setLevel] = useState<number>(0)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!stream || !AudioCtx) {
      setLevel(0)
      return
    }

    const liveTracks = stream.getAudioTracks().filter((t) => t.readyState === 'live' && t.enabled)

    if (liveTracks.length === 0) {
      setLevel(0)
      return
    }

    let cancelled = false
    let source: MediaStreamAudioSourceNode | null = null

    try {
      const audioContext = getSharedAudioContext()
      if (!audioContext) return

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.3

      source = audioContext.createMediaStreamSource(new MediaStream(liveTracks))
      source.connect(analyser)

      const data = new Uint8Array(analyser.fftSize)
      let lastUpdateMs = 0
      let lastLevel = 0
      const THROTTLE_MS = 60

      const tick = (timestamp: number) => {
        if (cancelled) return

        analyser.getByteTimeDomainData(data)

        let sumSq = 0
        for (let i = 0; i < data.length; i++) {
          const s = (data[i] - 128) / 128
          sumSq += s * s
        }
        const rms = Math.sqrt(sumSq / data.length)
        const normalized = Math.min(1, rms * 6)

        if (timestamp - lastUpdateMs >= THROTTLE_MS || Math.abs(normalized - lastLevel) >= 0.05) {
          lastUpdateMs = timestamp
          lastLevel = normalized
          setLevel(normalized)
        }

        animFrameRef.current = requestAnimationFrame(tick)
      }

      tick(performance.now())
      void audioContext.resume()
    } catch {}

    return () => {
      cancelled = true
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
      source?.disconnect()
      setLevel(0)
    }
  }, [stream])

  return level
}
