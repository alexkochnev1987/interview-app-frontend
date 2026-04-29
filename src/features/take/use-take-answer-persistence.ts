import { useCallback } from 'react';

import {
  abortMultipartUpload,
  completeMultipartUpload as completeMultipartUploadRequest,
  presignMultipartPart,
  sendTakeAnswerProgress,
  startMultipartUpload,
  uploadMultipartPart,
  type MultipartUploadPartResponse,
  type ClientTranscriptPayload,
  type TakeInterviewData,
} from '@/lib/api';

import {
  createMultipartUploadSession,
  buildProgressPayload,
  type AnswerBehaviorEvent,
  type CaptureTarget,
  type MultipartUploadSession,
  type MultipartUploadState,
} from './runtime';
import { handleRecordedChunk as handleRecordedChunkData, queueBufferedUpload as queueBufferedUploadData } from './multipart';
import type { TakeBehaviorSignals } from './utils';
import {
  buildFlushBehaviorEvents,
  enqueueProgressFlush as enqueueProgressFlushData,
  scheduleProgressFlush as scheduleProgressFlushData,
  startProgressHeartbeat as startProgressHeartbeatData,
} from './progress';
import { abortMultipartUploads as abortMultipartUploadsData, completeMultipartUpload as completeMultipartUploadData } from './uploads';

interface UseTakeAnswerPersistenceParams {
  id: string;
  interview: TakeInterviewData | null;
  currentVersionNumberRef: React.MutableRefObject<number>;
  answerStartedAtRef: React.MutableRefObject<string | null>;
  answerStoppedAtMsRef: React.MutableRefObject<number | null>;
  answerDurationSecondsRef: React.MutableRefObject<number>;
  behaviorSignalsRef: React.MutableRefObject<TakeBehaviorSignals>;
  behaviorEventsRef: React.MutableRefObject<AnswerBehaviorEvent[]>;
  flushedBehaviorEventCountRef: React.MutableRefObject<number>;
  progressRequestChainRef: React.MutableRefObject<Promise<void>>;
  progressHeartbeatRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  progressFlushTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  multipartUploadsRef: React.MutableRefObject<MultipartUploadState>;
  progressHeartbeatMs: number;
  progressDebounceMs: number;
  getBrowserTranscriptSnapshot: () => {
    text: string;
    language: string;
    provider: ClientTranscriptPayload['provider'];
    generatedAt: string;
    isFinal: boolean;
  };
}

export function useTakeAnswerPersistence({
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
  multipartUploadsRef,
  progressHeartbeatMs,
  progressDebounceMs,
  getBrowserTranscriptSnapshot,
}: UseTakeAnswerPersistenceParams) {
  const startMultipartUploadSession = useCallback(
    async (questionIndex: number, mediaType: CaptureTarget): Promise<MultipartUploadSession> => {
      const session = await startMultipartUpload(questionIndex, mediaType);
      return createMultipartUploadSession(session);
    },
    [],
  );

  const flushAnswerProgress = useCallback(
    async (forceAllEvents = false) => {
      if (!interview) {
        return;
      }

      const cameraUpload = multipartUploadsRef.current.camera;
      if (!cameraUpload) {
        return;
      }

      const screenUpload = multipartUploadsRef.current.screen;
      const behaviorEvents = buildFlushBehaviorEvents({
        behaviorEvents: behaviorEventsRef.current,
        forceAllEvents,
        flushedBehaviorEventCount: flushedBehaviorEventCountRef.current,
      });
      const transcriptSnapshot = getBrowserTranscriptSnapshot();

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
          clientTranscript:
            transcriptSnapshot?.text.trim()
              ? {
                  text: transcriptSnapshot.text,
                  language: transcriptSnapshot.language,
                  provider: transcriptSnapshot.provider,
                  generatedAt: transcriptSnapshot.generatedAt,
                  isFinal: transcriptSnapshot.isFinal,
                }
              : undefined,
        }),
      );

      flushedBehaviorEventCountRef.current = behaviorEventsRef.current.length;
    },
    [
      interview,
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
    ],
  );

  const enqueueProgressFlush = useCallback(
    (forceAllEvents = false) =>
      enqueueProgressFlushData({
        progressRequestChainRef,
        flushAnswerProgress: (forceAll) => flushAnswerProgress(forceAll),
        forceAllEvents,
      }),
    [progressRequestChainRef, flushAnswerProgress],
  );

  const scheduleProgressFlush = useCallback(
    (reason: 'event' | 'heartbeat' | 'start' | 'stop') => {
      scheduleProgressFlushData({
        multipartUploadsRef,
        progressFlushTimeoutRef,
        enqueueProgressFlush: (forceAll = false) => enqueueProgressFlush(forceAll),
        reason,
        progressDebounceMs,
      });
    },
    [multipartUploadsRef, progressFlushTimeoutRef, enqueueProgressFlush, progressDebounceMs],
  );

  const startProgressHeartbeat = useCallback(() => {
    startProgressHeartbeatData({
      progressHeartbeatRef,
      progressHeartbeatMs,
      scheduleProgressFlush: (reason) => scheduleProgressFlush(reason),
    });
  }, [progressHeartbeatRef, progressHeartbeatMs, scheduleProgressFlush]);

  const presignMultipartPartUpload = useCallback(
    async (
      target: CaptureTarget,
      session: MultipartUploadSession,
      questionIndex: number,
      partNumber: number,
    ): Promise<MultipartUploadPartResponse> => {
      try {
        return await presignMultipartPart(
          questionIndex,
          session.mediaKey,
          session.uploadId,
          partNumber,
        );
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message.replace('upload', target)
            : `Failed to prepare ${target} upload chunk ${partNumber}.`,
        );
      }
    },
    [],
  );

  const queueBufferedUpload = useCallback(
    (target: CaptureTarget, forceFinal = false) =>
      queueBufferedUploadData({
        target,
        multipartUploadsRef,
        forceFinal,
        questionIndex: interview?.currentQuestionIndex ?? 0,
        presignMultipartPartUpload,
        uploadMultipartPart,
        scheduleProgressFlush: (reason) => scheduleProgressFlush(reason),
      }),
    [multipartUploadsRef, interview, presignMultipartPartUpload, scheduleProgressFlush],
  );

  const handleRecordedChunk = useCallback(
    (target: CaptureTarget, blob: Blob) => {
      handleRecordedChunkData({
        target,
        blob,
        multipartUploadsRef,
        questionIndex: interview?.currentQuestionIndex ?? 0,
        queueBufferedUpload: (nextTarget, nextForceFinal = false) =>
          queueBufferedUpload(nextTarget, nextForceFinal),
        scheduleProgressFlush: (reason) => scheduleProgressFlush(reason),
      });
    },
    [multipartUploadsRef, interview, queueBufferedUpload, scheduleProgressFlush],
  );

  const completeMultipartUpload = useCallback(
    async (target: CaptureTarget) => {
      await completeMultipartUploadData({
        target,
        multipartUploadsRef,
        questionIndex: interview?.currentQuestionIndex ?? 0,
        completeMultipartUploadRequest,
      });
    },
    [multipartUploadsRef, interview],
  );

  const abortMultipartUploads = useCallback(async () => {
    await abortMultipartUploadsData({
      multipartUploadsRef,
      questionIndex: interview?.currentQuestionIndex ?? 0,
      abortMultipartUploadRequest: abortMultipartUpload,
    });
  }, [multipartUploadsRef, interview]);

  return {
    startMultipartUploadSession,
    flushAnswerProgress,
    enqueueProgressFlush,
    scheduleProgressFlush,
    startProgressHeartbeat,
    queueBufferedUpload,
    handleRecordedChunk,
    completeMultipartUpload,
    abortMultipartUploads,
  };
}
