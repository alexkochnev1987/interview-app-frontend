'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { InterviewDataView, PermissionStatus, TakeStage } from '@/components/take/types'
import {
  TAKE_MESSAGES,
  type TakeMessageKey,
  type TakeMessageValues,
} from '@/features/take/messages'
import { releaseAllInterviewCaptures, stopActiveTakeMediaRecorders } from '@/features/take/runtime'
import type { InterviewerPresence } from '@/features/take/use-take-question-tts'
import {
  buildMediaRecorderOptions,
  getPermissionErrorMessage,
  INTERVIEW_DISPLAY_MEDIA_OPTIONS,
  isAcceptedInterviewDisplaySurface,
  permissionLabel,
  readDisplaySurface,
  TAKE_RECORDING_LIMIT_SECONDS,
} from '@/features/take/utils'
import type { Locale } from '@/i18n/locales'
import type { TakeInterviewData } from '@/lib/api'

type PendingAction = 'submit' | 'rerecord' | null

interface UsePracticeTakeExperienceParams {
  candidateName: string
  position: string
  questionTexts: string[]
}

export interface PracticeTakeExperience {
  stage: TakeStage
  interview: InterviewDataView
  consent: boolean
  setConsent: (value: boolean) => void
  setupError: string
  setupBusy: boolean
  cameraStatus: PermissionStatus
  screenStatus: PermissionStatus
  screenSurface: string
  lobbyMicOn: boolean
  lobbyCameraOn: boolean
  cameraStream: MediaStream | null
  videoRef: React.RefObject<HTMLVideoElement | null>
  screenVideoRef: React.RefObject<HTMLVideoElement | null>
  versionNumber: number
  recording: boolean
  timeLeft: number
  interviewerPresence: InterviewerPresence
  progressValue: number
  captureReady: boolean
  permissionLabel: (status: PermissionStatus) => string
  onContinueToLobby: () => void
  onToggleMic: () => void
  onToggleCamera: () => void
  onScreenShare: () => void
  onJoin: () => void
  onRerecord: () => void
  onSubmit: () => void
}

export function usePracticeTakeExperience({
  candidateName,
  position,
  questionTexts,
}: UsePracticeTakeExperienceParams): PracticeTakeExperience {
  const tTake = useTranslations('takeFlow')
  const interviewLocale = useLocale() as Locale
  const takeMessage = useCallback(
    (key: TakeMessageKey, values?: TakeMessageValues) =>
      tTake.has(key)
        ? values
          ? tTake(key, values)
          : tTake(key)
        : TAKE_MESSAGES[key].replace(/\{(\w+)\}/g, (_, name: string) =>
            String(values?.[name] ?? ''),
          ),
    [tTake],
  )

  const totalQuestions = questionTexts.length
  const [stage, setStage] = useState<TakeStage>('consent')
  const [consent, setConsent] = useState(false)
  const [setupBusy, setSetupBusy] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('idle')
  const [screenStatus, setScreenStatus] = useState<PermissionStatus>('idle')
  const [screenSurface, setScreenSurface] = useState('')
  const [lobbyMicOn, setLobbyMicOn] = useState(true)
  const [lobbyCameraOn, setLobbyCameraOn] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [versionNumber, setVersionNumber] = useState(1)
  const [recording, setRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TAKE_RECORDING_LIMIT_SECONDS)
  const [setupError, setSetupError] = useState('')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const screenVideoRef = useRef<HTMLVideoElement | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const cameraRecorderRef = useRef<MediaRecorder | null>(null)
  const screenRecorderRef = useRef<MediaRecorder | null>(null)
  const expectedStopsRef = useRef(0)
  const stoppedCountRef = useRef(0)
  const pendingActionRef = useRef<PendingAction>(null)
  // MediaRecorder's onstop handler is assigned once when recording starts and fires later,
  // outside React's render cycle — it must read the *current* question index via a ref, not
  // the closed-over state value, or every advance after the first would re-check a stale index.
  const currentIndexRef = useRef(0)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      stopActiveTakeMediaRecorders(cameraRecorderRef, screenRecorderRef)
      releaseAllInterviewCaptures(cameraStreamRef, screenStreamRef, videoRef, screenVideoRef)
      setCameraStream(null)
    }
  }, [])

  useEffect(() => {
    if (stage !== 'recording' || !recording || timeLeft <= 0) {
      return
    }
    const timer = setTimeout(() => setTimeLeft((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [stage, recording, timeLeft])

  useEffect(() => {
    if (stage === 'recording' && recording && timeLeft === 0) {
      stopRecording('submit')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, recording, timeLeft])

  const interview: TakeInterviewData = useMemo(
    () => ({
      id: 'practice-take',
      position,
      interviewLocale,
      candidateName,
      status: 'in_progress',
      totalQuestions,
      currentQuestion: {
        text: questionTexts[currentIndex] ?? '',
        followUpQuestions: [],
        resolvedLocale: interviewLocale,
      },
      currentQuestionIndex: currentIndex,
      currentAnswerMeta: {
        status: 'recording',
        versionCount: versionNumber,
        selectedVersionNumber: versionNumber,
        hasSubmittableMedia: false,
        latestSubmittableVersionNumber: null,
      },
      maxAttempts: 3,
      completed: false,
    }),
    [
      position,
      interviewLocale,
      candidateName,
      totalQuestions,
      questionTexts,
      currentIndex,
      versionNumber,
    ],
  )

  const beginRecording = useCallback(() => {
    if (!cameraStreamRef.current || !screenStreamRef.current) {
      return
    }
    const options = buildMediaRecorderOptions()

    const cameraRecorder = new MediaRecorder(cameraStreamRef.current, options)
    cameraRecorder.ondataavailable = () => undefined
    cameraRecorder.onstop = handleRecorderStopped
    const screenRecorder = new MediaRecorder(screenStreamRef.current, options)
    screenRecorder.ondataavailable = () => undefined
    screenRecorder.onstop = handleRecorderStopped

    cameraRecorderRef.current = cameraRecorder
    screenRecorderRef.current = screenRecorder
    stoppedCountRef.current = 0

    cameraRecorder.start(1000)
    screenRecorder.start(1000)
    expectedStopsRef.current = 2

    setTimeLeft(TAKE_RECORDING_LIMIT_SECONDS)
    setSetupError('')
    setStage('recording')
    setRecording(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleRecorderStopped() {
    stoppedCountRef.current += 1
    if (stoppedCountRef.current < expectedStopsRef.current) {
      return
    }
    const action = pendingActionRef.current
    pendingActionRef.current = null

    if (action === 'rerecord') {
      setVersionNumber((value) => value + 1)
      beginRecording()
      return
    }

    if (currentIndexRef.current >= totalQuestions - 1) {
      releaseAllInterviewCaptures(cameraStreamRef, screenStreamRef, videoRef, screenVideoRef)
      setStage('complete')
      return
    }
    currentIndexRef.current += 1
    setCurrentIndex(currentIndexRef.current)
    setVersionNumber(1)
    beginRecording()
  }

  function stopRecording(action: PendingAction) {
    setRecording(false)
    pendingActionRef.current = action
    const expected = stopActiveTakeMediaRecorders(cameraRecorderRef, screenRecorderRef)
    if (expected === 0) {
      handleRecorderStopped()
      return
    }
    expectedStopsRef.current = expected
  }

  const prepareCamera = useCallback(async () => {
    setCameraStatus('pending')
    setSetupError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 854, height: 480 },
        audio: true,
      })
      cameraStreamRef.current = stream
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        void videoRef.current.play().catch(() => undefined)
      }
      setCameraStatus('granted')
    } catch {
      setCameraStatus('denied')
      setSetupError(takeMessage('permissionNotAllowed'))
    }
  }, [takeMessage])

  const attachScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setSetupError(takeMessage('browserUnsupported'))
      return
    }
    try {
      setSetupBusy(true)
      setSetupError('')
      setScreenStatus('pending')

      const screenStream = await navigator.mediaDevices.getDisplayMedia(
        INTERVIEW_DISPLAY_MEDIA_OPTIONS,
      )
      const screenTrack = screenStream.getVideoTracks()[0]
      if (!screenTrack) {
        screenStream.getTracks().forEach((track) => track.stop())
        throw new Error(takeMessage('screenTrackMissing'))
      }

      const displaySurface = readDisplaySurface(screenTrack)
      if (!isAcceptedInterviewDisplaySurface(displaySurface)) {
        screenStream.getTracks().forEach((track) => track.stop())
        setScreenStatus('denied')
        setScreenSurface(displaySurface)
        setSetupError(getPermissionErrorMessage(new Error('wrong-surface'), true, takeMessage))
        return
      }

      screenStreamRef.current = screenStream
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream
        void screenVideoRef.current.play().catch(() => undefined)
      }
      setScreenSurface(displaySurface)
      setScreenStatus('granted')
    } catch (err) {
      setScreenStatus('denied')
      setScreenSurface('')
      setSetupError(getPermissionErrorMessage(err, true, takeMessage))
    } finally {
      setSetupBusy(false)
    }
  }, [takeMessage])

  const toggleTrack = useCallback(
    (kind: 'audio' | 'video') => {
      const stream = cameraStreamRef.current
      if (!stream) return
      const next = !(kind === 'audio' ? lobbyMicOn : lobbyCameraOn)
      const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks()
      tracks.forEach((track) => {
        track.enabled = next
      })
      if (kind === 'audio') setLobbyMicOn(next)
      else setLobbyCameraOn(next)
    },
    [lobbyMicOn, lobbyCameraOn],
  )

  const onContinueToLobby = useCallback(() => {
    setStage('lobby')
    void prepareCamera()
  }, [prepareCamera])

  const captureReady =
    cameraStatus === 'granted' && screenStatus === 'granted' && screenSurface === 'monitor'

  const progressValue = totalQuestions ? Math.round((currentIndex / totalQuestions) * 100) : 0

  return {
    stage,
    interview,
    consent,
    setConsent,
    setupError,
    setupBusy,
    cameraStatus,
    screenStatus,
    screenSurface,
    lobbyMicOn,
    lobbyCameraOn,
    cameraStream,
    videoRef,
    screenVideoRef,
    versionNumber,
    recording,
    timeLeft,
    interviewerPresence: 'listening',
    progressValue,
    captureReady,
    permissionLabel: (status: PermissionStatus) => permissionLabel(status, takeMessage),
    onContinueToLobby,
    onToggleMic: () => toggleTrack('audio'),
    onToggleCamera: () => toggleTrack('video'),
    onScreenShare: () => void attachScreenShare(),
    onJoin: () => captureReady && beginRecording(),
    onRerecord: () => stopRecording('rerecord'),
    onSubmit: () => stopRecording('submit'),
  }
}
