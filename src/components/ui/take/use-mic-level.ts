import { useEffect, useRef, useState } from 'react'

const AudioCtx =
  typeof window !== 'undefined'
    ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    : null

export function useMicLevel(stream: MediaStream | null): number {
  const [level, setLevel] = useState<number>(0)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!stream || !AudioCtx) {
      return
    }

    const liveTracks = stream.getAudioTracks().filter(
      (t) => t.readyState === 'live' && t.enabled,
    )

    if (liveTracks.length === 0) {
      return
    }

    let cancelled = false
    let audioContext: AudioContext | null = null
    let source: MediaStreamAudioSourceNode | null = null

    try {
      audioContext = new AudioCtx()

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.3

      source = audioContext.createMediaStreamSource(new MediaStream(liveTracks))
      source.connect(analyser)

      const data = new Uint8Array(analyser.fftSize)

      const tick = () => {
        if (cancelled) return

        analyser.getByteTimeDomainData(data)

        let sumSq = 0
        for (let i = 0; i < data.length; i++) {
          const s = (data[i] - 128) / 128
          sumSq += s * s
        }
        const rms = Math.sqrt(sumSq / data.length)
        const normalized = Math.min(1, rms * 6)
        setLevel(normalized)

        animFrameRef.current = requestAnimationFrame(tick)
      }

      tick()
      void audioContext.resume()
    } catch {
    }

    return () => {
      cancelled = true
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
      source?.disconnect()
      if (audioContext && audioContext.state !== 'closed') {
        void audioContext.close()
      }
      setLevel(0)
    }
  }, [stream])

  return level
}
