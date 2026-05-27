import { useCallback, useRef } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import type { TakeInterviewData } from '@/lib/api';
import { submitTakeAnswer } from '@/lib/api';
import type { TakeStage } from '@/components/take/types';
import { runMutation } from '@/lib/run-mutation';
import { useToastMessages } from '@/lib/use-toast-messages';

import {
  getMultipartSession,
  type AnswerBehaviorEvent,
  type MultipartUploadState,
} from './runtime';
import { isLastInterviewQuestion, takeMessage } from './messages';
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
  invokeBeginRecording: (nextVersionNumber: number, currentQuestionIndex: number) => Promise<void>;
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
}: UseTakeVersionPersistenceParams) {
  const toastMessages = useToastMessages();
  const submitFallbackDetail = takeMessage('submitFallbackDetail');
  const persistInFlightRef = useRef(false);

  const persistCurrentVersion = useCallback(
    async (action: VersionPersistKind) => {
      if (!interview) return;
      if (persistInFlightRef.current) return;
      persistInFlightRef.current = true;
      setUploading(true);

      try {
        setSubmitError('');
        await enqueueProgressFlush(true);
        await Promise.all([queueBufferedUpload('camera', true), queueBufferedUpload('screen', true)]);

        const cameraUpload = getMultipartSession(multipartUploadsRef.current, 'camera');
        const screenUpload = getMultipartSession(multipartUploadsRef.current, 'screen');

        const hasUploadedCameraParts = cameraUpload.uploadedPartCount > 0;
        const hasUploadedScreenParts = screenUpload.uploadedPartCount > 0;
        const hasUploadedAllParts = hasUploadedCameraParts && hasUploadedScreenParts;

        if (action === 'submit' && (!hasUploadedCameraParts || !hasUploadedScreenParts)) {
          throw new Error(takeMessage('shortRecordingSubmit'));
        }

        const startNextRerecordVersion = async () => {
          const nextVersionNumber = currentVersionNumberRef.current + 1;
          setCurrentVersionNumber(nextVersionNumber);
          currentVersionNumberRef.current = nextVersionNumber;
          setRetakeCount(nextVersionNumber - 1);
          await invokeBeginRecording(nextVersionNumber, interview.currentQuestionIndex);
        };

        const handleRerecord = async () => {
          if (!hasUploadedAllParts) {
            await abortMultipartUploads();
            clearRecordingArtifacts();
            pendingVersionActionRef.current = null;
            await startNextRerecordVersion();
            return;
          }

          await Promise.all([completeMultipartUpload('camera'), completeMultipartUpload('screen')]);
          await submitTakeAnswer(id, {
            questionIndex: cameraUpload.questionIndex,
            versionNumber: currentVersionNumberRef.current,
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

          clearRecordingArtifacts();
          pendingVersionActionRef.current = null;
          await startNextRerecordVersion();
        };

        const handleSubmit = async () => {
          await Promise.all([completeMultipartUpload('camera'), completeMultipartUpload('screen')]);

          const transcriptSnapshot = await finalizeTranscriptForSubmit();
          const submittedAt = new Date().toISOString();
          const fallbackStartedAt = answerStoppedAtMsRef.current
            ? new Date(answerStoppedAtMsRef.current - 1000).toISOString()
            : submittedAt;

          await submitTakeAnswer(id, {
            questionIndex: cameraUpload.questionIndex,
            versionNumber: currentVersionNumberRef.current,
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
              getErrorMessage: () => submitFallbackDetail,
            },
          );
        } else {
          await handleRerecord();
        }
      } catch (err) {
        await abortMultipartUploads();
        if (action === 'submit') {
          setSubmitError(
            err instanceof Error && err.message.trim() ? err.message : submitFallbackDetail,
          );
        } else {
          setSubmitError(err instanceof Error ? err.message : takeMessage('uploadFailedFallback'));
        }
        autoStartedQuestionKeyRef.current = '';
        setStage('interview');
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
      toastMessages.take.submitError,
      toastMessages.take.submitSuccess,
      submitFallbackDetail,
    ],
  );

  return { persistCurrentVersion };
}
