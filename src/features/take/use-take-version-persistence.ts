import { useCallback, useRef } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import type { TakeInterviewData } from '@/lib/api';
import { submitTakeAnswer } from '@/lib/api';
import type { TakeStage } from '@/components/take/types';
import { runMutation } from '@/lib/run-mutation';
import { notifyError } from '@/lib/toast';
import { useToastMessages } from '@/lib/use-toast-messages';

import {
  MAX_ANSWER_ATTEMPTS_PER_QUESTION,
  getUsedAttempts,
  isAnswerAttemptLimitError,
  canRequestRetake,
  resolveNextVersionAfterSave,
} from './attempt-limit';

import {
  getMultipartSession,
  type AnswerBehaviorEvent,
  type MultipartUploadState,
} from './runtime';
import { isLastInterviewQuestion, type TakeMessageGetter } from './messages';
import type { TakeBehaviorSignals } from './utils';
import type { PendingVersionAction, VersionPersistKind } from './session-machine';

interface TranscriptFinalizeSnapshot {
  text: string;
  language: string;
  provider: string;
  generatedAt: string;
  isFinal: boolean;
}

export interface UseTakeVersionPersistenceParams {
  id: string;
  interview: TakeInterviewData | null;
  setUploading: (value: boolean) => void;
  setSubmitError: (value: string) => void;
  setStage: Dispatch<SetStateAction<TakeStage>>;
  setVersionPersistKind: (value: VersionPersistKind | null) => void;
  setCurrentVersionNumber: (value: number) => void;
  setRetakeCount: (value: number) => void;
  enqueueProgressFlush: (forceAllEvents: boolean) => Promise<void>;
  waitForProgressFlush: () => Promise<void>;
  queueBufferedUpload: (target: 'camera' | 'screen', forceAll: boolean) => Promise<void>;
  completeMultipartUpload: (target: 'camera' | 'screen') => Promise<void>;
  abortMultipartUploads: () => Promise<void>;
  multipartUploadsRef: MutableRefObject<MultipartUploadState>;
  currentVersionNumberRef: MutableRefObject<number>;
  pendingVersionActionRef: MutableRefObject<PendingVersionAction>;
  answerStartedAtRef: MutableRefObject<string | null>;
  answerStoppedAtMsRef: MutableRefObject<number | null>;
  answerDurationSecondsRef: MutableRefObject<number>;
  behaviorSignalsRef: MutableRefObject<TakeBehaviorSignals>;
  behaviorEventsRef: MutableRefObject<AnswerBehaviorEvent[]>;
  autoStartedQuestionKeyRef: MutableRefObject<string>;
  finalizeTranscriptForSubmit: () => Promise<TranscriptFinalizeSnapshot>;
  loadInterview: (mode?: 'initial' | 'resume', tokenOverride?: string) => Promise<void>;
  clearRecordingArtifacts: () => void;
  invokeBeginRecording: (
    nextVersionNumber: number,
    currentQuestionIndex: number,
  ) => Promise<void>;
  onAnswerMetaUpdated: (meta: {
    versionCount: number;
    selectedVersionNumber: number;
    status?: 'recording' | 'submitted';
  }) => void;
  takeMessage: TakeMessageGetter;
}

export function useTakeVersionPersistence({
  id,
  interview,
  setUploading,
  setSubmitError,
  setStage,
  setVersionPersistKind,
  setCurrentVersionNumber,
  setRetakeCount,
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
  const toastMessages = useToastMessages();
  const submitFallbackDetail = takeMessage('submitFallbackDetail');
  const persistInFlightRef = useRef(false);

  const notifyAttemptLimitReached = useCallback(
    (message?: string) => {
      notifyError(
        takeMessage('answerAttemptLimitReached', { max: MAX_ANSWER_ATTEMPTS_PER_QUESTION }),
        { description: message },
      );
    },
    [takeMessage],
  );

  const handleAttemptLimitApiError = useCallback(
    (error: unknown): boolean => {
      if (!isAnswerAttemptLimitError(error)) {
        return false;
      }
      notifyAttemptLimitReached(error instanceof Error ? error.message : undefined);
      return true;
    },
    [notifyAttemptLimitReached],
  );

  const persistCurrentVersion = useCallback(
    async (action: VersionPersistKind) => {
      if (!interview) return;
      if (persistInFlightRef.current) return;
      persistInFlightRef.current = true;
      setUploading(true);

      try {
        setSubmitError('');
        if (action === 'submit') {
          await waitForProgressFlush();
        } else {
          await enqueueProgressFlush(true);
        }
        await Promise.all([queueBufferedUpload('camera', true), queueBufferedUpload('screen', true)]);

        const cameraUpload = getMultipartSession(multipartUploadsRef.current, 'camera');
        const screenUpload = getMultipartSession(multipartUploadsRef.current, 'screen');

        const hasUploadedCameraParts = cameraUpload.uploadedPartCount > 0;
        const hasUploadedScreenParts = screenUpload.uploadedPartCount > 0;
        const hasUploadedAllParts = hasUploadedCameraParts && hasUploadedScreenParts;

        if (action === 'submit' && (!hasUploadedCameraParts || !hasUploadedScreenParts)) {
          throw new Error(takeMessage('shortRecordingSubmit'));
        }

        const startNextRecording = async (nextVersionNumber: number) => {
          setCurrentVersionNumber(nextVersionNumber);
          currentVersionNumberRef.current = nextVersionNumber;
          setRetakeCount(Math.max(nextVersionNumber - 1, 0));
          await invokeBeginRecording(nextVersionNumber, interview.currentQuestionIndex);
        };

        const handleRerecord = async () => {
          const savedVersionCount = getUsedAttempts(interview.currentAnswerMeta);
          const currentVersion = currentVersionNumberRef.current;

          if (!canRequestRetake(currentVersion)) {
            notifyAttemptLimitReached();
            setStage('interview');
            return;
          }

          if (!hasUploadedAllParts) {
            await abortMultipartUploads();
            clearRecordingArtifacts();
            pendingVersionActionRef.current = null;
            await startNextRecording(currentVersion);
            return;
          }

          await Promise.all([completeMultipartUpload('camera'), completeMultipartUpload('screen')]);
          await submitTakeAnswer(id, {
            questionIndex: cameraUpload.questionIndex,
            versionNumber: currentVersion,
            submitAnswer: false,
            mediaKey: cameraUpload.mediaKey,
            screenMediaKey: screenUpload.mediaKey,
            durationSeconds: answerDurationSecondsRef.current || 1,
            startedAt: answerStartedAtRef.current ?? new Date().toISOString(),
            submittedAt: new Date().toISOString(),
            cameraFileSizeBytes: cameraUpload.recordedBytes,
            screenFileSizeBytes: screenUpload.recordedBytes,
            behaviorSignals: behaviorSignalsRef.current,
            behaviorEvents: behaviorEventsRef.current,
          });

          const savedVersion = currentVersion;
          const usedAfterSave = Math.max(savedVersionCount, savedVersion);
          onAnswerMetaUpdated({
            versionCount: usedAfterSave,
            selectedVersionNumber: savedVersion,
            status: 'recording',
          });

          clearRecordingArtifacts();
          pendingVersionActionRef.current = null;

          const nextVersionNumber = resolveNextVersionAfterSave(
            savedVersion,
            { versionCount: usedAfterSave },
          );
          if (nextVersionNumber === null) {
            notifyAttemptLimitReached();
            setStage('interview');
            return;
          }

          await startNextRecording(nextVersionNumber);
        };

        const handleSubmit = async () => {
          await Promise.all([completeMultipartUpload('camera'), completeMultipartUpload('screen')]);

          const versionNumber = currentVersionNumberRef.current;
          const transcriptSnapshot = await finalizeTranscriptForSubmit();
          const submittedAt = new Date().toISOString();
          const fallbackStartedAt = answerStoppedAtMsRef.current
            ? new Date(answerStoppedAtMsRef.current - 1000).toISOString()
            : submittedAt;

          await submitTakeAnswer(id, {
            questionIndex: cameraUpload.questionIndex,
            versionNumber,
            submitAnswer: true,
            mediaKey: cameraUpload.mediaKey,
            screenMediaKey: screenUpload.mediaKey,
            durationSeconds: answerDurationSecondsRef.current || 1,
            startedAt: answerStartedAtRef.current ?? fallbackStartedAt,
            submittedAt,
            cameraFileSizeBytes: cameraUpload.recordedBytes,
            screenFileSizeBytes: screenUpload.recordedBytes,
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
          });

          clearRecordingArtifacts();
          pendingVersionActionRef.current = null;
          setCurrentVersionNumber(1);
          currentVersionNumberRef.current = 1;
          setRetakeCount(0);
          await loadInterview('resume');
        };

        if (action === 'submit') {
          const showSubmitSuccessToast = isLastInterviewQuestion(
            interview.currentQuestionIndex,
            interview.totalQuestions,
          );
          await runMutation(
            () => handleSubmit(),
            {
              successMessage: toastMessages.take.submitSuccess,
              showSuccessToast: showSubmitSuccessToast,
              errorMessage: toastMessages.take.submitError,
              showErrorToast: false,
              getErrorMessage: (error) =>
                error instanceof Error && error.message.trim()
                  ? error.message
                  : submitFallbackDetail,
            },
          );
        } else {
          await handleRerecord();
        }
      } catch (err) {
        await abortMultipartUploads();
        if (handleAttemptLimitApiError(err)) {
          autoStartedQuestionKeyRef.current = '';
          setStage('interview');
        } else if (action === 'submit') {
          setSubmitError(
            err instanceof Error && err.message.trim() ? err.message : submitFallbackDetail,
          );
          autoStartedQuestionKeyRef.current = '';
          setStage('interview');
        } else {
          setSubmitError(err instanceof Error ? err.message : takeMessage('uploadFailedFallback'));
          autoStartedQuestionKeyRef.current = '';
          setStage('interview');
        }
      } finally {
        setVersionPersistKind(null);
        setUploading(false);
        persistInFlightRef.current = false;
      }
    },
    [
      id,
      interview,
      setUploading,
      setSubmitError,
      setStage,
      setVersionPersistKind,
      setCurrentVersionNumber,
      setRetakeCount,
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
      submitFallbackDetail,
      takeMessage,
    ],
  );

  return { persistCurrentVersion };
}
