import { type MutableRefObject } from 'react';

import { reserveTakeAnswerAttempt, type TakeProgressResponse } from '@/lib/api';
import type { CaptureTarget, MultipartUploadSession, MultipartUploadState } from './runtime';
import { buildMediaRecorderOptions, pickSupportedMediaRecorderMimeType, TAKE_RECORDING_LIMIT_SECONDS } from './utils';
import {
  MAX_ANSWER_ATTEMPTS_PER_QUESTION,
  isAnswerAttemptLimitError,
  isRecordingSessionMismatchError,
} from './attempt-limit';
import { resolveRecordingSessionId } from './recording-session-id';
import type { TakeMessageGetter } from './messages';

type PendingVersionAction = 'submit' | 'rerecord' | null;

export interface AnswerMetaUpdate {
  versionCount: number;
  selectedVersionNumber: number;
  status?: 'recording' | 'submitted';
  maxAttempts?: number;
  recordingSessionId?: string;
  hasSubmittableMedia?: boolean;
  latestSubmittableVersionNumber?: number | null;
}

interface UseTakeBeginRecordingParams {
  interviewId: string;
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
  recordingSessionIdRef: MutableRefObject<string | null>;
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
  onAnswerMetaUpdated: (meta: AnswerMetaUpdate) => void;
  getAnswerMaxAttempts?: () => number;
  /** Double-guard: exhausted / non-recording phases must not reserve or progress. */
  canStartRecordingAttempt?: () => boolean;
  /**
   * After reserve succeeds but start fails, stash slot so immediate autostart can
   * retry with reuseReservedAttempt (no second reserve).
   */
  pendingReuseReservedRef: MutableRefObject<{
    versionNumber: number;
    versionCount: number;
    maxAttempts: number;
    /** How many start failures already happened for this reserved slot. */
    failCount: number;
  } | null>;
  startMultipartUploadSession: (
    questionIndex: number,
    mediaType: CaptureTarget,
    options: { versionNumber: number; recordingSessionId: string },
  ) => Promise<MultipartUploadSession>;
  flushAnswerProgress: (forceAllEvents: boolean) => Promise<TakeProgressResponse | undefined>;
  startProgressHeartbeat: () => void;
  abortMultipartUploads: () => Promise<void>;
  handleRecordedChunk: (target: CaptureTarget, blob: Blob) => void;
  onRecordersStopped: () => void;
  primeBrowserTranscriptForRecordingSession: () => void;
  takeMessage: TakeMessageGetter;
}

export interface BeginRecordingInput {
  nextVersionNumber: number;
  hasCurrentQuestion: boolean;
  currentQuestionIndex: number;
  /** Reuse an already-reserved attempt slot (e.g. retake before any parts uploaded). */
  reuseReservedAttempt?: boolean;
  versionCount?: number;
  maxAttempts?: number;
}

export function useTakeBeginRecording({
  interviewId,
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
  recordingSessionIdRef,
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
  onAnswerMetaUpdated,
  getAnswerMaxAttempts,
  canStartRecordingAttempt,
  pendingReuseReservedRef,
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
    reuseReservedAttempt = false,
    versionCount,
    maxAttempts,
  }: BeginRecordingInput) {
    if (
      !reuseReservedAttempt &&
      canStartRecordingAttempt &&
      !canStartRecordingAttempt()
    ) {
      return;
    }

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

    let reservedSlot: {
      versionNumber: number;
      versionCount: number;
      maxAttempts: number;
    } | null = null;

    try {
      const recordingSessionId = resolveRecordingSessionId(recordingSessionIdRef.current);
      recordingSessionIdRef.current = recordingSessionId;

      let versionNumber = nextVersionNumber;
      let resolvedVersionCount = versionCount ?? Math.max(nextVersionNumber, 0);
      let resolvedMaxAttempts =
        maxAttempts ?? getAnswerMaxAttempts?.() ?? MAX_ANSWER_ATTEMPTS_PER_QUESTION;
      let resolvedStatus: 'recording' | 'submitted' = 'recording';

      if (!reuseReservedAttempt) {
        const reserved = await reserveTakeAnswerAttempt(interviewId, {
          questionIndex: currentQuestionIndex,
          recordingSessionId,
        });

        versionNumber = reserved.versionNumber;
        resolvedVersionCount = reserved.versionCount;
        resolvedMaxAttempts = reserved.maxAttempts;
        resolvedStatus = reserved.status;
      }

      reservedSlot = {
        versionNumber,
        versionCount: resolvedVersionCount,
        maxAttempts: resolvedMaxAttempts,
      };

      currentVersionNumberRef.current = versionNumber;
      setCurrentVersionNumber(versionNumber);
      setRetakeCount(Math.max(versionNumber - 1, 0));
      onAnswerMetaUpdated({
        versionCount: resolvedVersionCount,
        selectedVersionNumber: versionNumber,
        status: resolvedStatus,
        maxAttempts: resolvedMaxAttempts,
        recordingSessionId,
      });

      const uploadOptions = {
        versionNumber,
        recordingSessionId,
      };
      const [cameraUpload, screenUpload] = await Promise.all([
        startMultipartUploadSession(currentQuestionIndex, 'camera', uploadOptions),
        startMultipartUploadSession(currentQuestionIndex, 'screen', uploadOptions),
      ]);

      multipartUploadsRef.current = {
        camera: cameraUpload,
        screen: screenUpload,
      };

      await flushAnswerProgress(true);
      startProgressHeartbeat();
      pendingReuseReservedRef.current = null;
    } catch (err) {
      await abortMultipartUploads();
      clearRecordingArtifacts();
      const priorFails = pendingReuseReservedRef.current?.failCount ?? 0;
      const nextFailCount = priorFails + 1;
      // Keep reserved slot for immediate autostart retry — do not burn another attempt.
      pendingReuseReservedRef.current = reservedSlot
        ? { ...reservedSlot, failCount: nextFailCount }
        : null;
      if (isAnswerAttemptLimitError(err)) {
        pendingReuseReservedRef.current = null;
        setSetupError(
          takeMessage('answerAttemptLimitReached', {
            max: getAnswerMaxAttempts?.() ?? MAX_ANSWER_ATTEMPTS_PER_QUESTION,
          }),
        );
      } else if (isRecordingSessionMismatchError(err)) {
        pendingReuseReservedRef.current = null;
        setSetupError(takeMessage('recordingSessionMismatch'));
      } else if (reservedSlot && nextFailCount <= 1) {
        // One immediate reuse autostart while devices are still live.
        setSetupError('');
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
