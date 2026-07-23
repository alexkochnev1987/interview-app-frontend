import { useCallback, useEffect, useRef, useState } from 'react'

export function useMicTest(stream: MediaStream | null, micOn: boolean, isOpen: boolean) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)

  const teardownAudioElement = useCallback(() => {
    const audio = audioElementRef.current
    if (audio) {
      audio.pause()
      audio.onended = null
      audio.src = ''
      audioElementRef.current = null
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  useEffect(() => {
    return () => {
      stopRecording()
      teardownAudioElement()
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }
    }
  }, [stopRecording, teardownAudioElement])

  const startRecording = useCallback(() => {
    setError(null)

    if (!stream || !micOn) {
      setError('Microphone is not available.')
      return
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setError('A recording is already in progress.')
      return
    }

    const audioTracks = stream.getAudioTracks().filter((t) => t.readyState === 'live' && t.enabled)
    if (audioTracks.length === 0) {
      setError('No live microphone track found.')
      return
    }

    const audioOnlyStream = new MediaStream(audioTracks)

    teardownAudioElement()
    setIsPlaying(false)

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
      setAudioUrl(null)
    }

    const chunks: Blob[] = []

    try {
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(
          (type) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type),
      )

      const recorder = new MediaRecorder(audioOnlyStream, mimeType ? { mimeType } : undefined)

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data)
      }

      recorder.onstop = () => {
        setIsRecording(false)
        if (chunks.length === 0) return

        const type = recorder.mimeType || mimeType || 'audio/webm'
        const audioBlob = new Blob(chunks, { type })
        const url = URL.createObjectURL(audioBlob)
        audioUrlRef.current = url
        setAudioUrl(url)

        const audio = new Audio(url)
        audio.onended = () => setIsPlaying(false)
        audioElementRef.current = audio
      }

      recorder.onerror = () => {
        setError('Recording failed.')
        setIsRecording(false)
      }

      recorder.start(250)
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch {
      setError('Could not start recording.')
      setIsRecording(false)
    }
  }, [stream, micOn, teardownAudioElement])

  const togglePlayback = useCallback(() => {
    if (!audioElementRef.current) return

    if (isPlaying) {
      audioElementRef.current.pause()
      setIsPlaying(false)
    } else {
      audioElementRef.current.currentTime = 0
      void audioElementRef.current
          .play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch(() => {
            setIsPlaying(false)
          })
    }
  }, [isPlaying])

  useEffect(() => {
    if (!micOn || !isOpen) {
      if (isRecording) {
        stopRecording()
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [micOn, isOpen, isRecording, stopRecording])

  return {
    isRecording,
    audioUrl,
    isPlaying,
    error,
    startRecording,
    stopRecording,
    togglePlayback,
  }
}