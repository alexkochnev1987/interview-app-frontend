import type { MutableRefObject } from 'react';

import type { CaptureTarget, MultipartUploadSession, MultipartUploadState } from './runtime';

type PendingVersionAction = 'submit' | 'rerecord' | null;

interface UseTakeBeginRecordingParams {
  cameraStreamRef: MutableRefObject<MediaStream | null>;
  screenStreamRef: MutableRefObject<MediaStream | null>;
  cameraRecorderRef: MutableRefObject<MediaRecorder | null>;
  screenRecorderRef: MutableRefObject<MediaRecorder | null>;
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
  setTransitionLabel: (value: string) => void;
  clearRecordingArtifacts: () => void;
  resetInterviewSetup: (message: string) => void;
  startMultipartUploadSession: (
    questionIndex: number,
    mediaType: CaptureTarget,
  ) => Promise<MultipartUploadSession>;
  flushAnswerProgress: (forceAllEvents: boolean) => Promise<void>;
  startProgressHeartbeat: () => void;
  abortMultipartUploads: () => Promise<void>;
  handleRecordedChunk: (target: CaptureTarget, blob: Blob) => void;
  onRecordersStopped: () => void;
  startBrowserTranscript: () => void;
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
  setTransitionLabel,
  clearRecordingArtifacts,
  resetInterviewSetup,
  startMultipartUploadSession,
  flushAnswerProgress,
  startProgressHeartbeat,
  abortMultipartUploads,
  handleRecordedChunk,
  onRecordersStopped,
  startBrowserTranscript,
}: UseTakeBeginRecordingParams) {
  function handleRecorderStopped() {
    stoppedRecordersRef.current += 1;
    if (stoppedRecordersRef.current < 2) {
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
      resetInterviewSetup('Camera, microphone, and entire-screen sharing must stay active before recording.');
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
      const [cameraUpload, screenUpload] = await Promise.all([
        startMultipartUploadSession(currentQuestionIndex, 'camera'),
        startMultipartUploadSession(currentQuestionIndex, 'screen'),
      ]);

      multipartUploadsRef.current = {
        camera: cameraUpload,
        screen: screenUpload,
      };

      await flushAnswerProgress(true);
      startProgressHeartbeat();
    } catch (err) {
      await abortMultipartUploads();
      clearRecordingArtifacts();
      setSetupError(err instanceof Error ? err.message : 'Failed to start recording.');
      autoStartedQuestionKeyRef.current = '';
      setStage('interview');
      return;
    }

    const recorderOptions: MediaRecorderOptions = {
      mimeType: 'video/webm',
      videoBitsPerSecond: 1_500_000,
    };

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

    cameraRecorderRef.current = cameraRecorder;
    screenRecorderRef.current = screenRecorder;
    cameraRecorder.start(1000);
    screenRecorder.start(1000);
    startBrowserTranscript();

    setRecording(true);
    setTimeLeft(240);
    setSetupError('');
    setStage('recording');
    setTransitionLabel('');

    timerRef.current = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          requestVersionActionRef.current('submit');
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }

  return { beginRecording };
}
