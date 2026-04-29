import { useRef, useState } from 'react';

import { useBrowserTranscript } from '@/lib/use-browser-transcript';
import { submitTakeAnswer, type TakeInterviewData } from '@/lib/api';
import type { PermissionStatus } from '@/components/take/types';
import {
  clearProgressTimers,
  createEmptyBehaviorSignals,
  formatTime,
  getMultipartSession,
  getPermissionErrorMessage,
  permissionTone,
  permissionLabel,
  releaseCaptureStreams,
  stageAfterInterviewLoad,
  stopMediaStream,
  useTakeAnswerPersistence,
  useTakeAutoStartRecording,
  useTakeBehaviorTracking,
  useTakeBeginRecording,
  useTakeInterviewLoader,
  useTakePermissions,
  useTakeRecordingControls,
  type AnswerBehaviorEvent,
  type MultipartUploadState,
  type Stage,
  type TakeBehaviorSignals,
  progressValueForStage,
} from '@/features/take';

type PendingVersionAction = 'submit' | 'rerecord' | null;
type AnswerBehaviorSignals = TakeBehaviorSignals;

const PROGRESS_HEARTBEAT_MS = 3000;
const PROGRESS_DEBOUNCE_MS = 400;

interface UseTakeOrchestratorParams {
  id: string;
  candidateToken: string;
}

export function useTakeOrchestrator({ id, candidateToken }: UseTakeOrchestratorParams) {
  const {
    isSupported: isBrowserTranscriptSupported,
    interimTranscript,
    finalTranscript,
    warning: browserTranscriptWarning,
    start: startBrowserTranscript,
    stop: stopBrowserTranscript,
    reset: resetBrowserTranscript,
    getSnapshot: getBrowserTranscriptSnapshot,
  } = useBrowserTranscript();

  const [stage, setStage] = useState<Stage>('loading');
  const [interview, setInterview] = useState<TakeInterviewData | null>(null);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(240);
  const [retakeCount, setRetakeCount] = useState(0);
  const [currentVersionNumber, setCurrentVersionNumber] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('idle');
  const [screenStatus, setScreenStatus] = useState<PermissionStatus>('idle');
  const [screenSurface, setScreenSurface] = useState('');
  const [setupBusy, setSetupBusy] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [transitionLabel, setTransitionLabel] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRecorderRef = useRef<MediaRecorder | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressHeartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressFlushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const discardRecordingRef = useRef(false);
  const answerStartedAtRef = useRef<string | null>(null);
  const answerStartedAtMsRef = useRef<number | null>(null);
  const answerStoppedAtMsRef = useRef<number | null>(null);
  const answerDurationSecondsRef = useRef<number>(0);
  const stoppedRecordersRef = useRef(0);
  const currentVersionNumberRef = useRef(1);
  const behaviorSignalsRef = useRef<AnswerBehaviorSignals>(createEmptyBehaviorSignals());
  const behaviorEventsRef = useRef<AnswerBehaviorEvent[]>([]);
  const flushedBehaviorEventCountRef = useRef(0);
  const progressRequestChainRef = useRef(Promise.resolve());
  const pendingVersionActionRef = useRef<PendingVersionAction>(null);
  const multipartUploadsRef = useRef<MultipartUploadState>({ camera: null, screen: null });
  const beginRecordingRef = useRef<(nextVersionNumber: number) => Promise<void>>(async () => undefined);
  const requestVersionActionRef = useRef<(action: PendingVersionAction) => void>(() => undefined);
  const autoStartedQuestionKeyRef = useRef('');

  function attachCameraPreview(stream: MediaStream) {
    cameraStreamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      void videoRef.current.play().catch(() => undefined);
    }
  }

  function clearRecordingArtifacts() {
    clearProgressTimers(timerRef, progressHeartbeatRef, progressFlushTimeoutRef);
    answerStartedAtRef.current = null;
    answerStartedAtMsRef.current = null;
    answerStoppedAtMsRef.current = null;
    answerDurationSecondsRef.current = 0;
    stoppedRecordersRef.current = 0;
    behaviorSignalsRef.current = createEmptyBehaviorSignals();
    behaviorEventsRef.current = [];
    flushedBehaviorEventCountRef.current = 0;
    progressRequestChainRef.current = Promise.resolve();
    multipartUploadsRef.current = { camera: null, screen: null };
    resetBrowserTranscript();
  }

  function stopActiveRecorders() {
    clearProgressTimers(timerRef, progressHeartbeatRef, progressFlushTimeoutRef);
    if (cameraRecorderRef.current?.state === 'recording') cameraRecorderRef.current.stop();
    if (screenRecorderRef.current?.state === 'recording') screenRecorderRef.current.stop();
    setRecording(false);
  }

  function resetInterviewSetup(message: string) {
    discardRecordingRef.current = true;
    pendingVersionActionRef.current = null;
    stopActiveRecorders();
    void abortMultipartUploads();
    clearRecordingArtifacts();
    setCameraStatus('idle');
    setScreenStatus('denied');
    setScreenSurface('');
    setSetupBusy(false);
    setSetupError(message);
    setTransitionLabel('');
    autoStartedQuestionKeyRef.current = '';
    releaseCaptureStreams(cameraStreamRef, screenStreamRef, videoRef);
    setStage('consent');
  }

  const { loadInterview } = useTakeInterviewLoader({
    id,
    candidateToken,
    onData: (data, mode, tokenOverride) => {
      setInterview(data);
      if (mode === 'initial' && tokenOverride && typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/take/${id}`);
      }
      if (data.completed) {
        releaseCaptureStreams(cameraStreamRef, screenStreamRef, videoRef);
      }
      setStage(stageAfterInterviewLoad(data, mode));
    },
    onError: (message) => setError(message),
    onCleanup: () => {
      clearProgressTimers(timerRef, progressHeartbeatRef, progressFlushTimeoutRef);
      void abortMultipartUploads();
      releaseCaptureStreams(cameraStreamRef, screenStreamRef, videoRef);
    },
  });

  const { handleStartInterview } = useTakePermissions({
    setSetupBusy,
    setSetupError,
    setCameraStatus,
    setScreenStatus,
    setScreenSurface,
    setStage,
    clearRecordingArtifacts,
    releaseCaptureStreams: () => releaseCaptureStreams(cameraStreamRef, screenStreamRef, videoRef),
    attachCameraPreview,
    stopMediaStream,
    resetInterviewSetup,
    getPermissionErrorMessage,
    screenStreamRef,
  });

  const {
    startMultipartUploadSession,
    flushAnswerProgress,
    enqueueProgressFlush,
    scheduleProgressFlush,
    startProgressHeartbeat,
    queueBufferedUpload,
    handleRecordedChunk,
    completeMultipartUpload,
    abortMultipartUploads,
  } = useTakeAnswerPersistence({
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
    progressHeartbeatMs: PROGRESS_HEARTBEAT_MS,
    progressDebounceMs: PROGRESS_DEBOUNCE_MS,
    getBrowserTranscriptSnapshot,
  });

  async function persistCurrentVersion(action: Exclude<PendingVersionAction, null>) {
    if (!interview) return;
    setUploading(true);
    try {
      await enqueueProgressFlush(true);
      await Promise.all([queueBufferedUpload('camera', true), queueBufferedUpload('screen', true)]);
      await Promise.all([completeMultipartUpload('camera'), completeMultipartUpload('screen')]);

      const cameraUpload = getMultipartSession(multipartUploadsRef.current, 'camera');
      const screenUpload = getMultipartSession(multipartUploadsRef.current, 'screen');
      const transcriptSnapshot =
        action === 'submit' ? await stopBrowserTranscript({ finalize: true, timeoutMs: 700 }) : null;

      await submitTakeAnswer(id, {
        questionIndex: interview.currentQuestionIndex,
        versionNumber: currentVersionNumberRef.current,
        submitAnswer: action === 'submit',
        mediaKey: cameraUpload.mediaKey,
        screenMediaKey: screenUpload.mediaKey,
        durationSeconds: answerDurationSecondsRef.current || 1,
        startedAt: answerStartedAtRef.current ?? new Date(Date.now() - 1000).toISOString(),
        submittedAt: new Date().toISOString(),
        cameraFileSizeBytes: cameraUpload.recordedBytes,
        screenFileSizeBytes: screenUpload.recordedBytes,
        behaviorSignals: behaviorSignalsRef.current,
        behaviorEvents: behaviorEventsRef.current,
        ...(transcriptSnapshot?.text.trim()
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

      if (action === 'submit') {
        setCurrentVersionNumber(1);
        currentVersionNumberRef.current = 1;
        setRetakeCount(0);
        await loadInterview('resume');
      } else {
        const nextVersionNumber = currentVersionNumberRef.current + 1;
        setCurrentVersionNumber(nextVersionNumber);
        currentVersionNumberRef.current = nextVersionNumber;
        setRetakeCount(nextVersionNumber - 1);
        await beginRecording({
          nextVersionNumber,
          hasCurrentQuestion: Boolean(interview.currentQuestion),
          currentQuestionIndex: interview.currentQuestionIndex,
        });
      }
    } catch (err) {
      await abortMultipartUploads();
      setSetupError(err instanceof Error ? err.message : 'Upload failed');
      autoStartedQuestionKeyRef.current = '';
      setStage('interview');
    } finally {
      setTransitionLabel('');
      setUploading(false);
    }
  }

  function onRecordersStopped() {
    const shouldDiscard = discardRecordingRef.current;
    discardRecordingRef.current = false;
    if (shouldDiscard) {
      clearRecordingArtifacts();
      return;
    }
    const pendingAction = pendingVersionActionRef.current;
    if (!pendingAction) {
      clearRecordingArtifacts();
      setSetupError('Recording stopped without a follow-up action. Start a new version for this answer.');
      setStage('interview');
      return;
    }
    void persistCurrentVersion(pendingAction);
  }

  useTakeBehaviorTracking({
    recording,
    currentVersionNumberRef,
    behaviorSignalsRef,
    behaviorEventsRef,
    scheduleProgressFlush: () => scheduleProgressFlush('event'),
  });

  useTakeAutoStartRecording({
    stage,
    recording,
    uploading,
    interview,
    cameraStatus,
    screenStatus,
    screenSurface,
    autoStartedQuestionKeyRef,
    beginRecordingRef,
  });

  const { requestVersionAction } = useTakeRecordingControls({
    uploading,
    recording,
    pendingVersionActionRef,
    answerStoppedAtMsRef,
    answerStartedAtMsRef,
    answerDurationSecondsRef,
    setTransitionLabel,
    setStage,
    scheduleProgressFlush,
    stopActiveRecorders,
  });
  requestVersionActionRef.current = requestVersionAction;

  const { beginRecording } = useTakeBeginRecording({
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
  });

  beginRecordingRef.current = async (nextVersionNumber: number) => {
    await beginRecording({
      nextVersionNumber,
      hasCurrentQuestion: Boolean(interview?.currentQuestion),
      currentQuestionIndex: interview?.currentQuestionIndex ?? 0,
    });
  };

  return {
    stage,
    interview,
    error,
    consent,
    recording,
    timeLeft,
    retakeCount,
    currentVersionNumber,
    uploading,
    cameraStatus,
    screenStatus,
    screenSurface,
    setupBusy,
    setupError,
    transitionLabel,
    videoRef,
    isBrowserTranscriptSupported,
    finalTranscript,
    interimTranscript,
    browserTranscriptWarning,
    setConsent,
    handleStartInterview,
    requestVersionAction,
    permissionLabel,
    permissionTone,
    formatTime,
    progressValue:
      interview ? progressValueForStage({ interview, stage }) : 0,
  };
}
