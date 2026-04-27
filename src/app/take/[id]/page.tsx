'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { LoadingStateCard } from '@/components/app/state-card'
import { TakeCompleteScreen } from '@/components/take/take-complete-screen'
import { TakeConsentScreen } from '@/components/take/take-consent-screen'
import { TakeRecordingScreen } from '@/components/take/take-recording-screen'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  abortMultipartUploads as abortMultipartUploadsData,
  buildFlushBehaviorEvents,
  enqueueProgressFlush as enqueueProgressFlushData,
  handleRecordedChunk as handleRecordedChunkData,
  queueBufferedUpload as queueBufferedUploadData,
  releaseCaptureStreams,
  scheduleProgressFlush as scheduleProgressFlushData,
  startProgressHeartbeat as startProgressHeartbeatData,
  stopMediaStream,
  type AnswerBehaviorEvent,
  type CaptureTarget,
  type MultipartUploadSession,
  type MultipartUploadState,
  type TakeBehaviorSignals,
  type TakePermissionStatus,
  buildProgressPayload,
  clearProgressTimers,
  createEmptyBehaviorSignals,
  createMultipartUploadSession,
  formatTime,
  getMultipartSession,
  getPermissionErrorMessage,
  permissionClasses,
  permissionLabel,
  completeMultipartUpload as completeMultipartUploadData,
  useTakeAutoStartRecording,
  useTakeBehaviorTracking,
  useTakeBeginRecording,
  useTakeInterviewLoader,
  useTakePermissions,
  useTakeRecordingControls,
} from '@/features/take'
import {
  abortMultipartUpload,
  completeMultipartUpload as completeMultipartUploadRequest,
  presignMultipartPart,
  sendTakeAnswerProgress,
  startMultipartUpload,
  submitTakeAnswer,
  uploadMultipartPart,
  type MultipartUploadPartResponse,
  type TakeInterviewData,
} from '@/lib/api'

type InterviewData = TakeInterviewData

type Stage = 'loading' | 'consent' | 'interview' | 'recording' | 'transition' | 'complete'
type PermissionStatus = TakePermissionStatus
type PendingVersionAction = 'submit' | 'rerecord' | null

type AnswerBehaviorSignals = TakeBehaviorSignals

const PROGRESS_HEARTBEAT_MS = 3000
const PROGRESS_DEBOUNCE_MS = 400

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

  function attachCameraPreview(stream: MediaStream) {
    cameraStreamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      void videoRef.current.play().catch(() => undefined)
    }
  }

  function clearRecordingArtifacts() {
    clearProgressTimers(timerRef, progressHeartbeatRef, progressFlushTimeoutRef)
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
    clearProgressTimers(timerRef, progressHeartbeatRef, progressFlushTimeoutRef)

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
    releaseCaptureStreams(cameraStreamRef, screenStreamRef, videoRef)
    setStage('consent')
  }

  const { loadInterview } = useTakeInterviewLoader({
    id,
    candidateToken,
    onData: (data, mode, tokenOverride) => {
      setInterview(data)

      if (mode === 'initial' && tokenOverride && typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/take/${id}`)
      }

      if (data.completed) {
        releaseCaptureStreams(cameraStreamRef, screenStreamRef, videoRef)
        setStage('complete')
      } else if (mode === 'initial') {
        setStage('consent')
      } else {
        setStage('interview')
      }
    },
    onError: (message) => {
      setError(message)
    },
    onCleanup: () => {
      clearProgressTimers(timerRef, progressHeartbeatRef, progressFlushTimeoutRef)
      void abortMultipartUploads()
      releaseCaptureStreams(cameraStreamRef, screenStreamRef, videoRef)
    },
  })

  const { handleStartInterview } = useTakePermissions({
    setSetupBusy,
    setSetupError,
    setCameraStatus,
    setScreenStatus,
    setScreenSurface,
    setStage: (value) => setStage(value),
    clearRecordingArtifacts,
    releaseCaptureStreams: () => releaseCaptureStreams(cameraStreamRef, screenStreamRef, videoRef),
    attachCameraPreview,
    stopMediaStream,
    resetInterviewSetup,
    getPermissionErrorMessage,
    screenStreamRef,
  })

  async function startMultipartUploadSession(
    questionIndex: number,
    mediaType: CaptureTarget,
  ): Promise<MultipartUploadSession> {
    const session = await startMultipartUpload(questionIndex, mediaType)
    return createMultipartUploadSession(session)
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
    const behaviorEvents = buildFlushBehaviorEvents({
      behaviorEvents: behaviorEventsRef.current,
      forceAllEvents,
      flushedBehaviorEventCount: flushedBehaviorEventCountRef.current,
    })

    await sendTakeAnswerProgress(
      id,
      buildProgressPayload({
        questionIndex: interview.currentQuestionIndex,
        versionNumber: currentVersionNumberRef.current,
        mediaKey: cameraUpload.mediaKey,
        screenMediaKey: screenUpload?.mediaKey,
        durationSeconds: answerDurationSecondsRef.current,
        startedAt: answerStartedAtRef.current ?? undefined,
        submittedAtMs: answerStoppedAtMsRef.current,
        cameraFileSizeBytes: cameraUpload.recordedBytes,
        screenFileSizeBytes: screenUpload?.recordedBytes,
        behaviorSignals: behaviorSignalsRef.current,
        behaviorEvents,
      }),
    )

    flushedBehaviorEventCountRef.current = behaviorEventsRef.current.length
  }

  function enqueueProgressFlush(forceAllEvents = false) {
    return enqueueProgressFlushData({
      progressRequestChainRef,
      flushAnswerProgress: (forceAll) => flushAnswerProgress(forceAll),
      forceAllEvents,
    })
  }

  function scheduleProgressFlush(reason: 'event' | 'heartbeat' | 'start' | 'stop') {
    scheduleProgressFlushData({
      multipartUploadsRef,
      progressFlushTimeoutRef,
      enqueueProgressFlush: (forceAll = false) => enqueueProgressFlush(forceAll),
      reason,
      progressDebounceMs: PROGRESS_DEBOUNCE_MS,
    })
  }

  function startProgressHeartbeat() {
    startProgressHeartbeatData({
      progressHeartbeatRef,
      progressHeartbeatMs: PROGRESS_HEARTBEAT_MS,
      scheduleProgressFlush: (reason) => scheduleProgressFlush(reason),
    })
  }

  async function presignMultipartPartUpload(
    target: CaptureTarget,
    session: MultipartUploadSession,
    questionIndex: number,
    partNumber: number,
  ): Promise<MultipartUploadPartResponse> {
    try {
      return await presignMultipartPart(
        questionIndex,
        session.mediaKey,
        session.uploadId,
        partNumber,
      )
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message.replace('upload', target)
          : `Failed to prepare ${target} upload chunk ${partNumber}.`,
      )
    }
  }

  function queueBufferedUpload(target: CaptureTarget, forceFinal = false) {
    return queueBufferedUploadData({
      target,
      multipartUploadsRef,
      forceFinal,
      questionIndex: interview?.currentQuestionIndex ?? 0,
      presignMultipartPartUpload,
      uploadMultipartPart,
      scheduleProgressFlush: (reason) => scheduleProgressFlush(reason),
    })
  }

  function handleRecordedChunk(target: CaptureTarget, blob: Blob) {
    handleRecordedChunkData({
      target,
      blob,
      multipartUploadsRef,
      questionIndex: interview?.currentQuestionIndex ?? 0,
      queueBufferedUpload: (nextTarget, nextForceFinal = false) =>
        queueBufferedUpload(nextTarget, nextForceFinal),
      scheduleProgressFlush: (reason) => scheduleProgressFlush(reason),
    })
  }

  async function completeMultipartUpload(target: CaptureTarget) {
    await completeMultipartUploadData({
      target,
      multipartUploadsRef,
      questionIndex: interview?.currentQuestionIndex ?? 0,
      completeMultipartUploadRequest,
    })
  }

  async function abortMultipartUploads() {
    await abortMultipartUploadsData({
      multipartUploadsRef,
      questionIndex: interview?.currentQuestionIndex ?? 0,
      abortMultipartUploadRequest: abortMultipartUpload,
    })
  }

  function onRecordersStopped() {
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

  useTakeBehaviorTracking({
    recording,
    currentVersionNumberRef,
    behaviorSignalsRef,
    behaviorEventsRef,
    scheduleProgressFlush: () => scheduleProgressFlush('event'),
  })

  useTakeAutoStartRecording({
    stage,
    recording,
    uploading,
    interview,
    cameraStatus,
    screenStatus,
    screenSurface,
    autoStartedQuestionKeyRef,
    beginRecordingRef,
  })

  const { requestVersionAction } = useTakeRecordingControls({
    uploading,
    recording,
    pendingVersionActionRef,
    answerStoppedAtMsRef,
    answerStartedAtMsRef,
    answerDurationSecondsRef,
    setTransitionLabel,
    setStage: (value) => setStage(value),
    scheduleProgressFlush: (reason) => scheduleProgressFlush(reason),
    stopActiveRecorders,
  })

  const { beginRecording } = useTakeBeginRecording({
    cameraStreamRef,
    screenStreamRef,
    cameraRecorderRef,
    screenRecorderRef,
    timerRef,
    stoppedRecordersRef,
    discardRecordingRef,
    pendingVersionActionRef,
    currentVersionNumberRef,
    answerStartedAtRef,
    answerStartedAtMsRef,
    answerStoppedAtMsRef,
    autoStartedQuestionKeyRef,
    multipartUploadsRef,
    setCurrentVersionNumber,
    setRetakeCount,
    setRecording,
    setTimeLeft,
    setSetupError,
    setStage: (value) => setStage(value),
    setTransitionLabel,
    clearRecordingArtifacts,
    resetInterviewSetup,
    startMultipartUploadSession,
    flushAnswerProgress: (forceAllEvents) => flushAnswerProgress(forceAllEvents),
    startProgressHeartbeat,
    abortMultipartUploads,
    handleRecordedChunk,
    onRecordersStopped,
    requestVersionAction,
  })

  beginRecordingRef.current = async (nextVersionNumber: number) => {
    await beginRecording({
      nextVersionNumber,
      hasCurrentQuestion: Boolean(interview?.currentQuestion),
      currentQuestionIndex: interview?.currentQuestionIndex ?? 0,
    })
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

      const cameraUpload = getMultipartSession(multipartUploadsRef.current, 'camera')
      const screenUpload = getMultipartSession(multipartUploadsRef.current, 'screen')

      await submitTakeAnswer(id, {
        questionIndex: interview.currentQuestionIndex,
        versionNumber: currentVersionNumberRef.current,
        submitAnswer: action === 'submit',
        mediaKey: cameraUpload.mediaKey,
        screenMediaKey: screenUpload.mediaKey,
        durationSeconds: answerDurationSecondsRef.current || 1,
        startedAt: answerStartedAtRef.current ?? new Date(Date.now() - 1000).toISOString(),
        submittedAt: new Date().toISOString(),
        cameraFileSizeBytes: cameraUpload.recordedBytes,
        screenFileSizeBytes: screenUpload.recordedBytes,
        behaviorSignals: behaviorSignalsRef.current,
        behaviorEvents: behaviorEventsRef.current,
      })

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
        await beginRecording({
          nextVersionNumber,
          hasCurrentQuestion: Boolean(interview.currentQuestion),
          currentQuestionIndex: interview.currentQuestionIndex,
        })
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
    return <TakeCompleteScreen candidateName={interview.candidateName} position={interview.position} />
  }

  if (stage === 'consent') {
    return (
      <TakeConsentScreen
        interview={interview}
        cameraStatus={cameraStatus}
        screenStatus={screenStatus}
        screenSurface={screenSurface}
        consent={consent}
        setupBusy={setupBusy}
        setupError={setupError}
        onConsentChange={setConsent}
        onStartInterview={handleStartInterview}
        permissionLabel={permissionLabel}
        permissionClasses={permissionClasses}
      />
    )
  }

  return (
    <TakeRecordingScreen
      interview={interview}
      stage={stage}
      progressValue={progressValue}
      screenSurface={screenSurface}
      setupError={setupError}
      currentVersionNumber={currentVersionNumber}
      retakeCount={retakeCount}
      timeLeft={timeLeft}
      transitionLabel={transitionLabel}
      uploading={uploading}
      videoRef={videoRef}
      formatTime={formatTime}
      onRerecord={() => requestVersionAction('rerecord')}
      onSubmit={() => requestVersionAction('submit')}
    />
  )
}
