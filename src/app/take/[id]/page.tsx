'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  completed: boolean
}

type Stage = 'loading' | 'consent' | 'interview' | 'recording' | 'review' | 'complete'
type PermissionStatus = 'idle' | 'pending' | 'granted' | 'denied'
type CaptureTarget = 'camera' | 'screen'
type ScreenTrackSettings = MediaTrackSettings & { displaySurface?: string }
type InterviewDisplayMediaOptions = DisplayMediaStreamOptions & {
  monitorTypeSurfaces?: 'include' | 'exclude'
  selfBrowserSurface?: 'include' | 'exclude'
  surfaceSwitching?: 'include' | 'exclude'
  systemAudio?: 'include' | 'exclude'
}

interface PendingRecordingState {
  cameraBlob: Blob | null
  screenBlob: Blob | null
  remainingStops: number
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
  const token = searchParams.get('token') || ''

  const [stage, setStage] = useState<Stage>('loading')
  const [interview, setInterview] = useState<InterviewData | null>(null)
  const [error, setError] = useState('')
  const [consent, setConsent] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [screenRecordedBlob, setScreenRecordedBlob] = useState<Blob | null>(null)
  const [timeLeft, setTimeLeft] = useState(240)
  const [reRecordUsed, setReRecordUsed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('idle')
  const [screenStatus, setScreenStatus] = useState<PermissionStatus>('idle')
  const [screenSurface, setScreenSurface] = useState('')
  const [setupBusy, setSetupBusy] = useState(false)
  const [setupError, setSetupError] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraRecorderRef = useRef<MediaRecorder | null>(null)
  const screenRecorderRef = useRef<MediaRecorder | null>(null)
  const cameraChunksRef = useRef<Blob[]>([])
  const screenChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const discardRecordingRef = useRef(false)
  const pendingRecordingRef = useRef<PendingRecordingState>({
    cameraBlob: null,
    screenBlob: null,
    remainingStops: 0,
  })

  const reviewUrl = useMemo(() => {
    if (!recordedBlob) {
      return null
    }
    return URL.createObjectURL(recordedBlob)
  }, [recordedBlob])

  useEffect(() => {
    return () => {
      if (reviewUrl) {
        URL.revokeObjectURL(reviewUrl)
      }
    }
  }, [reviewUrl])

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

  function clearRecordingArtifacts() {
    setRecordedBlob(null)
    setScreenRecordedBlob(null)
    cameraChunksRef.current = []
    screenChunksRef.current = []
    pendingRecordingRef.current = {
      cameraBlob: null,
      screenBlob: null,
      remainingStops: 0,
    }
  }

  function stopActiveRecorders() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

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
    stopActiveRecorders()
    clearRecordingArtifacts()
    setCameraStatus('idle')
    setScreenStatus('denied')
    setScreenSurface('')
    setSetupBusy(false)
    setSetupError(message)
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

  async function loadInterview(mode: 'initial' | 'resume' = 'initial') {
    try {
      const response = await fetch(`/api/take/${id}?token=${token}`)
      if (!response.ok) {
        throw new Error('Invalid or expired interview link')
      }
      const data: InterviewData = await response.json()
      setInterview(data)

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
    void loadInterview('initial')

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
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

  function finalizeRecordingPart(target: CaptureTarget) {
    const pending = pendingRecordingRef.current

    if (target === 'camera' && cameraChunksRef.current.length > 0) {
      pending.cameraBlob = new Blob(cameraChunksRef.current, { type: 'video/webm' })
    }

    if (target === 'screen' && screenChunksRef.current.length > 0) {
      pending.screenBlob = new Blob(screenChunksRef.current, { type: 'video/webm' })
    }

    pending.remainingStops -= 1
    if (pending.remainingStops > 0) {
      return
    }

    const shouldDiscard = discardRecordingRef.current
    discardRecordingRef.current = false

    if (shouldDiscard) {
      clearRecordingArtifacts()
      return
    }

    if (!pending.cameraBlob || !pending.screenBlob) {
      clearRecordingArtifacts()
      setSetupError('Recording failed. Please repeat this answer once more.')
      setStage('interview')
      return
    }

    setRecordedBlob(pending.cameraBlob)
    setScreenRecordedBlob(pending.screenBlob)
    setStage('review')
  }

  function startRecording() {
    if (!cameraStreamRef.current || !screenStreamRef.current) {
      resetInterviewSetup('Camera, microphone, and entire-screen sharing must stay active before recording.')
      return
    }

    clearRecordingArtifacts()
    discardRecordingRef.current = false
    pendingRecordingRef.current = {
      cameraBlob: null,
      screenBlob: null,
      remainingStops: 2,
    }

    const recorderOptions: MediaRecorderOptions = {
      mimeType: 'video/webm',
      videoBitsPerSecond: 1_500_000,
    }

    const cameraRecorder = new MediaRecorder(cameraStreamRef.current, recorderOptions)
    cameraRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        cameraChunksRef.current.push(event.data)
      }
    }
    cameraRecorder.onstop = () => {
      finalizeRecordingPart('camera')
    }

    const screenRecorder = new MediaRecorder(screenStreamRef.current, recorderOptions)
    screenRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        screenChunksRef.current.push(event.data)
      }
    }
    screenRecorder.onstop = () => {
      finalizeRecordingPart('screen')
    }

    cameraRecorderRef.current = cameraRecorder
    screenRecorderRef.current = screenRecorder
    cameraRecorder.start(1000)
    screenRecorder.start(1000)

    setRecording(true)
    setTimeLeft(240)
    setSetupError('')
    setStage('recording')

    timerRef.current = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          stopRecording()
          return 0
        }
        return current - 1
      })
    }, 1000)
  }

  function stopRecording() {
    stopActiveRecorders()
  }

  function handleReRecord() {
    clearRecordingArtifacts()
    setReRecordUsed(true)
    setStage('interview')
  }

  async function uploadRecording(
    blob: Blob,
    questionIndex: number,
    mediaType: CaptureTarget,
  ): Promise<{ mediaKey: string }> {
    const presignResponse = await fetch('/api/upload/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interviewId: id,
        questionIndex,
        contentType: 'video/webm',
        mediaType,
      }),
    })

    if (!presignResponse.ok) {
      throw new Error(`Failed to prepare the ${mediaType} upload.`)
    }

    const { uploadUrl, mediaKey } = (await presignResponse.json()) as {
      uploadUrl: string
      mediaKey: string
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'video/webm' },
    })

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed while sending the ${mediaType} recording.`)
    }

    return { mediaKey }
  }

  async function handleSubmitAnswer() {
    if (!recordedBlob || !screenRecordedBlob || !interview) {
      return
    }

    setUploading(true)

    try {
      const [cameraUpload, screenUpload] = await Promise.all([
        uploadRecording(recordedBlob, interview.currentQuestionIndex, 'camera'),
        uploadRecording(screenRecordedBlob, interview.currentQuestionIndex, 'screen'),
      ])

      const answerResponse = await fetch(`/api/take/${id}/answer?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIndex: interview.currentQuestionIndex,
          mediaKey: cameraUpload.mediaKey,
          screenMediaKey: screenUpload.mediaKey,
        }),
      })

      if (!answerResponse.ok) {
        throw new Error('Answer submission failed.')
      }

      clearRecordingArtifacts()
      setReRecordUsed(false)
      await loadInterview('resume')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const remainder = seconds % 60
    return `${minutes}:${remainder.toString().padStart(2, '0')}`
  }

  if (error) {
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
                label="Re-record"
                value={reRecordUsed ? 'Used' : 'Available'}
                valueClassName="mt-3 text-sm leading-6 text-foreground"
                description={
                  reRecordUsed ? 'Already used for this answer.' : 'Available once before submit.'
                }
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
                      : stage === 'review'
                        ? 'completed'
                        : 'neutral'
                  }
                >
                  {stage === 'recording'
                    ? 'Recording'
                    : stage === 'review'
                      ? 'Ready to submit'
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
              {stage === 'review' && reviewUrl ? (
                <video
                  key={reviewUrl}
                  src={reviewUrl}
                  controls
                  playsInline
                  className="video-preview"
                />
              ) : (
                <video ref={videoRef} autoPlay muted playsInline className="video-preview" />
              )}

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
                {stage === 'review'
                  ? 'Review the camera recording once, then submit. The full-screen recording for the same answer will be uploaded in parallel.'
                  : 'When you are ready, start recording and answer in one clear take while keeping the entire screen shared.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {stage === 'interview' ? (
                <Button
                  type="button"
                  onClick={startRecording}
                  className="rounded-full bg-primary-gradient px-5 shadow-soft hover:brightness-105"
                >
                  Start Recording
                </Button>
              ) : null}

              {stage === 'recording' ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={stopRecording}
                  disabled={!recording}
                  className="rounded-full"
                >
                  Stop Recording
                </Button>
              ) : null}

              {stage === 'review' ? (
                <>
                  {!reRecordUsed ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReRecord}
                      className="rounded-full bg-white/80"
                    >
                      Re-record
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={uploading}
                    className="rounded-full bg-primary-gradient px-5 shadow-soft hover:brightness-105"
                  >
                    {uploading ? 'Uploading camera + screen...' : 'Submit & Next'}
                  </Button>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
