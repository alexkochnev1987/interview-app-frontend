import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useBrowserTranscript } from '@/lib/use-browser-transcript';
import { type TakeInterviewData } from '@/lib/api';
import type { PermissionStatus, TakeStage } from '@/components/take/types';
import type { TakeMessageGetter } from './messages';
import { progressValueForStage, stageAfterInterviewLoad, type VersionPersistKind } from './session-machine';
import {
  clearProgressTimers,
  releaseAllInterviewCaptures,
  releaseCameraCapture,
  releaseScreenCapture,
  stopActiveTakeMediaRecorders,
  stopMediaStream,
  type AnswerBehaviorEvent,
  type MultipartUploadState,
} from './runtime';
import {
  createEmptyBehaviorSignals,
  formatTime,
  getPermissionErrorMessage,
  permissionLabel,
  permissionTone,
  TAKE_RECORDING_LIMIT_SECONDS,
  type TakeBehaviorSignals,
} from './utils';
import { useTakeAnswerPersistence } from './use-take-answer-persistence';
import { useTakeBehaviorTracking } from './use-take-behavior-tracking';
import { useTakeBeginRecording } from './use-take-begin-recording';
import { useTakeCandidateSession } from './use-take-candidate-session';
import { useTakeInterviewLoader } from './use-take-interview-loader';
import { useTakePermissions } from './use-take-permissions';
import { useTakeRecordingControls } from './use-take-recording-controls';
import { useTakeVersionPersistence } from './use-take-version-persistence';
import {
  useTakeQuestionTts,
  type QuestionSpeechSynthCapture,
} from './use-take-question-tts';
import type { Locale } from '@/i18n/locales';

type PendingVersionAction = 'submit' | 'rerecord' | null;

const PROGRESS_HEARTBEAT_MS = 3000;
const PROGRESS_DEBOUNCE_MS = 400;
const PROGRESS_EVENT_DEBOUNCE_MS = 2000;

const PREVIEW_STAGES = new Set<TakeStage>(['interview', 'recording', 'lobby']);

interface UseTakeOrchestratorParams {
  id: string;
  candidateToken: string;
  initialInterview?: TakeInterviewData;
  contentLocale: Locale;
  takeMessage: TakeMessageGetter;
}

function syncVideoPreview(node: HTMLVideoElement | null, stream: MediaStream | null) {
  if (!node || !stream) {
    return;
  }

  if (node.srcObject !== stream) {
    node.srcObject = stream;
  }

  void node.play().catch(() => undefined);
}

function setStreamTracksEnabled(stream: MediaStream, kind: 'audio' | 'video', enabled: boolean) {
  const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
  tracks.forEach((track) => {
    track.enabled = enabled;
  });
}

export function useTakeOrchestrator({
  id,
  candidateToken,
  initialInterview,
  contentLocale,
  takeMessage,
}: UseTakeOrchestratorParams) {
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

  const [stage, setStage] = useState<TakeStage>(() =>
    initialInterview
      ? stageAfterInterviewLoad(initialInterview, 'initial')
      : 'loading',
  );
  const [interview, setInterview] = useState<TakeInterviewData | null>(
    initialInterview ?? null,
  );
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
  const {
    candidateSessionReady,
    sessionSyncError,
    retrySessionSync,
  } = useTakeCandidateSession({
    interviewId: id,
    candidateToken,
    sessionReady: !candidateToken || Boolean(initialInterview),
    takeMessage,
  });

  const [interviewerPresence, questionSpeechRecordingAllowedRef] = useTakeQuestionTts(
    interview,
    stage,
    questionSpeechSynthCapture,
  );

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
  const expectedRecorderStopsRef = useRef(0);
  const currentVersionNumberRef = useRef(1);
  const behaviorSignalsRef = useRef<TakeBehaviorSignals>(createEmptyBehaviorSignals());
  const behaviorEventsRef = useRef<AnswerBehaviorEvent[]>([]);
  const flushedBehaviorEventCountRef = useRef(0);
  const progressRequestChainRef = useRef(Promise.resolve());
  const pendingVersionActionRef = useRef<PendingVersionAction>(null);
  const multipartUploadsRef = useRef<MultipartUploadState>({ camera: null, screen: null });
  const beginRecordingRef = useRef<
    (nextVersionNumber: number, currentQuestionIndex: number) => Promise<void>
  >(async () => undefined);
  const requestVersionActionRef = useRef<(action: PendingVersionAction) => void>(() => undefined);
  const autoStartedQuestionKeyRef = useRef('');
  const recordingRef = useRef(recording);
  const uploadingRef = useRef(uploading);
  const recordingStartBusyRef = useRef(recordingStartBusy);
  const stageRef = useRef(stage);

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  useEffect(() => {
    uploadingRef.current = uploading;
  }, [uploading]);

  useEffect(() => {
    recordingStartBusyRef.current = recordingStartBusy;
  }, [recordingStartBusy]);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  function isLocaleQuestionMutationBlocked(): boolean {
    return (
      uploadingRef.current ||
      recordingRef.current ||
      recordingStartBusyRef.current ||
      stageRef.current === 'transition'
    );
  }

  function attachCameraPreview(stream: MediaStream) {
    cameraStreamRef.current = stream;
    syncVideoPreview(videoRef.current, stream);
  }

  function releaseAllCaptures() {
    releaseAllInterviewCaptures(cameraStreamRef, screenStreamRef, videoRef, screenVideoRef);
  }

  function resetLobbyControls() {
    setLobbyMicOn(false);
    setLobbyCameraOn(false);
  }

  const clearRecordingArtifacts = useCallback(() => {
    clearProgressTimers(timerRef, progressHeartbeatRef, progressFlushTimeoutRef);
    answerStartedAtRef.current = null;
    answerStartedAtMsRef.current = null;
    answerStoppedAtMsRef.current = null;
    answerDurationSecondsRef.current = 0;
    stoppedRecordersRef.current = 0;
    expectedRecorderStopsRef.current = 0;
    behaviorSignalsRef.current = createEmptyBehaviorSignals();
    behaviorEventsRef.current = [];
    flushedBehaviorEventCountRef.current = 0;
    progressRequestChainRef.current = Promise.resolve();
    multipartUploadsRef.current = { camera: null, screen: null };
    resetBrowserTranscript();
  }, [resetBrowserTranscript]);

  useEffect(() => {
    if (!PREVIEW_STAGES.has(stage)) {
      return;
    }

    syncVideoPreview(videoRef.current, cameraStreamRef.current);
    syncVideoPreview(screenVideoRef.current, screenStreamRef.current);
  }, [stage, recording]);

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

  const { loadInterview } = useTakeInterviewLoader({
    id,
    candidateToken,
    skipInitialLoad: Boolean(initialInterview),
    contentLocale,
    onData: (data, mode) => {
      setError('');
      if (mode === 'locale') {
        if (isLocaleQuestionMutationBlocked()) {
          return;
        }
        setInterview((previous) =>
          previous ? { ...previous, currentQuestion: data.currentQuestion } : data,
        );
        return;
      }

      setInterview(data);
      if (data.completed) {
        releaseAllCaptures();
      }
      setStage(stageAfterInterviewLoad(data, mode));
    },
    onError: setError,
    onCleanup: () => {
      clearProgressTimers(timerRef, progressHeartbeatRef, progressFlushTimeoutRef);
      void abortMultipartUploads();
      releaseAllCaptures();
    },
    takeMessage,
  });

  const prevContentLocaleRef = useRef<Locale | null>(null);
  useEffect(() => {
    const previousLocale = prevContentLocaleRef.current;
    prevContentLocaleRef.current = contentLocale;

    if (previousLocale !== null && previousLocale !== contentLocale) {
      if (isLocaleQuestionMutationBlocked()) {
        return;
      }
      void loadInterview('locale', undefined, contentLocale);
    }
  }, [contentLocale, loadInterview]);

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
    releaseCaptureStreams: releaseAllCaptures,
    releaseLobbyCameraOnly: () => releaseCameraCapture(cameraStreamRef, videoRef),
    attachCameraPreview,
    stopMediaStream,
    getPermissionErrorMessage: (error, requiresEntireScreen) =>
      getPermissionErrorMessage(error, requiresEntireScreen, takeMessage),
    screenStreamRef,
    cameraStreamRef,
    screenVideoRef,
    takeMessage,
  });

  async function bootstrapLobbyMedia(openedVia: 'mic' | 'camera') {
    await prepareLobbyDevices();
    const stream = cameraStreamRef.current;
    if (!stream) {
      return;
    }

    const micOn = openedVia === 'mic';
    const camOn = openedVia === 'camera';
    setStreamTracksEnabled(stream, 'audio', micOn);
    setStreamTracksEnabled(stream, 'video', camOn);
    setLobbyMicOn(micOn);
    setLobbyCameraOn(camOn);
  }

  async function toggleLobbyMic() {
    if (setupBusy) {
      return;
    }

    const stream = cameraStreamRef.current;
    const hasLiveStream = stream?.getTracks().some((track) => track.readyState === 'live');
    if (!stream || !hasLiveStream) {
      await bootstrapLobbyMedia('mic');
      return;
    }

    const nextMicOn = !lobbyMicOn;
    setStreamTracksEnabled(stream, 'audio', nextMicOn);
    setLobbyMicOn(nextMicOn);
  }

  async function toggleLobbyCamera() {
    if (setupBusy) {
      return;
    }

    const stream = cameraStreamRef.current;
    const hasLiveStream = stream?.getTracks().some((track) => track.readyState === 'live');
    if (!stream || !hasLiveStream) {
      await bootstrapLobbyMedia('camera');
      return;
    }

    const nextCameraOn = !lobbyCameraOn;
    setStreamTracksEnabled(stream, 'video', nextCameraOn);
    setLobbyCameraOn(nextCameraOn);
  }

  const lobbyJoinReady =
    candidateSessionReady &&
    cameraStatus === 'granted' &&
    lobbyMicOn &&
    lobbyCameraOn &&
    screenStatus === 'granted' &&
    screenSurface === 'monitor' &&
    !setupError;

  const { persistCurrentVersion } = useTakeVersionPersistence({
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
    finalizeTranscriptForSubmit: () =>
      stopBrowserTranscript({ finalize: true, timeoutMs: 700 }),
    loadInterview,
    clearRecordingArtifacts,
    invokeBeginRecording: (nextVersionNumber, currentQuestionIndex) =>
      beginRecordingRef.current(nextVersionNumber, currentQuestionIndex),
    takeMessage,
  });

  const onRecordersStopped = useCallback(() => {
    const shouldDiscard = discardRecordingRef.current;
    discardRecordingRef.current = false;
    if (shouldDiscard) {
      clearRecordingArtifacts();
      return;
    }

    const pendingAction = pendingVersionActionRef.current;
    if (!pendingAction) {
      clearRecordingArtifacts();
      setSetupError(takeMessage('recordingStoppedWithoutAction'));
      setStage('interview');
      return;
    }

    void persistCurrentVersion(pendingAction);
  }, [clearRecordingArtifacts, persistCurrentVersion, takeMessage]);

  const stopActiveRecorders = useCallback(() => {
    clearProgressTimers(timerRef, progressHeartbeatRef, progressFlushTimeoutRef);
    stoppedRecordersRef.current = 0;
    expectedRecorderStopsRef.current = stopActiveTakeMediaRecorders(
      cameraRecorderRef,
      screenRecorderRef,
    );
    if (expectedRecorderStopsRef.current === 0) {
      onRecordersStopped();
    }
    setRecording(false);
  }, [onRecordersStopped]);

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
    releaseAllCaptures();
    resetLobbyControls();
    setStage('consent');
  }

  useLayoutEffect(() => {
    const stream = screenStreamRef.current;
    const screenTrack = stream?.getVideoTracks()[0];
    if (!screenTrack || screenTrack.readyState !== 'live') {
      return undefined;
    }

    const onEnded = () => {
      if (stage === 'lobby') {
        releaseScreenCapture(screenStreamRef, screenVideoRef);
        setScreenStatus('denied');
        setScreenSurface('');
        setSetupError(takeMessage('screenShareStopped'));
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
      setSetupError(takeMessage('screenShareStopped'));
      setVersionPersistKind(null);
      autoStartedQuestionKeyRef.current = '';
      releaseScreenCapture(screenStreamRef, screenVideoRef);
      setStage('interview');
    };

    screenTrack.onended = onEnded;

    return () => {
      if (screenTrack.onended === onEnded) {
        screenTrack.onended = null;
      }
    };
  }, [stage, abortMultipartUploads, clearRecordingArtifacts, stopActiveRecorders, takeMessage]);

  useTakeBehaviorTracking({
    recording,
    currentVersionNumberRef,
    behaviorSignalsRef,
    behaviorEventsRef,
    scheduleProgressFlush: () => scheduleProgressFlush('event'),
  });

  const { requestVersionAction: baseRequestVersionAction } = useTakeRecordingControls({
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

  function requestSubmitAction() {
    setSubmitError('');
    const activeCameraUpload = multipartUploadsRef.current.camera;
    const activeScreenUpload = multipartUploadsRef.current.screen;
    const currentQuestionIndex = interview?.currentQuestionIndex;

    const isUploadSessionSynced =
      currentQuestionIndex !== undefined &&
      activeCameraUpload?.questionIndex === currentQuestionIndex &&
      activeScreenUpload?.questionIndex === currentQuestionIndex;

    if (!isUploadSessionSynced) {
      setSubmitError(takeMessage('syncingInProgress'));
      return;
    }

    baseRequestVersionAction('submit');
  }

  function requestVersionAction(action: PendingVersionAction) {
    if (action === 'submit') {
      requestSubmitAction();
      return;
    }
    setSubmitError('');
    baseRequestVersionAction(action);
  }

  const { beginRecording } = useTakeBeginRecording({
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
    clearVersionPersistKind: () => setVersionPersistKind(null),
    clearRecordingArtifacts,
    resetInterviewSetup,
    startMultipartUploadSession,
    flushAnswerProgress,
    startProgressHeartbeat,
    abortMultipartUploads,
    handleRecordedChunk,
    onRecordersStopped,
    primeBrowserTranscriptForRecordingSession: primeRecordingSession,
    takeMessage,
  });

  useEffect(() => {
    requestVersionActionRef.current = requestVersionAction;
  });

  useEffect(() => {
    beginRecordingRef.current = async (nextVersionNumber, currentQuestionIndex) => {
      await beginRecording({
        nextVersionNumber,
        hasCurrentQuestion: true,
        currentQuestionIndex,
      });
    };
  }, [beginRecording]);

  function proceedToLobby() {
    autoStartedQuestionKeyRef.current = '';
    setSetupError('');
    resetLobbyControls();
    setStage('lobby');
  }

  const capturePipelineReady = Boolean(
    interview &&
      candidateSessionReady &&
      !setupError &&
      cameraStatus === 'granted' &&
      screenStatus === 'granted' &&
      screenSurface === 'monitor',
  );

  useEffect(() => {
    if (stage !== 'interview') {
      return;
    }
    if (!interview?.currentQuestion) {
      return;
    }
    if (recording || uploading || recordingStartBusy) {
      return;
    }
    if (!capturePipelineReady || setupError) {
      return;
    }
    if (!candidateSessionReady) {
      return;
    }
    if (!questionSpeechRecordingAllowedRef.current) {
      return;
    }

    const questionKey = `${interview.currentQuestionIndex}:${interview.currentAnswerMeta?.versionCount ?? 0}`;
    if (autoStartedQuestionKeyRef.current === questionKey) {
      return;
    }

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
    candidateSessionReady,
    interviewerPresence,
    questionSpeechRecordingAllowedRef,
    takeMessage,
  ]);

  const localeSwitchDisabled =
    uploading ||
    recording ||
    recordingStartBusy ||
    stage === 'transition' ||
    interviewerPresence === 'speaking';

  return {
    stage,
    interview,
    error,
    localeSwitchDisabled,
    candidateSessionReady,
    sessionSyncError,
    retrySessionSync,
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
    startInterviewFromLobby: enterInterviewFromLobby,
    toggleLobbyMic,
    toggleLobbyCamera,
    lobbyMicOn,
    lobbyCameraOn,
    lobbyJoinReady,
    recordingStartBusy,
    capturePipelineReady,
    requestVersionAction,
    permissionLabel: (status: PermissionStatus) => permissionLabel(status, takeMessage),
    permissionTone,
    formatTime,
    interviewerPresence,
    progressValue: interview ? progressValueForStage({ interview, stage }) : 0,
    loadInterview,
  };
}
