'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { LoadingStateCard } from '@/components/app/state-card'
import { TakeCompleteScreen } from '@/components/take/take-complete-screen'
import { TakeConsentScreen } from '@/components/take/take-consent-screen'
import { TakeRecordingScreen } from '@/components/take/take-recording-screen'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  getMultipartSession,
  releaseCaptureStreams,
  stopMediaStream,
  formatTime,
  getPermissionErrorMessage,
  permissionClasses,
  permissionLabel,
  useTakeAnswerPersistence,
  useTakeAutoStartRecording,
  useTakeBehaviorTracking,
  useTakeBeginRecording,
  useTakeInterviewLoader,
  useTakePermissions,
  useTakeRecordingControls,
  useTakeSessionController,
} from '@/features/take'
import {
  submitTakeAnswer,
} from '@/lib/api'

type PendingVersionAction = 'submit' | 'rerecord' | null

const PROGRESS_HEARTBEAT_MS = 3000
const PROGRESS_DEBOUNCE_MS = 400

export default function TakeInterviewPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const candidateToken = searchParams.get('token')?.trim() ?? ''

  const {
    stage,
    setStage,
    interview,
    setInterview,
    error,
    setError,
    consent,
    setConsent,
    recording,
    setRecording,
    timeLeft,
    setTimeLeft,
    retakeCount,
    setRetakeCount,
    currentVersionNumber,
    setCurrentVersionNumber,
    uploading,
    setUploading,
    cameraStatus,
    setCameraStatus,
    screenStatus,
    setScreenStatus,
    screenSurface,
    setScreenSurface,
    setupBusy,
    setSetupBusy,
    setupError,
    setSetupError,
    transitionLabel,
    setTransitionLabel,
    videoRef,
    cameraRecorderRef,
    screenRecorderRef,
    timerRef,
    progressHeartbeatRef,
    progressFlushTimeoutRef,
    cameraStreamRef,
    screenStreamRef,
    discardRecordingRef,
    answerStartedAtRef,
    answerStartedAtMsRef,
    answerStoppedAtMsRef,
    answerDurationSecondsRef,
    stoppedRecordersRef,
    currentVersionNumberRef,
    behaviorSignalsRef,
    behaviorEventsRef,
    flushedBehaviorEventCountRef,
    progressRequestChainRef,
    pendingVersionActionRef,
    multipartUploadsRef,
    beginRecordingRef,
    autoStartedQuestionKeyRef,
    attachCameraPreview,
    clearRecordingArtifacts,
    stopActiveRecorders,
  } = useTakeSessionController()

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

  const {
    startMultipartUploadSession,
    flushAnswerProgress,
    enqueueProgressFlush,
    scheduleProgressFlush,
    startProgressHeartbeat,
    queueBufferedUpload,
    handleRecordedChunk,
    completeMultipartUpload,
    abortMultipartUploads,
  } = useTakeAnswerPersistence({
    id,
    interview,
    currentVersionNumberRef,
    answerStartedAtRef,
    answerStoppedAtMsRef,
    answerDurationSecondsRef,
    behaviorSignalsRef,
    behaviorEventsRef,
    flushedBehaviorEventCountRef,
    progressRequestChainRef,
    progressHeartbeatRef,
    progressFlushTimeoutRef,
    timerRef,
    multipartUploadsRef,
    progressHeartbeatMs: PROGRESS_HEARTBEAT_MS,
    progressDebounceMs: PROGRESS_DEBOUNCE_MS,
  })

  async function persistCurrentVersion(action: Exclude<PendingVersionAction, null>) {
    if (!interview) {
      return
    }

    setUploading(true)

    try {
      await enqueueProgressFlush(true)
      await Promise.all([queueBufferedUpload('camera', true), queueBufferedUpload('screen', true)])
      await Promise.all([completeMultipartUpload('camera'), completeMultipartUpload('screen')])

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
