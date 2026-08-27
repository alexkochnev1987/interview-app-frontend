import { useCallback, useRef } from 'react'

import {
  abortMultipartUpload,
  completeMultipartUpload as completeMultipartUploadRequest,
  presignMultipartPart as preSignMultipartPart,
  sendTakeAnswerProgress,
  startMultipartUpload,
  uploadMultipartPart,
  type MultipartUploadPartResponse,
  type ClientTranscriptPayload,
  type TakeProgressResponse,
} from '@/lib/api'
import { ApiError } from '@/lib/api-error'

import {
  handleRecordedChunk as handleRecordedChunkData,
  queueBufferedUpload as queueBufferedUploadData,
} from './multipart'
import {
  buildFlushBehaviorEvents,
  enqueueProgressFlush as enqueueProgressFlushData,
  scheduleProgressFlush as scheduleProgressFlushData,
  startProgressHeartbeat as startProgressHeartbeatData,
} from './progress'
import {
  createMultipartUploadSession,
  buildProgressPayload,
  type AnswerBehaviorEvent,
  type CaptureTarget,
  type MultipartUploadSession,
  type MultipartUploadState,
} from './runtime'
import {
  abortMultipartUploads as abortMultipartUploadsData,
  finalizeMultipartUpload,
} from './uploads'
import type { AnswerMetaUpdate } from './use-take-begin-recording'
import type { TakeBehaviorSignals } from './utils'

interface UseTakeAnswerPersistenceParams {
  id: string
  onAnswerMetaUpdated?: (meta: AnswerMetaUpdate) => void
  currentVersionNumberRef: React.MutableRefObject<number>
  answerStartedAtRef: React.MutableRefObject<string | null>
  answerStoppedAtMsRef: React.MutableRefObject<number | null>
  answerDurationSecondsRef: React.MutableRefObject<number>
  behaviorSignalsRef: React.MutableRefObject<TakeBehaviorSignals>
  behaviorEventsRef: React.MutableRefObject<AnswerBehaviorEvent[]>
  flushedBehaviorEventCountRef: React.MutableRefObject<number>
  progressRequestChainRef: React.MutableRefObject<Promise<void>>
  progressHeartbeatRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>
  progressFlushTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  multipartUploadsRef: React.MutableRefObject<MultipartUploadState>
  progressHeartbeatMs: number
  progressDebounceMs: number
  progressEventDebounceMs: number
  getBrowserTranscriptSnapshot: () => {
    text: string
    language: string
    provider: ClientTranscriptPayload['provider']
    generatedAt: string
    isFinal: boolean
  }
}

export function useTakeAnswerPersistence({
  id,
  onAnswerMetaUpdated,
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
  multipartUploadsRef,
  progressHeartbeatMs,
  progressDebounceMs,
  progressEventDebounceMs,
  getBrowserTranscriptSnapshot,
}: UseTakeAnswerPersistenceParams) {
  const lastEventFlushQueuedAtMsRef = useRef(0)

  const startMultipartUploadSession = useCallback(
    async (
      questionIndex: number,
      mediaType: CaptureTarget,
      options: { versionNumber: number },
    ): Promise<MultipartUploadSession> => {
      const session = await startMultipartUpload(questionIndex, mediaType, {
        versionNumber: options.versionNumber,
      })
      return createMultipartUploadSession({
        ...session,
        questionIndex,
        versionNumber: options.versionNumber,
      })
    },
    [],
  )

  const flushAnswerProgress = useCallback(
    async (forceAllEvents = false): Promise<TakeProgressResponse | undefined> => {
      const cameraUpload = multipartUploadsRef.current.camera
      if (!cameraUpload) {
        return undefined
      }

      const screenUpload = multipartUploadsRef.current.screen
      const behaviorEvents = buildFlushBehaviorEvents({
        behaviorEvents: behaviorEventsRef.current,
        forceAllEvents,
        flushedBehaviorEventCount: flushedBehaviorEventCountRef.current,
      })
      const transcriptSnapshot = getBrowserTranscriptSnapshot()

      const progressResponse = await sendTakeAnswerProgress(
        id,
        buildProgressPayload({
          questionIndex: cameraUpload.questionIndex,
          versionNumber: cameraUpload.versionNumber,
          mediaKey: cameraUpload.mediaKey,
          screenMediaKey: screenUpload?.mediaKey,
          durationSeconds: answerDurationSecondsRef.current,
          startedAt: answerStartedAtRef.current ?? undefined,
          submittedAtMs: answerStoppedAtMsRef.current,
          cameraFileSizeBytes: cameraUpload.recordedBytes,
          screenFileSizeBytes: screenUpload?.recordedBytes,
          behaviorSignals: behaviorSignalsRef.current,
          behaviorEvents,
          clientTranscript: transcriptSnapshot?.text.trim()
            ? {
                text: transcriptSnapshot.text,
                language: transcriptSnapshot.language,
                provider: transcriptSnapshot.provider,
                generatedAt: transcriptSnapshot.generatedAt,
                isFinal: transcriptSnapshot.isFinal,
              }
            : undefined,
        }),
      )

      flushedBehaviorEventCountRef.current = behaviorEventsRef.current.length
      const activeVersionNumber = cameraUpload.versionNumber
      if (progressResponse.selectedVersionNumber === activeVersionNumber) {
        currentVersionNumberRef.current = progressResponse.selectedVersionNumber
      } else if (currentVersionNumberRef.current !== activeVersionNumber) {
        currentVersionNumberRef.current = activeVersionNumber
      }
      cameraUpload.mediaKeyPersisted = true
      if (screenUpload) {
        screenUpload.mediaKeyPersisted = true
      }
      onAnswerMetaUpdated?.({
        versionCount: progressResponse.versionCount,
        selectedVersionNumber: activeVersionNumber,
        status: progressResponse.status,
      })
      return progressResponse
    },
    [
      multipartUploadsRef,
      behaviorEventsRef,
      flushedBehaviorEventCountRef,
      id,
      currentVersionNumberRef,
      answerDurationSecondsRef,
      answerStartedAtRef,
      answerStoppedAtMsRef,
      behaviorSignalsRef,
      getBrowserTranscriptSnapshot,
      onAnswerMetaUpdated,
    ],
  )

  const enqueueProgressFlush = useCallback(
    (forceAllEvents = false) =>
      enqueueProgressFlushData({
        progressRequestChainRef,
        flushAnswerProgress: async (forceAll) => {
          await flushAnswerProgress(forceAll)
        },
        forceAllEvents,
      }),
    [progressRequestChainRef, flushAnswerProgress],
  )

  const waitForProgressFlush = useCallback(
    () => progressRequestChainRef.current.catch(() => undefined),
    [progressRequestChainRef],
  )

  const scheduleProgressFlush = useCallback(
    (reason: 'event' | 'heartbeat' | 'start' | 'stop') => {
      if (reason === 'event') {
        const now = Date.now()
        if (now - lastEventFlushQueuedAtMsRef.current < progressEventDebounceMs) {
          return
        }
        lastEventFlushQueuedAtMsRef.current = now
      }

      scheduleProgressFlushData({
        multipartUploadsRef,
        progressFlushTimeoutRef,
        enqueueProgressFlush: (forceAll = false) => enqueueProgressFlush(forceAll),
        reason,
        progressDebounceMs,
      })
    },
    [
      multipartUploadsRef,
      progressFlushTimeoutRef,
      enqueueProgressFlush,
      progressDebounceMs,
      progressEventDebounceMs,
    ],
  )

  const startProgressHeartbeat = useCallback(() => {
    startProgressHeartbeatData({
      progressHeartbeatRef,
      progressHeartbeatMs,
      scheduleProgressFlush: (reason) => scheduleProgressFlush(reason),
    })
  }, [progressHeartbeatRef, progressHeartbeatMs, scheduleProgressFlush])

  const preSignMultipartPartUpload = useCallback(
    async (
      target: CaptureTarget,
      session: MultipartUploadSession,
      partNumber: number,
    ): Promise<MultipartUploadPartResponse> => {
      try {
        return await preSignMultipartPart(
          session.questionIndex,
          session.mediaKey,
          session.uploadId,
          partNumber,
          {
            versionNumber: session.versionNumber,
          },
        )
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }
        throw new Error(
          error instanceof Error
            ? error.message.replace('upload', target)
            : `Failed to prepare ${target} upload chunk ${partNumber}.`,
          { cause: error },
        )
      }
    },
    [],
  )

  const queueBufferedUpload = useCallback(
    (target: CaptureTarget, forceFinal = false) =>
      queueBufferedUploadData({
        target,
        multipartUploadsRef,
        forceFinal,
        preSignMultipartPartUpload,
        uploadMultipartPart,
      }),
    [multipartUploadsRef, preSignMultipartPartUpload],
  )

  const handleRecordedChunk = useCallback(
    (target: CaptureTarget, blob: Blob) => {
      handleRecordedChunkData({
        target,
        blob,
        multipartUploadsRef,
        queueBufferedUpload: (nextTarget, nextForceFinal = false) =>
          queueBufferedUpload(nextTarget, nextForceFinal),
      })
    },
    [multipartUploadsRef, queueBufferedUpload],
  )

  const completeMultipartUpload = useCallback(
    async (target: CaptureTarget) => {
      await finalizeMultipartUpload({
        target,
        multipartUploadsRef,
        completeMultipartUploadRequest,
      })
    },
    [multipartUploadsRef],
  )

  const abortMultipartUploads = useCallback(async () => {
    await abortMultipartUploadsData({
      multipartUploadsRef,
      abortMultipartUploadRequest: abortMultipartUpload,
    })
  }, [multipartUploadsRef])

  return {
    startMultipartUploadSession,
    flushAnswerProgress,
    enqueueProgressFlush,
    waitForProgressFlush,
    scheduleProgressFlush,
    startProgressHeartbeat,
    queueBufferedUpload,
    handleRecordedChunk,
    completeMultipartUpload,
    abortMultipartUploads,
  }
}
