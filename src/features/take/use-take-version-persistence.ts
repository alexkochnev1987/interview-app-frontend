import { useCallback, useRef } from 'react'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'

import type { TakeStage } from '@/components/take/types'
import type { TakeInterviewData } from '@/lib/api'
import { finalizeTakeAnswer, submitTakeAnswer } from '@/lib/api'
import { useAppConfig } from '@/lib/app-config-context'
import { runMutation } from '@/lib/run-mutation'
import { notifyError } from '@/lib/toast'
import { useToastMessages } from '@/lib/use-toast-messages'

import {
  MAX_ANSWER_ATTEMPTS_PER_QUESTION,
  getUsedAttempts,
  isAnswerAttemptLimitError,
  canRequestRetake,
  resolveNextVersionAfterSave,
  shouldReuseReservedAttemptForRetake,
} from './attempt-limit'
import {
  isLastInterviewQuestion,
  mapTakeSubmitErrorMessage,
  type TakeMessageGetter,
} from './messages'
import { getMultipartSession, type AnswerBehaviorEvent, type MultipartUploadState } from './runtime'
import type { PendingVersionAction, VersionPersistKind } from './session-machine'
import type { AnswerMetaUpdate } from './use-take-begin-recording'
import type { TakeBehaviorSignals } from './utils'

interface TranscriptFinalizeSnapshot {
  text: string
  language: string
  provider: string
  generatedAt: string
  isFinal: boolean
}

export interface UseTakeVersionPersistenceParams {
  id: string
  interview: TakeInterviewData | null
  setUploading: (value: boolean) => void
  setSubmitError: (value: string) => void
  setActionErrorKind: (value: VersionPersistKind | null) => void
  setStage: Dispatch<SetStateAction<TakeStage>>
  setVersionPersistKind: (value: VersionPersistKind | null) => void
  setCurrentVersionNumber: (value: number) => void
  setRetakeCount: (value: number) => void
  setRecordingStartBusy: (value: boolean) => void
  enqueueProgressFlush: (forceAllEvents: boolean) => Promise<void>
  waitForProgressFlush: () => Promise<void>
  queueBufferedUpload: (target: 'camera' | 'screen', forceAll: boolean) => Promise<void>
  completeMultipartUpload: (target: 'camera' | 'screen') => Promise<void>
  abortMultipartUploads: () => Promise<void>
  multipartUploadsRef: MutableRefObject<MultipartUploadState>
  currentVersionNumberRef: MutableRefObject<number>
  pendingVersionActionRef: MutableRefObject<PendingVersionAction>
  answerStartedAtRef: MutableRefObject<string | null>
  answerStoppedAtMsRef: MutableRefObject<number | null>
  answerDurationSecondsRef: MutableRefObject<number>
  behaviorSignalsRef: MutableRefObject<TakeBehaviorSignals>
  behaviorEventsRef: MutableRefObject<AnswerBehaviorEvent[]>
  autoStartedQuestionKeyRef: MutableRefObject<string>
  finalizeTranscriptForSubmit: () => Promise<TranscriptFinalizeSnapshot>
  loadInterview: (mode?: 'initial' | 'resume', tokenOverride?: string) => Promise<void>
  clearRecordingArtifacts: () => void
  invokeBeginRecording: (
    nextVersionNumber: number,
    currentQuestionIndex: number,
    options?: {
      reuseReservedAttempt?: boolean
      versionCount?: number
      maxAttempts?: number
    },
  ) => Promise<void>
  onAnswerMetaUpdated: (meta: AnswerMetaUpdate) => void
  takeMessage: TakeMessageGetter
}

export function useTakeVersionPersistence({
  id,
  interview,
  setUploading,
  setSubmitError,
  setActionErrorKind,
  setStage,
  setVersionPersistKind,
  setCurrentVersionNumber,
  setRetakeCount,
  setRecordingStartBusy,
  enqueueProgressFlush,
  waitForProgressFlush,
  queueBufferedUpload,
  completeMultipartUpload,
  abortMultipartUploads,
  multipartUploadsRef,
  currentVersionNumberRef,
  pendingVersionActionRef,
  answerStartedAtRef,
  answerStoppedAtMsRef,
  answerDurationSecondsRef,
  behaviorSignalsRef,
  behaviorEventsRef,
  autoStartedQuestionKeyRef,
  finalizeTranscriptForSubmit,
  loadInterview,
  clearRecordingArtifacts,
  invokeBeginRecording,
  onAnswerMetaUpdated,
  takeMessage,
}: UseTakeVersionPersistenceParams) {
  const appConfig = useAppConfig()
  const toastMessages = useToastMessages()
  const persistInFlightRef = useRef(false)

  const notifyAttemptLimitReached = useCallback(
    (message?: string) => {
      notifyError(
        takeMessage('answerAttemptLimitReached', {
          max: interview?.maxAttempts ?? appConfig.MAX_ANSWER_ATTEMPTS_PER_QUESTION,
        }),
        { description: message },
      )
    },
    [interview?.maxAttempts, appConfig.MAX_ANSWER_ATTEMPTS_PER_QUESTION, takeMessage],
  )

  const handleAttemptLimitApiError = useCallback(
    (error: unknown): boolean => {
      if (!isAnswerAttemptLimitError(error)) {
        return false
      }
      notifyAttemptLimitReached(error instanceof Error ? error.message : undefined)
      return true
    },
    [notifyAttemptLimitReached],
  )

  const persistCurrentVersion = useCallback(
    async (action: VersionPersistKind) => {
      if (!interview) return
      if (persistInFlightRef.current) return
      persistInFlightRef.current = true
      setUploading(true)

      try {
        setSubmitError('')
        setActionErrorKind(null)
        if (action === 'submit') {
          await waitForProgressFlush()
        } else {
          await enqueueProgressFlush(true)
        }
        await Promise.all([
          queueBufferedUpload('camera', true),
          queueBufferedUpload('screen', true),
        ])

        const cameraUpload = getMultipartSession(multipartUploadsRef.current, 'camera')
        const screenUpload = getMultipartSession(multipartUploadsRef.current, 'screen')

        const hasUploadedCameraParts = cameraUpload.uploadedPartCount > 0
        const hasUploadedScreenParts = screenUpload.uploadedPartCount > 0

        if (action === 'submit' && (!hasUploadedCameraParts || !hasUploadedScreenParts)) {
          throw new Error(takeMessage('shortRecordingSubmit'))
        }

        const startNextRecording = async (
          nextVersionNumber: number,
          options?: {
            reuseReservedAttempt?: boolean
            versionCount?: number
            maxAttempts?: number
          },
        ) => {
          setRecordingStartBusy(true)
          try {
            setCurrentVersionNumber(nextVersionNumber)
            currentVersionNumberRef.current = nextVersionNumber
            setRetakeCount(Math.max(nextVersionNumber - 1, 0))
            await invokeBeginRecording(nextVersionNumber, interview.currentQuestionIndex, options)
          } finally {
            setRecordingStartBusy(false)
          }
        }

        const handleRerecord = async () => {
          const savedVersionCount = getUsedAttempts(interview.currentAnswerMeta)
          const currentVersion = currentVersionNumberRef.current
          const answerMeta = interview.currentAnswerMeta

          if (
            !canRequestRetake(
              currentVersion,
              {
                maxAttempts: interview.maxAttempts,
              },
              appConfig.MAX_ANSWER_ATTEMPTS_PER_QUESTION,
            )
          ) {
            notifyAttemptLimitReached()
            setStage('interview')
            return
          }

          const hasCameraMedia =
            cameraUpload.mediaKeyPersisted ||
            cameraUpload.recordedBytes > 0 ||
            hasUploadedCameraParts

          const hasScreenMedia =
            screenUpload.mediaKeyPersisted ||
            screenUpload.recordedBytes > 0 ||
            hasUploadedScreenParts

          // Treat media as present only when both camera + screen have something.
          // Partial recordings (e.g. screen-share dropped mid-recording) should not
          // be considered a usable saved version for retake/advance decisions.
          const localVersionHasMedia = hasCameraMedia && hasScreenMedia

          const isEmptyPersistedStub =
            (cameraUpload.mediaKeyPersisted || screenUpload.mediaKeyPersisted) &&
            cameraUpload.uploadedPartCount === 0 &&
            screenUpload.uploadedPartCount === 0 &&
            cameraUpload.recordedBytes < 1 &&
            screenUpload.recordedBytes < 1

          const reuseReservedAttempt =
            !isEmptyPersistedStub &&
            shouldReuseReservedAttemptForRetake({
              currentVersionNumber: currentVersion,
              hasSubmittableMedia: answerMeta?.hasSubmittableMedia,
              latestSubmittableVersionNumber: answerMeta?.latestSubmittableVersionNumber,
              localVersionHasMedia,
            })

          if (reuseReservedAttempt) {
            await abortMultipartUploads()
            clearRecordingArtifacts()
            pendingVersionActionRef.current = null
            await startNextRecording(currentVersion, {
              reuseReservedAttempt: true,
              versionCount: answerMeta?.versionCount ?? currentVersion,
              maxAttempts: interview.maxAttempts,
            })
            return
          }

          if (isEmptyPersistedStub) {
            await abortMultipartUploads()
            clearRecordingArtifacts()
            pendingVersionActionRef.current = null
            const nextVersionNumber = resolveNextVersionAfterSave(
              currentVersion,
              {
                versionCount: Math.max(savedVersionCount, currentVersion),
                maxAttempts: interview.maxAttempts,
              },
              appConfig.MAX_ANSWER_ATTEMPTS_PER_QUESTION,
            )
            if (nextVersionNumber === null) {
              notifyAttemptLimitReached()
              setStage('interview')
              return
            }
            await startNextRecording(nextVersionNumber, {
              maxAttempts: interview.maxAttempts,
            })
            return
          }

          await Promise.all([completeMultipartUpload('camera'), completeMultipartUpload('screen')])
          await submitTakeAnswer(id, {
            questionIndex: cameraUpload.questionIndex,
            versionNumber: currentVersion,
            submitAnswer: false,
            mediaKey: cameraUpload.mediaKey,
            screenMediaKey: screenUpload.mediaKey,
            durationSeconds: answerDurationSecondsRef.current || 1,
            startedAt: answerStartedAtRef.current ?? new Date().toISOString(),
            submittedAt: new Date().toISOString(),
            cameraFileSizeBytes: cameraUpload.recordedBytes || undefined,
            screenFileSizeBytes: screenUpload.recordedBytes || undefined,
            behaviorSignals: behaviorSignalsRef.current,
            behaviorEvents: behaviorEventsRef.current,
          })

          const savedVersion = currentVersion
          const usedAfterSave = Math.max(savedVersionCount, savedVersion)
          onAnswerMetaUpdated({
            versionCount: usedAfterSave,
            selectedVersionNumber: savedVersion,
            status: 'recording',
            hasSubmittableMedia: true,
            latestSubmittableVersionNumber: savedVersion,
          })

          clearRecordingArtifacts()
          pendingVersionActionRef.current = null

          const nextVersionNumber = resolveNextVersionAfterSave(
            savedVersion,
            {
              versionCount: usedAfterSave,
              maxAttempts: interview.maxAttempts,
            },
            appConfig.MAX_ANSWER_ATTEMPTS_PER_QUESTION,
          )
          if (nextVersionNumber === null) {
            notifyAttemptLimitReached()
            setStage('interview')
            return
          }

          await startNextRecording(nextVersionNumber, {
            maxAttempts: interview.maxAttempts,
          })
        }

        const handleSubmit = async () => {
          await Promise.all([completeMultipartUpload('camera'), completeMultipartUpload('screen')])

          const versionNumber = currentVersionNumberRef.current
          const transcriptSnapshot = await finalizeTranscriptForSubmit()
          const submittedAt = new Date().toISOString()
          const fallbackStartedAt = answerStoppedAtMsRef.current
            ? new Date(answerStoppedAtMsRef.current - 1000).toISOString()
            : submittedAt

          await submitTakeAnswer(id, {
            questionIndex: cameraUpload.questionIndex,
            versionNumber,
            submitAnswer: true,
            mediaKey: cameraUpload.mediaKey,
            screenMediaKey: screenUpload.mediaKey,
            durationSeconds: answerDurationSecondsRef.current || 1,
            startedAt: answerStartedAtRef.current ?? fallbackStartedAt,
            submittedAt,
            cameraFileSizeBytes: cameraUpload.recordedBytes || undefined,
            screenFileSizeBytes: screenUpload.recordedBytes || undefined,
            behaviorSignals: behaviorSignalsRef.current,
            behaviorEvents: behaviorEventsRef.current,
            ...(transcriptSnapshot.text.trim()
              ? {
                  clientTranscript: {
                    text: transcriptSnapshot.text,
                    language: transcriptSnapshot.language,
                    provider: transcriptSnapshot.provider,
                    generatedAt: transcriptSnapshot.generatedAt,
                    isFinal: true,
                  },
                }
              : {}),
          })

          clearRecordingArtifacts()
          pendingVersionActionRef.current = null
          autoStartedQuestionKeyRef.current = ''
          setCurrentVersionNumber(1)
          currentVersionNumberRef.current = 1
          setRetakeCount(0)
          await loadInterview('resume')
        }

        if (action === 'submit') {
          const showSubmitSuccessToast = isLastInterviewQuestion(
            interview.currentQuestionIndex,
            interview.totalQuestions,
          )
          await runMutation(() => handleSubmit(), {
            successMessage: toastMessages.take.submitSuccess,
            showSuccessToast: showSubmitSuccessToast,
            errorMessage: toastMessages.take.submitError,
            showErrorToast: false,
            getErrorMessage: (error) =>
              mapTakeSubmitErrorMessage(error, takeMessage, {
                maxAttempts: interview.maxAttempts,
              }),
          })
        } else {
          await handleRerecord()
        }
      } catch (err) {
        await abortMultipartUploads()
        if (handleAttemptLimitApiError(err)) {
          autoStartedQuestionKeyRef.current = ''
          setStage('interview')
        } else if (action === 'submit') {
          setActionErrorKind('submit')
          setSubmitError(
            mapTakeSubmitErrorMessage(err, takeMessage, {
              maxAttempts: interview.maxAttempts,
            }),
          )
          autoStartedQuestionKeyRef.current = ''
          setStage('interview')
        } else {
          setActionErrorKind('rerecord')
          setSubmitError(
            mapTakeSubmitErrorMessage(err, takeMessage, {
              maxAttempts: interview.maxAttempts,
            }),
          )
          autoStartedQuestionKeyRef.current = ''
          setStage('interview')
        }
      } finally {
        setVersionPersistKind(null)
        setUploading(false)
        persistInFlightRef.current = false
      }
    },
    [
      id,
      interview,
      setUploading,
      setSubmitError,
      setActionErrorKind,
      setStage,
      // oxlint-disable-next-line react/memo-dependencies
      setVersionPersistKind,
      setCurrentVersionNumber,
      setRetakeCount,
      setRecordingStartBusy,
      enqueueProgressFlush,
      waitForProgressFlush,
      queueBufferedUpload,
      completeMultipartUpload,
      abortMultipartUploads,
      multipartUploadsRef,
      currentVersionNumberRef,
      pendingVersionActionRef,
      answerStartedAtRef,
      answerStoppedAtMsRef,
      answerDurationSecondsRef,
      behaviorSignalsRef,
      behaviorEventsRef,
      autoStartedQuestionKeyRef,
      finalizeTranscriptForSubmit,
      loadInterview,
      clearRecordingArtifacts,
      invokeBeginRecording,
      onAnswerMetaUpdated,
      notifyAttemptLimitReached,
      handleAttemptLimitApiError,
      toastMessages.take.submitError,
      toastMessages.take.submitSuccess,
      takeMessage,
      appConfig.MAX_ANSWER_ATTEMPTS_PER_QUESTION,
    ],
  )

  const submitReviewAnswer = useCallback(async () => {
    if (!interview) return
    if (persistInFlightRef.current) return

    const meta = interview.currentAnswerMeta
    const latestSubmittableVersionNumber = meta?.latestSubmittableVersionNumber ?? null
    if (!meta?.hasSubmittableMedia || latestSubmittableVersionNumber === null) {
      setSubmitError(takeMessage('attemptsExhaustedNoMedia'))
      return
    }

    persistInFlightRef.current = true
    setUploading(true)
    setVersionPersistKind('submit')
    setSubmitError('')
    setActionErrorKind(null)
    setCurrentVersionNumber(latestSubmittableVersionNumber)
    currentVersionNumberRef.current = latestSubmittableVersionNumber

    const maxAttempts = interview.maxAttempts ?? MAX_ANSWER_ATTEMPTS_PER_QUESTION

    try {
      const showSubmitSuccessToast = isLastInterviewQuestion(
        interview.currentQuestionIndex,
        interview.totalQuestions,
      )

      await runMutation(
        async () => {
          await finalizeTakeAnswer(id, {
            questionIndex: interview.currentQuestionIndex,
          })

          clearRecordingArtifacts()
          pendingVersionActionRef.current = null
          setCurrentVersionNumber(1)
          currentVersionNumberRef.current = 1
          setRetakeCount(0)
          await loadInterview('resume')
        },
        {
          successMessage: toastMessages.take.submitSuccess,
          showSuccessToast: showSubmitSuccessToast,
          errorMessage: toastMessages.take.submitError,
          showErrorToast: false,
          getErrorMessage: (error) =>
            mapTakeSubmitErrorMessage(error, takeMessage, { maxAttempts }),
        },
      )
    } catch (err) {
      if (handleAttemptLimitApiError(err)) {
        autoStartedQuestionKeyRef.current = ''
        setStage('interview')
      } else {
        setActionErrorKind('submit')
        setSubmitError(mapTakeSubmitErrorMessage(err, takeMessage, { maxAttempts }))
        autoStartedQuestionKeyRef.current = ''
        setStage('interview')
      }
    } finally {
      setVersionPersistKind(null)
      setUploading(false)
      persistInFlightRef.current = false
    }
  }, [
    id,
    interview,
    setUploading,
    setVersionPersistKind,
    setSubmitError,
    setActionErrorKind,
    setStage,
    setCurrentVersionNumber,
    setRetakeCount,
    autoStartedQuestionKeyRef,
    currentVersionNumberRef,
    pendingVersionActionRef,
    clearRecordingArtifacts,
    loadInterview,
    handleAttemptLimitApiError,
    toastMessages.take.submitError,
    toastMessages.take.submitSuccess,
    takeMessage,
  ])

  return { persistCurrentVersion, submitReviewAnswer }
}
