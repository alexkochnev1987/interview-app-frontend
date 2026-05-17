import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBrowserTranscript } from '@/lib/use-browser-transcript';
import { submitTakeAnswer, type TakeInterviewData } from '@/lib/api';
import { runMutation } from '@/lib/run-mutation';
import { TOAST_MESSAGES } from '@/lib/toast-messages';
import type { PermissionStatus, TakeStage } from '@/components/take/types';
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
  useTakeBehaviorTracking,
  useTakeBeginRecording,
  useTakeInterviewLoader,
  useTakePermissions,
  useTakeRecordingControls,
  type AnswerBehaviorEvent,
  type MultipartUploadState,
  type TakeBehaviorSignals,
  progressValueForStage,
  TAKE_MESSAGES,
  type VersionPersistKind,
  isLastInterviewQuestion,
} from '@/features/take';
import {
  useTakeQuestionTts,
  type QuestionSpeechSynthCapture,
} from '@/features/take/use-take-question-tts';
import { TAKE_RECORDING_LIMIT_SECONDS } from './utils';

type PendingVersionAction = 'submit' | 'rerecord' | null;

const PROGRESS_HEARTBEAT_MS = 3000;
const PROGRESS_DEBOUNCE_MS = 400;
const PROGRESS_EVENT_DEBOUNCE_MS = 2000;

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
    primeRecordingSession,
    pauseRecognitionForOutboundSynth,
    scheduleRecognitionResumeAfterSynthUtterance,
    discardOutboundSynthGuards,
    stop: stopBrowserTranscript,
    reset: resetBrowserTranscript,
    getSnapshot: getBrowserTranscriptSnapshot,
  } = useBrowserTranscript();

  const questionSpeechSynthCapture = useMemo<QuestionSpeechSynthCapture>(
    () => ({
      pauseRecognitionBeforeSpeak: pauseRecognitionForOutboundSynth,
      scheduleRecognitionResumeAfterSynthUtterance,
      discardOutboundSynthGuards,
    }),
    [
      pauseRecognitionForOutboundSynth,
      scheduleRecognitionResumeAfterSynthUtterance,
      discardOutboundSynthGuards,
    ],
  );

  const [stage, setStage] = useState<TakeStage>('loading');
  const [interview, setInterview] = useState<TakeInterviewData | null>(null);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TAKE_RECORDING_LIMIT_SECONDS);
  const [retakeCount, setRetakeCount] = useState(0);
  const [currentVersionNumber, setCurrentVersionNumber] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('idle');
  const [screenStatus, setScreenStatus] = useState<PermissionStatus>('idle');
  const [screenSurface, setScreenSurface] = useState('');
  const [setupBusy, setSetupBusy] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [versionPersistKind, setVersionPersistKind] = useState<VersionPersistKind | null>(null);
  const [recordingStartBusy, setRecordingStartBusy] = useState(false);
  const [lobbyMicOn, setLobbyMicOn] = useState(false);
  const [lobbyCameraOn, setLobbyCameraOn] = useState(false);

  const [interviewerPresence, questionSpeechRecordingAllowedRef] = useTakeQuestionTts(
    interview,
    stage,
    questionSpeechSynthCapture,
  );

  const stageRef = useRef<TakeStage>('loading');

  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
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
  const behaviorSignalsRef = useRef<TakeBehaviorSignals>(createEmptyBehaviorSignals());
  const behaviorEventsRef = useRef<AnswerBehaviorEvent[]>([]);
  const flushedBehaviorEventCountRef = useRef(0);
  const progressRequestChainRef = useRef(Promise.resolve());
  const pendingVersionActionRef = useRef<PendingVersionAction>(null);
  const persistInFlightRef = useRef(false);
  const multipartUploadsRef = useRef<MultipartUploadState>({ camera: null, screen: null });
  const beginRecordingRef = useRef<
    (nextVersionNumber: number, currentQuestionIndex: number) => Promise<void>
  >(async () => undefined);
  const requestVersionActionRef = useRef<(action: PendingVersionAction) => void>(() => undefined);
  const autoStartedQuestionKeyRef = useRef('');

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  function attachCameraPreview(stream: MediaStream) {
    cameraStreamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      void videoRef.current.play().catch(() => undefined);
    }
  }

  useEffect(() => {
    if (stage !== 'interview' && stage !== 'recording' && stage !== 'lobby') {
      return;
    }

    const cameraPreviewNode = videoRef.current;
    const cameraStream = cameraStreamRef.current;
    if (cameraPreviewNode && cameraStream) {
      if (cameraPreviewNode.srcObject !== cameraStream) {
        cameraPreviewNode.srcObject = cameraStream;
      }

      void cameraPreviewNode.play().catch(() => undefined);
    }

    const screenPreviewNode = screenVideoRef.current;
    const screenStream = screenStreamRef.current;
    if (screenPreviewNode && screenStream) {
      if (screenPreviewNode.srcObject !== screenStream) {
        screenPreviewNode.srcObject = screenStream;
      }

      void screenPreviewNode.play().catch(() => undefined);
    }
  }, [stage, recording]);

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
    setVersionPersistKind(null);
    autoStartedQuestionKeyRef.current = '';
    releaseCaptureStreams(cameraStreamRef, screenStreamRef, videoRef);
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
    setLobbyMicOn(false);
    setLobbyCameraOn(false);
    setStage('consent');
  }

  function handleScreenShareEnded(message: string) {
    if (stageRef.current === 'lobby') {
      stopMediaStream(screenStreamRef.current);
      screenStreamRef.current = null;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      setScreenStatus('denied');
      setScreenSurface('');
      setSetupError(message);
      return;
    }

    discardRecordingRef.current = true;
    pendingVersionActionRef.current = null;
    stopActiveRecorders();
    void abortMultipartUploads();
    clearRecordingArtifacts();
    setScreenStatus('denied');
    setScreenSurface('');
    setSetupBusy(false);
    setSetupError(message);
    setVersionPersistKind(null);
    autoStartedQuestionKeyRef.current = '';
    stopMediaStream(screenStreamRef.current);
    screenStreamRef.current = null;
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
    setStage('interview');
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
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = null;
        }
      }
      setStage(stageAfterInterviewLoad(data, mode));
    },
    onError: (message) => setError(message),
    onCleanup: () => {
      clearProgressTimers(timerRef, progressHeartbeatRef, progressFlushTimeoutRef);
      void abortMultipartUploads();
      releaseCaptureStreams(cameraStreamRef, screenStreamRef, videoRef);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
    },
  });

  const {
    restartFullInterviewCapture,
    prepareLobbyDevices,
    attachLobbyScreenShare,
    enterInterviewFromLobby,
  } = useTakePermissions({
    setSetupBusy,
    setSetupError,
    setCameraStatus,
    setScreenStatus,
    setScreenSurface,
    setStage,
    clearRecordingArtifacts,
    releaseCaptureStreams: () =>
      releaseCaptureStreams(cameraStreamRef, screenStreamRef, videoRef),
    attachCameraPreview,
    stopMediaStream,
    handleScreenShareEnded,
    getPermissionErrorMessage,
    screenStreamRef,
    cameraStreamRef,
    screenVideoRef,
  });

  const bootstrapLobbyMedia = useCallback(async (openedVia: 'mic' | 'camera') => {
    await prepareLobbyDevices();
    const stream = cameraStreamRef.current;
    if (!stream) return;

    const micOn = openedVia === 'mic';
    const camOn = openedVia === 'camera';

    stream.getAudioTracks().forEach((t) => {
      t.enabled = micOn;
    });
    stream.getVideoTracks().forEach((t) => {
      t.enabled = camOn;
    });

    setLobbyMicOn(micOn);
    setLobbyCameraOn(camOn);
  }, [prepareLobbyDevices]);

  const toggleLobbyMic = useCallback(async () => {
    if (setupBusy) return;
    const stream = cameraStreamRef.current;
    const hasLive = stream?.getTracks().some((t) => t.readyState === 'live');
    if (!hasLive) {
      await bootstrapLobbyMedia('mic');
      return;
    }
    const next = !lobbyMicOn;
    stream!.getAudioTracks().forEach((t) => {
      t.enabled = next;
    });
    setLobbyMicOn(next);
  }, [bootstrapLobbyMedia, lobbyMicOn, setupBusy]);

  const toggleLobbyCamera = useCallback(async () => {
    if (setupBusy) return;
    const stream = cameraStreamRef.current;
    const hasLive = stream?.getTracks().some((t) => t.readyState === 'live');
    if (!hasLive) {
      await bootstrapLobbyMedia('camera');
      return;
    }
    const next = !lobbyCameraOn;
    stream!.getVideoTracks().forEach((t) => {
      t.enabled = next;
    });
    setLobbyCameraOn(next);
  }, [bootstrapLobbyMedia, lobbyCameraOn, setupBusy]);

  const lobbyJoinReady = useMemo(
    () =>
      cameraStatus === 'granted' &&
      lobbyMicOn &&
      lobbyCameraOn &&
      screenStatus === 'granted' &&
      screenSurface === 'monitor' &&
      !setupError,
    [cameraStatus, lobbyCameraOn, lobbyMicOn, screenStatus, screenSurface, setupError],
  );

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
    progressEventDebounceMs: PROGRESS_EVENT_DEBOUNCE_MS,
    getBrowserTranscriptSnapshot,
  });

  async function persistCurrentVersion(action: Exclude<PendingVersionAction, null>) {
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
        throw new Error(TAKE_MESSAGES.shortRecordingSubmit);
      }

      const startNextRerecordVersion = async () => {
        const nextVersionNumber = currentVersionNumberRef.current + 1;
        setCurrentVersionNumber(nextVersionNumber);
        currentVersionNumberRef.current = nextVersionNumber;
        setRetakeCount(nextVersionNumber - 1);
        await beginRecording({
          nextVersionNumber,
          hasCurrentQuestion: Boolean(interview.currentQuestion),
          currentQuestionIndex: interview.currentQuestionIndex,
        });
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

        const transcriptSnapshot = await stopBrowserTranscript({ finalize: true, timeoutMs: 700 });
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
            successMessage: TOAST_MESSAGES.take.submitSuccess,
            showSuccessToast: showSubmitSuccessToast,
            errorMessage: TOAST_MESSAGES.take.submitError,
            getErrorMessage: () => 'Please review recording data and try again.',
          },
        );
      } else {
        await handleRerecord();
      }
    } catch (err) {
      await abortMultipartUploads();
      if (action !== 'submit') {
        setSubmitError(err instanceof Error ? err.message : TAKE_MESSAGES.uploadFailedFallback);
      }
      autoStartedQuestionKeyRef.current = '';
      setStage('interview');
    } finally {
      setVersionPersistKind(null);
      setUploading(false);
      persistInFlightRef.current = false;
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
      setSetupError(TAKE_MESSAGES.recordingStoppedWithoutAction);
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

  const clearVersionPersistKind = useCallback(() => setVersionPersistKind(null), []);

  const { requestVersionAction } = useTakeRecordingControls({
    uploading,
    recording,
    pendingVersionActionRef,
    answerStoppedAtMsRef,
    answerStartedAtMsRef,
    answerDurationSecondsRef,
    onEnterVersionPersist: setVersionPersistKind,
    setStage,
    scheduleProgressFlush,
    stopActiveRecorders,
  });

  const requestSubmitAction = () => {
    setSubmitError('');
    const activeCameraUpload = multipartUploadsRef.current.camera;
    const activeScreenUpload = multipartUploadsRef.current.screen;
    const currentQuestionIndex = interview?.currentQuestionIndex;

    const isUploadSessionSynced =
      currentQuestionIndex !== undefined &&
      activeCameraUpload?.questionIndex === currentQuestionIndex &&
      activeScreenUpload?.questionIndex === currentQuestionIndex;

    if (!isUploadSessionSynced) {
      setSubmitError(TAKE_MESSAGES.syncingInProgress);
      return;
    }

    requestVersionAction('submit');
  };

  useEffect(() => {
    requestVersionActionRef.current = requestVersionAction;
  }, [requestVersionAction]);

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
    clearVersionPersistKind,
    clearRecordingArtifacts,
    resetInterviewSetup,
    startMultipartUploadSession,
    flushAnswerProgress,
    startProgressHeartbeat,
    abortMultipartUploads,
    handleRecordedChunk,
    onRecordersStopped,
    primeBrowserTranscriptForRecordingSession: primeRecordingSession,
  });

  useEffect(() => {
    beginRecordingRef.current = async (nextVersionNumber: number, currentQuestionIndex: number) => {
      await beginRecording({
        nextVersionNumber,
        hasCurrentQuestion: true,
        currentQuestionIndex,
      });
    };
  }, [beginRecording]);

  const proceedToLobby = useCallback(() => {
    autoStartedQuestionKeyRef.current = '';
    setSetupError('');
    setLobbyMicOn(false);
    setLobbyCameraOn(false);
    setStage('lobby');
  }, []);

  const capturePipelineReady = Boolean(
    interview &&
      !setupError &&
      cameraStatus === 'granted' &&
      screenStatus === 'granted' &&
      screenSurface === 'monitor',
  );

  useEffect(() => {
    if (stage !== 'interview') return;
    if (!interview?.currentQuestion) return;
    if (recording || uploading || recordingStartBusy) return;
    if (!capturePipelineReady) return;
    if (setupError) return;
    if (!questionSpeechRecordingAllowedRef.current) return;

    const questionKey = `${interview.currentQuestionIndex}:${interview.currentAnswerMeta?.versionCount ?? 0}`;
    if (autoStartedQuestionKeyRef.current === questionKey) return;

    autoStartedQuestionKeyRef.current = questionKey;
    const nextVersionNumber = (interview.currentAnswerMeta?.versionCount ?? 0) + 1;

    setRecordingStartBusy(true);
    void (async () => {
      try {
        await beginRecordingRef.current(nextVersionNumber, interview.currentQuestionIndex);
      } finally {
        setRecordingStartBusy(false);
      }
    })();
  }, [
    stage,
    setupError,
    interview?.currentQuestion,
    interview?.currentQuestionIndex,
    interview?.currentAnswerMeta?.versionCount,
    recording,
    uploading,
    recordingStartBusy,
    capturePipelineReady,
    interviewerPresence,
    questionSpeechRecordingAllowedRef,
  ]);

  const startInterviewFromLobby = useCallback(() => {
    if (!enterInterviewFromLobby()) return;
  }, [enterInterviewFromLobby]);

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
    submitError,
    versionPersistKind,
    videoRef,
    screenVideoRef,
    isBrowserTranscriptSupported,
    finalTranscript,
    interimTranscript,
    browserTranscriptWarning,
    setConsent,
    proceedToLobby,
    restartFullInterviewCapture,
    prepareLobbyDevices,
    attachLobbyScreenShare,
    enterInterviewFromLobby,
    startInterviewFromLobby,
    toggleLobbyMic,
    toggleLobbyCamera,
    lobbyMicOn,
    lobbyCameraOn,
    lobbyJoinReady,
    recordingStartBusy,
    capturePipelineReady,
    requestVersionAction: (action: PendingVersionAction) => {
      if (action === 'submit') {
        requestSubmitAction();
        return;
      }
      setSubmitError('');
      requestVersionAction(action);
    },
    permissionLabel,
    permissionTone,
    formatTime,
    interviewerPresence,
    progressValue:
      interview ? progressValueForStage({ interview, stage }) : 0,
  };
}
