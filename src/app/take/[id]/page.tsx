'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import {
  Camera,
  CheckCircle2,
  CircleAlert,
  CircleDot,
  Mic,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react'

import { EyebrowBadge } from '@/components/app/eyebrow-badge'
import { MetricPanel } from '@/components/app/metric-panel'
import { StatusPill } from '@/components/app/status-pill'
import { LoadingStateCard } from '@/components/app/state-card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

interface InterviewData {
  id: string
  position: string
  candidateName: string
  totalQuestions: number
  currentQuestion: { text: string } | null
  currentQuestionIndex: number
  currentAnswerMeta: {
    status: 'recording' | 'submitted'
    versionCount: number
    selectedVersionNumber: number
  } | null
  completed: boolean
}

type Stage = 'loading' | 'consent' | 'interview' | 'recording' | 'transition' | 'complete'
type PermissionStatus = 'idle' | 'pending' | 'granted' | 'denied'
type CaptureTarget = 'camera' | 'screen'
type PendingVersionAction = 'submit' | 'rerecord' | null
type ScreenTrackSettings = MediaTrackSettings & { displaySurface?: string }
type InterviewDisplayMediaOptions = DisplayMediaStreamOptions & {
  monitorTypeSurfaces?: 'include' | 'exclude'
  selfBrowserSurface?: 'include' | 'exclude'
  surfaceSwitching?: 'include' | 'exclude'
  systemAudio?: 'include' | 'exclude'
}

interface AnswerBehaviorSignals {
  tabHiddenCount: number
  windowBlurCount: number
  pasteCount: number
  keydownCount: number
  resizeCount: number
}

interface AnswerBehaviorEvent {
  eventType: 'tab_hidden' | 'window_blur' | 'paste' | 'keydown' | 'resize'
  occurredAt: string
  versionNumber: number
}

interface MultipartUploadSessionResponse {
  mediaKey: string
  uploadId: string
}

interface MultipartUploadPartResponse {
  mediaKey: string
  uploadId: string
  partNumber: number
  uploadUrl: string
}

interface MultipartUploadSession {
  mediaKey: string
  uploadId: string
  nextPartNumber: number
  bufferedChunks: Blob[]
  bufferedBytes: number
  recordedBytes: number
  uploadChain: Promise<void>
  completed: boolean
  aborted: boolean
}

interface MultipartUploadState {
  camera: MultipartUploadSession | null
  screen: MultipartUploadSession | null
}

const MULTIPART_PART_SIZE_BYTES = 6 * 1024 * 1024
const PROGRESS_HEARTBEAT_MS = 3000
const PROGRESS_DEBOUNCE_MS = 400

function createEmptyBehaviorSignals(): AnswerBehaviorSignals {
  return {
    tabHiddenCount: 0,
    windowBlurCount: 0,
    pasteCount: 0,
    keydownCount: 0,
    resizeCount: 0,
  }
}

function permissionLabel(status: PermissionStatus) {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'granted':
      return 'Ready'
    case 'denied':
      return 'Blocked'
    default:
      return 'Idle'
  }
}

function permissionClasses(status: PermissionStatus) {
  switch (status) {
    case 'pending':
      return 'bg-blue-100 text-blue-800 ring-blue-200/80'
    case 'granted':
      return 'bg-emerald-100 text-emerald-800 ring-emerald-200/80'
    case 'denied':
      return 'bg-rose-100 text-rose-800 ring-rose-200/80'
    default:
      return 'bg-[hsl(var(--surface-high)/0.9)] text-muted-foreground ring-border/50'
  }
}

export default function TakeInterviewPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const candidateToken = searchParams.get('token')?.trim() ?? ''

  const [stage, setStage] = useState<Stage>('loading')
  const [interview, setInterview] = useState<InterviewData | null>(null)
  const [error, setError] = useState('')
  const [consent, setConsent] = useState(false)
  const [recording, setRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(240)
  const [retakeCount, setRetakeCount] = useState(0)
  const [currentVersionNumber, setCurrentVersionNumber] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('idle')
  const [screenStatus, setScreenStatus] = useState<PermissionStatus>('idle')
  const [screenSurface, setScreenSurface] = useState('')
  const [setupBusy, setSetupBusy] = useState(false)
  const [setupError, setSetupError] = useState('')
  const [transitionLabel, setTransitionLabel] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraRecorderRef = useRef<MediaRecorder | null>(null)
  const screenRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressHeartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressFlushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const discardRecordingRef = useRef(false)
  const answerStartedAtRef = useRef<string | null>(null)
  const answerStartedAtMsRef = useRef<number | null>(null)
  const answerStoppedAtMsRef = useRef<number | null>(null)
  const answerDurationSecondsRef = useRef<number>(0)
  const stoppedRecordersRef = useRef(0)
  const currentVersionNumberRef = useRef(1)
  const behaviorSignalsRef = useRef<AnswerBehaviorSignals>(createEmptyBehaviorSignals())
  const behaviorEventsRef = useRef<AnswerBehaviorEvent[]>([])
  const flushedBehaviorEventCountRef = useRef(0)
  const progressRequestChainRef = useRef(Promise.resolve())
  const pendingVersionActionRef = useRef<PendingVersionAction>(null)
  const multipartUploadsRef = useRef<MultipartUploadState>({
    camera: null,
    screen: null,
  })
  const beginRecordingRef = useRef<(nextVersionNumber: number) => Promise<void>>(
    async () => undefined,
  )
  const autoStartedQuestionKeyRef = useRef('')

  useEffect(() => {
    if (!recording) {
      return
    }

    const recordBehaviorEvent = (
      eventType: AnswerBehaviorEvent['eventType'],
      signalKey: keyof AnswerBehaviorSignals,
    ) => {
      behaviorSignalsRef.current = {
        ...behaviorSignalsRef.current,
        [signalKey]: behaviorSignalsRef.current[signalKey] + 1,
      }

      behaviorEventsRef.current = [
        ...behaviorEventsRef.current,
        {
          eventType,
          occurredAt: new Date().toISOString(),
          versionNumber: currentVersionNumberRef.current,
        },
      ]

      scheduleProgressFlush('event')
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordBehaviorEvent('tab_hidden', 'tabHiddenCount')
      }
    }

    const handleWindowBlur = () => {
      recordBehaviorEvent('window_blur', 'windowBlurCount')
    }

    const handlePaste = () => {
      recordBehaviorEvent('paste', 'pasteCount')
    }

    const handleResize = () => {
      recordBehaviorEvent('resize', 'resizeCount')
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key === 'Shift' || event.key === 'CapsLock') {
        return
      }

      recordBehaviorEvent('keydown', 'keydownCount')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    document.addEventListener('paste', handlePaste)
    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeydown, true)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      document.removeEventListener('paste', handlePaste)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeydown, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording])

  function stopMediaStream(stream: MediaStream | null) {
    if (!stream) {
      return
    }

    stream.getTracks().forEach((track) => {
      track.onended = null
      track.stop()
    })
  }

  function releaseCaptureStreams() {
    stopMediaStream(cameraStreamRef.current)
    stopMediaStream(screenStreamRef.current)
    cameraStreamRef.current = null
    screenStreamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  function attachCameraPreview(stream: MediaStream) {
    cameraStreamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      void videoRef.current.play().catch(() => undefined)
    }
  }

  function clearProgressTimers() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (progressHeartbeatRef.current) {
      clearInterval(progressHeartbeatRef.current)
      progressHeartbeatRef.current = null
    }

    if (progressFlushTimeoutRef.current) {
      clearTimeout(progressFlushTimeoutRef.current)
      progressFlushTimeoutRef.current = null
    }
  }

  function clearRecordingArtifacts() {
    clearProgressTimers()
    answerStartedAtRef.current = null
    answerStartedAtMsRef.current = null
    answerStoppedAtMsRef.current = null
    answerDurationSecondsRef.current = 0
    stoppedRecordersRef.current = 0
    behaviorSignalsRef.current = createEmptyBehaviorSignals()
    behaviorEventsRef.current = []
    flushedBehaviorEventCountRef.current = 0
    progressRequestChainRef.current = Promise.resolve()
    multipartUploadsRef.current = {
      camera: null,
      screen: null,
    }
  }

  function stopActiveRecorders() {
    clearProgressTimers()

    if (cameraRecorderRef.current?.state === 'recording') {
      cameraRecorderRef.current.stop()
    }

    if (screenRecorderRef.current?.state === 'recording') {
      screenRecorderRef.current.stop()
    }

    setRecording(false)
  }

  function resetInterviewSetup(message: string) {
    discardRecordingRef.current = true
    pendingVersionActionRef.current = null
    stopActiveRecorders()
    void abortMultipartUploads()
    clearRecordingArtifacts()
    setCameraStatus('idle')
    setScreenStatus('denied')
    setScreenSurface('')
    setSetupBusy(false)
    setSetupError(message)
    setTransitionLabel('')
    autoStartedQuestionKeyRef.current = ''
    releaseCaptureStreams()
    setStage('consent')
  }

  function getPermissionErrorMessage(error: unknown, requiresEntireScreen = false) {
    if (requiresEntireScreen) {
      return 'Choose Entire screen / Screen in the share picker. Browser tabs and app windows are not accepted.'
    }

    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        return 'Camera, microphone, and screen sharing must be allowed to continue.'
      }
      if (error.name === 'NotFoundError') {
        return 'A camera, microphone, or shareable display source was not found on this device.'
      }
      if (error.name === 'AbortError') {
        return 'Permission setup was interrupted. Please try again.'
      }
    }

    if (error instanceof Error && error.message) {
      return error.message
    }

    return 'Camera, microphone, and screen sharing must be enabled before the interview can start.'
  }

  async function loadInterview(
    mode: 'initial' | 'resume' = 'initial',
    tokenOverride?: string,
  ) {
    try {
      const apiUrl = tokenOverride
        ? `/api/take/${id}?token=${encodeURIComponent(tokenOverride)}`
        : `/api/take/${id}`
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error('Invalid or expired interview link')
      }
      const data: InterviewData = await response.json()
      setInterview(data)

      if (mode === 'initial' && tokenOverride && typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/take/${id}`)
      }

      if (data.completed) {
        releaseCaptureStreams()
        setStage('complete')
      } else if (mode === 'initial') {
        setStage('consent')
      } else {
        setStage('interview')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interview')
    }
  }

  useEffect(() => {
    void loadInterview('initial', candidateToken)

    return () => {
      clearProgressTimers()
      void abortMultipartUploads()
      releaseCaptureStreams()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleStartInterview() {
    if (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices?.getDisplayMedia) {
      setSetupError('This browser must support camera, microphone, and full-screen sharing.')
      return
    }

    let cameraGranted = false

    try {
      setSetupBusy(true)
      setSetupError('')
      setCameraStatus('pending')
      setScreenStatus('idle')
      setScreenSurface('')
      clearRecordingArtifacts()
      releaseCaptureStreams()

      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 854, height: 480 },
        audio: true,
      })
      attachCameraPreview(cameraStream)
      cameraGranted = true
      setCameraStatus('granted')
      setScreenStatus('pending')

      const displayMediaOptions: InterviewDisplayMediaOptions = {
        video: true,
        audio: true,
        monitorTypeSurfaces: 'include',
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'include',
        systemAudio: 'include',
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)

      const screenTrack = screenStream.getVideoTracks()[0]
      if (!screenTrack) {
        stopMediaStream(screenStream)
        throw new Error('Screen sharing did not provide a video track.')
      }

      const displaySurface = (screenTrack.getSettings() as ScreenTrackSettings).displaySurface ?? 'unknown'
      if (displaySurface !== 'monitor') {
        setScreenStatus('denied')
        setScreenSurface(displaySurface)
        stopMediaStream(screenStream)
        releaseCaptureStreams()
        setSetupError(getPermissionErrorMessage(new Error('wrong-surface'), true))
        return
      }

      screenTrack.onended = () => {
        resetInterviewSetup('Screen sharing stopped. Start the setup again to continue the interview.')
      }

      screenStreamRef.current = screenStream
      setScreenSurface(displaySurface)
      setScreenStatus('granted')
      setStage('interview')
    } catch (err) {
      setCameraStatus(cameraGranted ? 'granted' : 'denied')
      setScreenStatus('denied')
      setScreenSurface('')
      releaseCaptureStreams()
      setSetupError(getPermissionErrorMessage(err))
    } finally {
      setSetupBusy(false)
    }
  }

  async function startMultipartUploadSession(
    questionIndex: number,
    mediaType: CaptureTarget,
  ): Promise<MultipartUploadSession> {
    const response = await fetch('/api/upload/multipart/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionIndex,
        contentType: 'video/webm',
        mediaType,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to initialize ${mediaType} upload for this answer version.`)
    }

    const session = (await response.json()) as MultipartUploadSessionResponse
    return {
      mediaKey: session.mediaKey,
      uploadId: session.uploadId,
      nextPartNumber: 1,
      bufferedChunks: [],
      bufferedBytes: 0,
      recordedBytes: 0,
      uploadChain: Promise.resolve(),
      completed: false,
      aborted: false,
    }
  }

  function getMultipartSession(target: CaptureTarget): MultipartUploadSession {
    const session = multipartUploadsRef.current[target]
    if (!session) {
      throw new Error(`${target} upload session is not initialized.`)
    }

    return session
  }

  async function flushAnswerProgress(forceAllEvents = false) {
    if (!interview) {
      return
    }

    const cameraUpload = multipartUploadsRef.current.camera
    if (!cameraUpload) {
      return
    }

    const screenUpload = multipartUploadsRef.current.screen
    const eventStartIndex = forceAllEvents ? 0 : flushedBehaviorEventCountRef.current
    const behaviorEvents = behaviorEventsRef.current.slice(eventStartIndex)

    const response = await fetch(`/api/take/${id}/answer/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionIndex: interview.currentQuestionIndex,
        versionNumber: currentVersionNumberRef.current,
        mediaKey: cameraUpload.mediaKey,
        screenMediaKey: screenUpload?.mediaKey,
        durationSeconds: answerDurationSecondsRef.current || undefined,
        startedAt: answerStartedAtRef.current ?? undefined,
        submittedAt: answerStoppedAtMsRef.current
          ? new Date(answerStoppedAtMsRef.current).toISOString()
          : undefined,
        cameraFileSizeBytes: cameraUpload.recordedBytes || undefined,
        screenFileSizeBytes: screenUpload?.recordedBytes || undefined,
        behaviorSignals: behaviorSignalsRef.current,
        behaviorEvents,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save interview progress.')
    }

    flushedBehaviorEventCountRef.current = behaviorEventsRef.current.length
  }

  function enqueueProgressFlush(forceAllEvents = false) {
    progressRequestChainRef.current = progressRequestChainRef.current
      .catch(() => undefined)
      .then(() => flushAnswerProgress(forceAllEvents))

    return progressRequestChainRef.current
  }

  function scheduleProgressFlush(reason: 'event' | 'heartbeat' | 'start' | 'stop') {
    if (!multipartUploadsRef.current.camera) {
      return
    }

    if (reason === 'start' || reason === 'stop') {
      if (progressFlushTimeoutRef.current) {
        clearTimeout(progressFlushTimeoutRef.current)
        progressFlushTimeoutRef.current = null
      }

      void enqueueProgressFlush(true).catch(() => undefined)
      return
    }

    if (progressFlushTimeoutRef.current) {
      return
    }

    progressFlushTimeoutRef.current = setTimeout(() => {
      progressFlushTimeoutRef.current = null
      void enqueueProgressFlush(false).catch(() => undefined)
    }, PROGRESS_DEBOUNCE_MS)
  }

  function startProgressHeartbeat() {
    if (progressHeartbeatRef.current) {
      clearInterval(progressHeartbeatRef.current)
    }

    progressHeartbeatRef.current = setInterval(() => {
      scheduleProgressFlush('heartbeat')
    }, PROGRESS_HEARTBEAT_MS)
  }

  async function presignMultipartPartUpload(
    target: CaptureTarget,
    session: MultipartUploadSession,
    questionIndex: number,
    partNumber: number,
  ): Promise<MultipartUploadPartResponse> {
    const response = await fetch('/api/upload/multipart/part', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionIndex,
        mediaKey: session.mediaKey,
        uploadId: session.uploadId,
        partNumber,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to prepare ${target} upload chunk ${partNumber}.`)
    }

    return (await response.json()) as MultipartUploadPartResponse
  }

  function queueBufferedUpload(target: CaptureTarget, forceFinal = false) {
    const session = multipartUploadsRef.current[target]
    if (!session) {
      return Promise.resolve()
    }

    session.uploadChain = session.uploadChain.then(async () => {
      let activeSession = multipartUploadsRef.current[target]

      while (
        activeSession &&
        !activeSession.aborted &&
        !activeSession.completed &&
        (activeSession.bufferedBytes >= MULTIPART_PART_SIZE_BYTES ||
          (forceFinal && activeSession.bufferedBytes > 0))
      ) {
        const partBlob = new Blob(activeSession.bufferedChunks, { type: 'video/webm' })
        activeSession.bufferedChunks = []
        activeSession.bufferedBytes = 0

        const partNumber = activeSession.nextPartNumber
        activeSession.nextPartNumber += 1

        const partUpload = await presignMultipartPartUpload(
          target,
          activeSession,
          interview?.currentQuestionIndex ?? 0,
          partNumber,
        )

        const uploadResponse = await fetch(partUpload.uploadUrl, {
          method: 'PUT',
          body: partBlob,
          headers: { 'Content-Type': 'video/webm' },
        })

        if (!uploadResponse.ok) {
          throw new Error(`Chunk upload failed for ${target} recording.`)
        }

        activeSession = multipartUploadsRef.current[target]
        scheduleProgressFlush('heartbeat')
      }
    })

    return session.uploadChain
  }

  function handleRecordedChunk(target: CaptureTarget, blob: Blob) {
    if (blob.size < 1) {
      return
    }

    const session = multipartUploadsRef.current[target]
    if (!session || session.aborted || session.completed) {
      return
    }

    session.bufferedChunks.push(blob)
    session.bufferedBytes += blob.size
    session.recordedBytes += blob.size

    if (session.bufferedBytes >= MULTIPART_PART_SIZE_BYTES) {
      void queueBufferedUpload(target).catch(() => undefined)
    }

    scheduleProgressFlush('heartbeat')
  }

  async function completeMultipartUpload(target: CaptureTarget) {
    const session = getMultipartSession(target)
    if (session.completed || session.aborted) {
      return
    }

    const response = await fetch('/api/upload/multipart/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionIndex: interview?.currentQuestionIndex ?? 0,
        mediaKey: session.mediaKey,
        uploadId: session.uploadId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to finalize ${target} upload.`)
    }

    session.completed = true
  }

  async function abortMultipartUploads() {
    const uploadsSnapshot = multipartUploadsRef.current
    const entries = (
      [
        ['camera', uploadsSnapshot.camera],
        ['screen', uploadsSnapshot.screen],
      ] as const
    ).filter(([, session]) => Boolean(session))

    await Promise.all(
      entries.map(async ([target, session]) => {
        if (!session || session.aborted || session.completed) {
          return
        }

        session.aborted = true

        try {
          await session.uploadChain.catch(() => undefined)
          await fetch('/api/upload/multipart/abort', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionIndex: interview?.currentQuestionIndex ?? 0,
              mediaKey: session.mediaKey,
              uploadId: session.uploadId,
            }),
          })
        } catch {
          console.error(`Failed to abort ${target} multipart upload.`)
        }
      }),
    )
  }

  function handleRecorderStopped() {
    stoppedRecordersRef.current += 1
    if (stoppedRecordersRef.current < 2) {
      return
    }

    const shouldDiscard = discardRecordingRef.current
    discardRecordingRef.current = false

    if (shouldDiscard) {
      clearRecordingArtifacts()
      return
    }

    const pendingAction = pendingVersionActionRef.current
    if (!pendingAction) {
      clearRecordingArtifacts()
      setSetupError('Recording stopped without a follow-up action. Start a new version for this answer.')
      setStage('interview')
      return
    }

    void persistCurrentVersion(pendingAction)
  }

  async function beginRecording(nextVersionNumber: number) {
    if (!cameraStreamRef.current || !screenStreamRef.current) {
      resetInterviewSetup('Camera, microphone, and entire-screen sharing must stay active before recording.')
      return
    }

    if (!interview?.currentQuestion) {
      return
    }

    clearRecordingArtifacts()
    discardRecordingRef.current = false
    pendingVersionActionRef.current = null
    currentVersionNumberRef.current = nextVersionNumber
    setCurrentVersionNumber(nextVersionNumber)
    setRetakeCount(Math.max(nextVersionNumber - 1, 0))
    answerStartedAtRef.current = new Date().toISOString()
    answerStartedAtMsRef.current = Date.now()
    answerStoppedAtMsRef.current = null
    stoppedRecordersRef.current = 0

    try {
      const [cameraUpload, screenUpload] = await Promise.all([
        startMultipartUploadSession(interview.currentQuestionIndex, 'camera'),
        startMultipartUploadSession(interview.currentQuestionIndex, 'screen'),
      ])

      multipartUploadsRef.current = {
        camera: cameraUpload,
        screen: screenUpload,
      }

      await flushAnswerProgress(true)
      startProgressHeartbeat()
    } catch (err) {
      await abortMultipartUploads()
      clearRecordingArtifacts()
      setSetupError(err instanceof Error ? err.message : 'Failed to start recording.')
      autoStartedQuestionKeyRef.current = ''
      setStage('interview')
      return
    }

    const recorderOptions: MediaRecorderOptions = {
      mimeType: 'video/webm',
      videoBitsPerSecond: 1_500_000,
    }

    const cameraRecorder = new MediaRecorder(cameraStreamRef.current, recorderOptions)
    cameraRecorder.ondataavailable = (event) => {
      handleRecordedChunk('camera', event.data)
    }
    cameraRecorder.onstop = () => {
      handleRecorderStopped()
    }

    const screenRecorder = new MediaRecorder(screenStreamRef.current, recorderOptions)
    screenRecorder.ondataavailable = (event) => {
      handleRecordedChunk('screen', event.data)
    }
    screenRecorder.onstop = () => {
      handleRecorderStopped()
    }

    cameraRecorderRef.current = cameraRecorder
    screenRecorderRef.current = screenRecorder
    cameraRecorder.start(1000)
    screenRecorder.start(1000)

    setRecording(true)
    setTimeLeft(240)
    setSetupError('')
    setStage('recording')
    setTransitionLabel('')

    timerRef.current = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          requestVersionAction('submit')
          return 0
        }
        return current - 1
      })
    }, 1000)
  }

  beginRecordingRef.current = beginRecording

  useEffect(() => {
    const readyForAutoStart =
      stage === 'interview' &&
      !recording &&
      !uploading &&
      Boolean(interview?.currentQuestion) &&
      cameraStatus === 'granted' &&
      screenStatus === 'granted' &&
      screenSurface === 'monitor'

    if (!readyForAutoStart || !interview) {
      return
    }

    const questionKey = `${interview.id}:${interview.currentQuestionIndex}:${interview.currentAnswerMeta?.versionCount ?? 0}:${stage}`
    if (autoStartedQuestionKeyRef.current === questionKey) {
      return
    }

    autoStartedQuestionKeyRef.current = questionKey
    const nextVersionNumber = (interview.currentAnswerMeta?.versionCount ?? 0) + 1
    void beginRecordingRef.current(nextVersionNumber)
  }, [
    cameraStatus,
    interview,
    recording,
    screenStatus,
    screenSurface,
    stage,
    uploading,
  ])

  function stopRecording() {
    const stopTimestamp = Date.now()

    if (!answerStoppedAtMsRef.current) {
      answerStoppedAtMsRef.current = stopTimestamp
    }

    if (answerStartedAtMsRef.current) {
      answerDurationSecondsRef.current = Math.max(
        1,
        Math.round((answerStoppedAtMsRef.current - answerStartedAtMsRef.current) / 1000),
      )
    }

    stopActiveRecorders()
  }

  function requestVersionAction(action: PendingVersionAction) {
    if (!action || uploading || !recording) {
      return
    }

    pendingVersionActionRef.current = action
    setTransitionLabel(
      action === 'submit'
        ? 'Submitting answer and moving to the next question...'
        : 'Saving this version and starting a new recording...'
    )
    setStage('transition')
    scheduleProgressFlush('stop')
    stopRecording()
  }

  async function persistCurrentVersion(
    action: Exclude<PendingVersionAction, null>,
  ) {
    if (!interview) {
      return
    }

    setUploading(true)

    try {
      await enqueueProgressFlush(true)
      await Promise.all([
        queueBufferedUpload('camera', true),
        queueBufferedUpload('screen', true),
      ])
      await Promise.all([
        completeMultipartUpload('camera'),
        completeMultipartUpload('screen'),
      ])

      const cameraUpload = getMultipartSession('camera')
      const screenUpload = getMultipartSession('screen')

      const answerResponse = await fetch(`/api/take/${id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIndex: interview.currentQuestionIndex,
          versionNumber: currentVersionNumberRef.current,
          submitAnswer: action === 'submit',
          mediaKey: cameraUpload.mediaKey,
          screenMediaKey: screenUpload.mediaKey,
          durationSeconds: answerDurationSecondsRef.current || 1,
          startedAt:
            answerStartedAtRef.current ?? new Date(Date.now() - 1000).toISOString(),
          submittedAt: new Date().toISOString(),
          cameraFileSizeBytes: cameraUpload.recordedBytes,
          screenFileSizeBytes: screenUpload.recordedBytes,
          behaviorSignals: behaviorSignalsRef.current,
          behaviorEvents: behaviorEventsRef.current,
        }),
      })

      if (!answerResponse.ok) {
        throw new Error(
          action === 'submit'
            ? 'Answer submission failed.'
            : 'Re-record version could not be saved.',
        )
      }

      clearRecordingArtifacts()
      pendingVersionActionRef.current = null

      if (action === 'submit') {
        setCurrentVersionNumber(1)
        currentVersionNumberRef.current = 1
        setRetakeCount(0)
        await loadInterview('resume')
      } else {
        const nextVersionNumber = currentVersionNumberRef.current + 1
        setCurrentVersionNumber(nextVersionNumber)
        currentVersionNumberRef.current = nextVersionNumber
        setRetakeCount(nextVersionNumber - 1)
        await beginRecording(nextVersionNumber)
      }
    } catch (err) {
      await abortMultipartUploads()
      setSetupError(err instanceof Error ? err.message : 'Upload failed')
      autoStartedQuestionKeyRef.current = ''
      setStage('interview')
    } finally {
      setTransitionLabel('')
      setUploading(false)
    }
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const remainder = seconds % 60
    return `${minutes}:${remainder.toString().padStart(2, '0')}`
  }

  if (error && !interview) {
    return (
      <main className="container py-12">
        <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
          <AlertTitle>Interview unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    )
  }

  if (stage === 'loading' || !interview) {
    return (
      <main className="container py-12">
        <LoadingStateCard className="mx-auto max-w-4xl" label="Loading interview..." />
      </main>
    )
  }

  const progressValue =
    interview.totalQuestions === 0
      ? 0
      : Math.round(
          ((interview.currentQuestionIndex + (stage === 'complete' ? 1 : 0)) / interview.totalQuestions) *
            100,
        )

  if (stage === 'complete') {
    return (
      <main className="container py-12">
        <Card className="mx-auto max-w-4xl border-white/65 bg-white/88 shadow-float">
          <CardContent className="space-y-6 px-8 py-10 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-[1.4rem] bg-[hsl(var(--primary-fixed)/0.85)] text-[hsl(var(--primary))]">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                Thank you, {interview.candidateName}
              </h1>
              <p className="text-base leading-7 text-muted-foreground md:text-lg">
                Your interview for <strong>{interview.position}</strong> has been submitted.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Camera and full-screen recordings for each answer have been stored for reviewer evaluation.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (stage === 'consent') {
    return (
      <main className="container space-y-8 py-10 md:py-12">
        <Card className="mx-auto max-w-5xl border-white/65 bg-white/88 shadow-float">
          <CardContent className="grid gap-8 px-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
                Candidate interview
              </EyebrowBadge>

              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                  Interview for {interview.position}
                </h1>
                <p className="text-base leading-7 text-muted-foreground md:text-lg">
                  Welcome, {interview.candidateName}. You will answer {interview.totalQuestions}{' '}
                  questions, with up to four minutes for each response.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
                  <CardContent className="space-y-3 px-5 py-5">
                    <Camera className="size-5 text-[hsl(var(--primary))]" />
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">Camera</div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Recorded separately for every answer.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
                  <CardContent className="space-y-3 px-5 py-5">
                    <Mic className="size-5 text-[hsl(var(--primary))]" />
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">Microphone</div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Captured together with your camera feed.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
                  <CardContent className="space-y-3 px-5 py-5">
                    <Video className="size-5 text-[hsl(var(--primary))]" />
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">Entire screen</div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Must be shared as <strong>Entire screen</strong>, not a tab or app window.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft">
                  <CardContent className="space-y-3 px-5 py-5">
                    <ShieldCheck className="size-5 text-[hsl(var(--primary))]" />
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">Fairness checks</div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Session and browser activity may be stored for evaluation integrity.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-white/70 bg-white/90 shadow-soft">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl tracking-[-0.03em]">Before you start</CardTitle>
                <CardDescription className="text-sm leading-6">
                  One button will request camera, microphone, and then full-screen sharing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3 rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.85)] p-5 ring-1 ring-border/45">
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Data collected
                  </div>
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    <li>Camera video and microphone audio for each answer</li>
                    <li>Full-monitor screen recording in parallel with each answer</li>
                    <li>Browser activity such as tab switches</li>
                    <li>Session metadata including answer timing</li>
                  </ul>
                </div>

                <div className="space-y-3 rounded-[1.5rem] bg-white/85 p-5 ring-1 ring-border/45">
                  <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-[hsl(var(--surface-low)/0.8)] px-4 py-3">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">Camera and microphone</div>
                      <p className="text-xs leading-5 text-muted-foreground">
                        Required before recording can begin.
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ring-1 ${permissionClasses(cameraStatus)}`}
                    >
                      {permissionLabel(cameraStatus)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-[hsl(var(--surface-low)/0.8)] px-4 py-3">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">Entire screen share</div>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {screenSurface === 'monitor'
                          ? 'Entire screen is confirmed and ready.'
                          : 'In the share picker, choose Entire screen / Screen.'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ring-1 ${permissionClasses(screenStatus)}`}
                    >
                      {permissionLabel(screenStatus)}
                    </span>
                  </div>
                </div>

                {setupError ? (
                  <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
                    <AlertTitle>Setup incomplete</AlertTitle>
                    <AlertDescription>{setupError}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="flex items-start gap-3 rounded-[1.25rem] bg-white/85 p-4 ring-1 ring-border/45">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(Boolean(checked))}
                    className="mt-1"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="consent" className="text-sm font-semibold text-foreground">
                      I agree to the recording and data collection terms.
                    </Label>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Data is used only for interview evaluation and is stored for 90 days.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  disabled={!consent || setupBusy}
                  onClick={handleStartInterview}
                  className="h-11 w-full rounded-2xl bg-primary-gradient shadow-soft hover:brightness-105"
                >
                  {setupBusy ? 'Requesting access...' : 'Allow Camera, Mic & Entire Screen'}
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="container space-y-8 py-10 md:py-12">
      <section className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.84fr_1.16fr]">
        <Card className="border-white/65 bg-white/88 shadow-soft">
          <CardContent className="space-y-6 px-8 py-8">
            <div className="space-y-3">
              <EyebrowBadge icon={<Video className="size-3.5" />}>
                Live session
              </EyebrowBadge>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-4xl">
                {interview.position}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Answer clearly and keep your camera plus entire-screen share active while recording.
              </p>
            </div>

            <div className="space-y-3 rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.9)] p-5 ring-1 ring-border/45">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-foreground">
                  Question {interview.currentQuestionIndex + 1} of {interview.totalQuestions}
                </div>
                <StatusPill tone="neutral">{progressValue}%</StatusPill>
              </div>
              <Progress value={progressValue} className="h-2.5 rounded-full bg-white" />
            </div>

            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                <StatusPill tone="completed">Camera + mic active</StatusPill>
                <StatusPill tone="completed">
                  {screenSurface === 'monitor' ? 'Entire screen shared' : 'Screen share pending'}
                </StatusPill>
              </div>
              {setupError ? (
                <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
                  <AlertTitle>Capture interrupted</AlertTitle>
                  <AlertDescription>{setupError}</AlertDescription>
                </Alert>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <MetricPanel tone="elevated" label="Recording limit" value="4:00" />
              <MetricPanel
                tone="elevated"
                label="Answer version"
                value={`v${currentVersionNumber}`}
                valueClassName="mt-3 text-sm leading-6 text-foreground"
                description={`Previous versions kept: ${retakeCount}`}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/65 bg-white/88 shadow-float">
          <CardContent className="space-y-6 px-8 py-8">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill
                  tone={
                    stage === 'recording'
                      ? 'processing'
                      : stage === 'transition'
                        ? 'neutral'
                        : 'neutral'
                  }
                >
                  {stage === 'recording'
                    ? 'Recording'
                    : stage === 'transition'
                      ? 'Saving version'
                      : 'Awaiting response'}
                </StatusPill>
                {stage === 'recording' ? (
                  <StatusPill tone="failed">
                    <CircleDot className="size-3" />
                    {formatTime(timeLeft)}
                  </StatusPill>
                ) : null}
              </div>

              <h2 className="text-2xl font-semibold leading-9 tracking-[-0.03em] text-foreground">
                {interview.currentQuestion?.text}
              </h2>
            </div>

            <div className="video-container ring-1 ring-border/45">
              <video ref={videoRef} autoPlay muted playsInline className="video-preview" />

              {stage === 'recording' ? (
                <div className="timer">
                  <span className="rec-dot">●</span> {formatTime(timeLeft)}
                </div>
              ) : null}
            </div>

            <div className="rounded-[1.25rem] bg-[hsl(var(--surface-low)/0.85)] p-4 ring-1 ring-border/45">
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Guidance
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {stage === 'transition'
                  ? transitionLabel || 'Saving the current answer version.'
                  : 'Recording starts automatically for each question. Use Submit when the answer is ready, or Re-record to create a new version for the same question.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {stage === 'interview' ? (
                <StatusPill tone="neutral">Preparing recording...</StatusPill>
              ) : null}

              {stage === 'recording' ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => requestVersionAction('rerecord')}
                    disabled={uploading}
                    className="rounded-full bg-white/80"
                  >
                    Re-record as new version
                  </Button>
                  <Button
                    type="button"
                    onClick={() => requestVersionAction('submit')}
                    disabled={uploading}
                    className="rounded-full bg-primary-gradient px-5 shadow-soft hover:brightness-105"
                  >
                    Submit & Next
                  </Button>
                </>
              ) : null}

              {stage === 'transition' ? (
                <StatusPill tone="processing">
                  {transitionLabel || 'Saving current version'}
                </StatusPill>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
