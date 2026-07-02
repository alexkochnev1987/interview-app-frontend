'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import type {
  InterviewDataView,
  PermissionStatus,
  TakeStage,
} from '@/components/take/types'
import type { InterviewerPresence } from '@/features/take/use-take-question-tts'
import type { TakeInterviewData } from '@/lib/api'
import {
  TAKE_MESSAGES,
  type TakeMessageKey,
  type TakeMessageValues,
} from '@/features/take'
import { permissionLabel, TAKE_RECORDING_LIMIT_SECONDS } from '@/features/take/utils'

interface UseDemoTakeExperienceParams {
  candidateName: string
  position: string
  questionTexts: string[]
}

export interface DemoTakeExperience {
  stage: TakeStage
  interview: InterviewDataView
  consent: boolean
  setConsent: (value: boolean) => void
  setupError: string
  cameraStatus: PermissionStatus
  screenStatus: PermissionStatus
  lobbyMicOn: boolean
  lobbyCameraOn: boolean
  videoRef: React.RefObject<HTMLVideoElement | null>
  screenVideoRef: React.RefObject<HTMLVideoElement | null>
  versionNumber: number
  recording: boolean
  timeLeft: number
  interviewerPresence: InterviewerPresence
  progressValue: number
  permissionLabel: (status: PermissionStatus) => string
  onContinueToLobby: () => void
  onToggleMic: () => void
  onToggleCamera: () => void
  onScreenShare: () => void
  onJoin: () => void
  onRerecord: () => void
  onSubmit: () => void
}

export function useDemoTakeExperience({
  candidateName,
  position,
  questionTexts,
}: UseDemoTakeExperienceParams): DemoTakeExperience {
  const tTake = useTranslations('takeFlow')
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
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('idle')
  const [screenStatus, setScreenStatus] = useState<PermissionStatus>('idle')
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

  const stopCamera = useCallback(() => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
    cameraStreamRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  useEffect(() => {
    if (stage !== 'recording' || !recording || timeLeft <= 0) {
      return
    }
    const timer = setTimeout(() => setTimeLeft((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [stage, recording, timeLeft])

  const interview: TakeInterviewData = useMemo(
    () => ({
      id: 'demo-take',
      position,
      candidateName,
      status: 'in_progress',
      totalQuestions,
      currentQuestion: { text: questionTexts[currentIndex] ?? '' },
      currentQuestionIndex: currentIndex,
      currentAnswerMeta: {
        status: 'recording',
        versionCount: versionNumber,
        selectedVersionNumber: versionNumber,
      },
      completed: false,
    }),
    [position, candidateName, totalQuestions, questionTexts, currentIndex, versionNumber],
  )

  const beginQuestion = useCallback(() => {
    setVersionNumber(1)
    setTimeLeft(TAKE_RECORDING_LIMIT_SECONDS)
    setStage('recording')
    setRecording(true)
  }, [])

  const prepareCamera = useCallback(async () => {
    setCameraStatus('pending')
    setSetupError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 854, height: 480 },
        audio: true,
      })
      cameraStreamRef.current = stream
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

  const toggleTrack = useCallback(
    (kind: 'audio' | 'video') => {
      const stream = cameraStreamRef.current
      if (!stream) return
      const next = !(kind === 'audio' ? lobbyMicOn : lobbyCameraOn)
      const tracks =
        kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks()
      tracks.forEach((track) => {
        track.enabled = next
      })
      if (kind === 'audio') setLobbyMicOn(next)
      else setLobbyCameraOn(next)
    },
    [lobbyMicOn, lobbyCameraOn],
  )

  const onSubmit = useCallback(() => {
    setRecording(false)
    if (currentIndex >= totalQuestions - 1) {
      stopCamera()
      setStage('complete')
      return
    }
    const next = currentIndex + 1
    setCurrentIndex(next)
    beginQuestion()
  }, [currentIndex, totalQuestions, stopCamera, beginQuestion])

  const onRerecord = useCallback(() => {
    setVersionNumber((value) => value + 1)
    setTimeLeft(TAKE_RECORDING_LIMIT_SECONDS)
    setRecording(true)
    setStage('recording')
  }, [])

  const onContinueToLobby = useCallback(() => {
    setStage('lobby')
    void prepareCamera()
  }, [prepareCamera])

  const progressValue = totalQuestions
    ? Math.round((currentIndex / totalQuestions) * 100)
    : 0

  return {
    stage,
    interview,
    consent,
    setConsent,
    setupError,
    cameraStatus,
    screenStatus,
    lobbyMicOn,
    lobbyCameraOn,
    videoRef,
    screenVideoRef,
    versionNumber,
    recording,
    timeLeft,
    interviewerPresence: 'listening',
    progressValue,
    permissionLabel: (status: PermissionStatus) =>
      permissionLabel(status, takeMessage),
    onContinueToLobby,
    onToggleMic: () => toggleTrack('audio'),
    onToggleCamera: () => toggleTrack('video'),
    onScreenShare: () => setScreenStatus('granted'),
    onJoin: () => beginQuestion(),
    onRerecord,
    onSubmit,
  }
}
