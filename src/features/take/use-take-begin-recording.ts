import { type MutableRefObject } from 'react';

import type { TakeProgressResponse } from '@/lib/api';
import type { CaptureTarget, MultipartUploadSession, MultipartUploadState } from './runtime';
import { buildMediaRecorderOptions, pickSupportedMediaRecorderMimeType, TAKE_RECORDING_LIMIT_SECONDS } from './utils';
import {
  isAnswerAttemptLimitError,
  shouldSendAnswerProgressDuringRecording,
} from './attempt-limit';
import type { TakeMessageGetter } from './messages';

type PendingVersionAction = 'submit' | 'rerecord' | null;

interface UseTakeBeginRecordingParams {
  cameraStreamRef: MutableRefObject<MediaStream | null>;
  screenStreamRef: MutableRefObject<MediaStream | null>;
  cameraRecorderRef: MutableRefObject<MediaRecorder | null>;
  screenRecorderRef: MutableRefObject<MediaRecorder | null>;
  expectedRecorderStopsRef: MutableRefObject<number>;
  timerRef: MutableRefObject<ReturnType<typeof setInterval> | null>;
  stoppedRecordersRef: MutableRefObject<number>;
  discardRecordingRef: MutableRefObject<boolean>;
  pendingVersionActionRef: MutableRefObject<PendingVersionAction>;
  currentVersionNumberRef: MutableRefObject<number>;
  answerStartedAtRef: MutableRefObject<string | null>;
  answerStartedAtMsRef: MutableRefObject<number | null>;
  answerStoppedAtMsRef: MutableRefObject<number | null>;
  autoStartedQuestionKeyRef: MutableRefObject<string>;
  multipartUploadsRef: MutableRefObject<MultipartUploadState>;
  requestVersionActionRef: MutableRefObject<(action: PendingVersionAction) => void>;
  setCurrentVersionNumber: (value: number) => void;
  setRetakeCount: (value: number) => void;
  setRecording: (value: boolean) => void;
  setTimeLeft: (value: number | ((prev: number) => number)) => void;
  setSetupError: (value: string) => void;
  setStage: (value: 'recording' | 'interview') => void;
  clearVersionPersistKind: () => void;
  clearRecordingArtifacts: () => void;
  resetInterviewSetup: (message: string) => void;
  startMultipartUploadSession: (
    questionIndex: number,
    mediaType: CaptureTarget,
    options?: { versionNumber?: number },
  ) => Promise<MultipartUploadSession>;
  flushAnswerProgress: (forceAllEvents: boolean) => Promise<TakeProgressResponse | undefined>;
  startProgressHeartbeat: () => void;
  abortMultipartUploads: () => Promise<void>;
  handleRecordedChunk: (target: CaptureTarget, blob: Blob) => void;
  onRecordersStopped: () => void;
  primeBrowserTranscriptForRecordingSession: () => void;
  takeMessage: TakeMessageGetter;
}

interface BeginRecordingInput {
  nextVersionNumber: number;
  hasCurrentQuestion: boolean;
  currentQuestionIndex: number;
}

export function useTakeBeginRecording({
  cameraStreamRef,
  screenStreamRef,
  cameraRecorderRef,
  screenRecorderRef,
  expectedRecorderStopsRef,
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
  requestVersionActionRef,
  setCurrentVersionNumber,
  setRetakeCount,
  setRecording,
  setTimeLeft,
  setSetupError,
  setStage,
  clearVersionPersistKind,
  clearRecordingArtifacts,
  resetInterviewSetup,
  startMultipartUploadSession,
  flushAnswerProgress,
  startProgressHeartbeat,
  abortMultipartUploads,
  handleRecordedChunk,
  onRecordersStopped,
  primeBrowserTranscriptForRecordingSession,
  takeMessage,
}: UseTakeBeginRecordingParams) {
  function handleRecorderStopped() {
    stoppedRecordersRef.current += 1;
    if (stoppedRecordersRef.current < expectedRecorderStopsRef.current) {
      return;
    }
    onRecordersStopped();
  }

  async function beginRecording({
    nextVersionNumber,
    hasCurrentQuestion,
    currentQuestionIndex,
  }: BeginRecordingInput) {
    if (!cameraStreamRef.current || !screenStreamRef.current) {
      resetInterviewSetup(takeMessage('lobbyInterviewStartBlocked'));
      return;
    }

    if (!hasCurrentQuestion) {
      return;
    }

    clearRecordingArtifacts();
    discardRecordingRef.current = false;
    pendingVersionActionRef.current = null;
    currentVersionNumberRef.current = nextVersionNumber;
    setCurrentVersionNumber(nextVersionNumber);
    setRetakeCount(Math.max(nextVersionNumber - 1, 0));
    answerStartedAtRef.current = new Date().toISOString();
    answerStartedAtMsRef.current = Date.now();
    answerStoppedAtMsRef.current = null;
    stoppedRecordersRef.current = 0;

    try {
      const uploadOptions = { versionNumber: nextVersionNumber };
      const [cameraUpload, screenUpload] = await Promise.all([
        startMultipartUploadSession(currentQuestionIndex, 'camera', uploadOptions),
        startMultipartUploadSession(currentQuestionIndex, 'screen', uploadOptions),
      ]);

      multipartUploadsRef.current = {
        camera: cameraUpload,
        screen: screenUpload,
      };

      if (shouldSendAnswerProgressDuringRecording(nextVersionNumber)) {
        await flushAnswerProgress(true);
        startProgressHeartbeat();
      }
    } catch (err) {
      await abortMultipartUploads();
      clearRecordingArtifacts();
      if (isAnswerAttemptLimitError(err)) {
        setSetupError(takeMessage('answerAttemptLimitReached'));
      } else {
        setSetupError(
          err instanceof Error ? err.message : takeMessage('uploadFailedFallback'),
        );
      }
      autoStartedQuestionKeyRef.current = '';
      setStage('interview');
      return;
    }

    const recorderOptions = buildMediaRecorderOptions();

    const cameraRecorder = new MediaRecorder(cameraStreamRef.current, recorderOptions);
    cameraRecorder.ondataavailable = (event) => {
      handleRecordedChunk('camera', event.data);
    };
    cameraRecorder.onstop = () => {
      handleRecorderStopped();
    };

    const screenRecorder = new MediaRecorder(screenStreamRef.current, recorderOptions);
    screenRecorder.ondataavailable = (event) => {
      handleRecordedChunk('screen', event.data);
    };
    screenRecorder.onstop = () => {
      handleRecorderStopped();
    };

    const cameraSession = multipartUploadsRef.current.camera;
    const screenSession = multipartUploadsRef.current.screen;
    const mimeForParts =
      cameraRecorder.mimeType.trim() ||
      screenRecorder.mimeType.trim() ||
      pickSupportedMediaRecorderMimeType() ||
      '';
    if (cameraSession && screenSession && mimeForParts) {
      cameraSession.partBlobType = mimeForParts;
      screenSession.partBlobType = mimeForParts;
    }

    cameraRecorderRef.current = cameraRecorder;
    screenRecorderRef.current = screenRecorder;

    cameraRecorder.start(1000);
    screenRecorder.start(1000);
    expectedRecorderStopsRef.current = 2;

    primeBrowserTranscriptForRecordingSession();

    setRecording(true);
    setTimeLeft(TAKE_RECORDING_LIMIT_SECONDS);
    setSetupError('');
    setStage('recording');
    clearVersionPersistKind();

    const countdownInterval = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          const intervalId = timerRef.current;
          if (intervalId !== null) {
            clearInterval(intervalId);
            timerRef.current = null;
          }
          requestVersionActionRef.current('submit');
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    timerRef.current = countdownInterval;
  }

  return { beginRecording };
}
