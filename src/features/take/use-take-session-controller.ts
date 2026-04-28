import { useRef, useState } from 'react';

import {
  clearProgressTimers,
  createEmptyBehaviorSignals,
  type AnswerBehaviorEvent,
  type MultipartUploadState,
} from './runtime';
import type { TakePermissionStatus, TakeBehaviorSignals } from './utils';
import type { TakeInterviewData } from '@/lib/api';

export type TakeStage = 'loading' | 'consent' | 'interview' | 'recording' | 'transition' | 'complete';
export type PendingVersionAction = 'submit' | 'rerecord' | null;

interface UseTakeSessionControllerResult {
  stage: TakeStage;
  setStage: (value: TakeStage) => void;
  interview: TakeInterviewData | null;
  setInterview: (value: TakeInterviewData | null) => void;
  error: string;
  setError: (value: string) => void;
  consent: boolean;
  setConsent: (value: boolean) => void;
  recording: boolean;
  setRecording: (value: boolean) => void;
  timeLeft: number;
  setTimeLeft: (value: number) => void;
  retakeCount: number;
  setRetakeCount: (value: number) => void;
  currentVersionNumber: number;
  setCurrentVersionNumber: (value: number) => void;
  uploading: boolean;
  setUploading: (value: boolean) => void;
  cameraStatus: TakePermissionStatus;
  setCameraStatus: (value: TakePermissionStatus) => void;
  screenStatus: TakePermissionStatus;
  setScreenStatus: (value: TakePermissionStatus) => void;
  screenSurface: string;
  setScreenSurface: (value: string) => void;
  setupBusy: boolean;
  setSetupBusy: (value: boolean) => void;
  setupError: string;
  setSetupError: (value: string) => void;
  transitionLabel: string;
  setTransitionLabel: (value: string) => void;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  cameraRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  screenRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  progressHeartbeatRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  progressFlushTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  cameraStreamRef: React.MutableRefObject<MediaStream | null>;
  screenStreamRef: React.MutableRefObject<MediaStream | null>;
  discardRecordingRef: React.MutableRefObject<boolean>;
  answerStartedAtRef: React.MutableRefObject<string | null>;
  answerStartedAtMsRef: React.MutableRefObject<number | null>;
  answerStoppedAtMsRef: React.MutableRefObject<number | null>;
  answerDurationSecondsRef: React.MutableRefObject<number>;
  stoppedRecordersRef: React.MutableRefObject<number>;
  currentVersionNumberRef: React.MutableRefObject<number>;
  behaviorSignalsRef: React.MutableRefObject<TakeBehaviorSignals>;
  behaviorEventsRef: React.MutableRefObject<AnswerBehaviorEvent[]>;
  flushedBehaviorEventCountRef: React.MutableRefObject<number>;
  progressRequestChainRef: React.MutableRefObject<Promise<void>>;
  pendingVersionActionRef: React.MutableRefObject<PendingVersionAction>;
  multipartUploadsRef: React.MutableRefObject<MultipartUploadState>;
  beginRecordingRef: React.MutableRefObject<(nextVersionNumber: number) => Promise<void>>;
  autoStartedQuestionKeyRef: React.MutableRefObject<string>;
  attachCameraPreview: (stream: MediaStream) => void;
  clearRecordingArtifacts: () => void;
  stopActiveRecorders: () => void;
}

export function useTakeSessionController(): UseTakeSessionControllerResult {
  const [stage, setStage] = useState<TakeStage>('loading');
  const [interview, setInterview] = useState<TakeInterviewData | null>(null);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(240);
  const [retakeCount, setRetakeCount] = useState(0);
  const [currentVersionNumber, setCurrentVersionNumber] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<TakePermissionStatus>('idle');
  const [screenStatus, setScreenStatus] = useState<TakePermissionStatus>('idle');
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
  const answerDurationSecondsRef = useRef(0);
  const stoppedRecordersRef = useRef(0);
  const currentVersionNumberRef = useRef(1);
  const behaviorSignalsRef = useRef<TakeBehaviorSignals>(createEmptyBehaviorSignals());
  const behaviorEventsRef = useRef<AnswerBehaviorEvent[]>([]);
  const flushedBehaviorEventCountRef = useRef(0);
  const progressRequestChainRef = useRef(Promise.resolve());
  const pendingVersionActionRef = useRef<PendingVersionAction>(null);
  const multipartUploadsRef = useRef<MultipartUploadState>({
    camera: null,
    screen: null,
  });
  const beginRecordingRef = useRef<(nextVersionNumber: number) => Promise<void>>(async () => undefined);
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
    multipartUploadsRef.current = {
      camera: null,
      screen: null,
    };
  }

  function stopActiveRecorders() {
    clearProgressTimers(timerRef, progressHeartbeatRef, progressFlushTimeoutRef);

    if (cameraRecorderRef.current?.state === 'recording') {
      cameraRecorderRef.current.stop();
    }
    if (screenRecorderRef.current?.state === 'recording') {
      screenRecorderRef.current.stop();
    }

    setRecording(false);
  }

  return {
    stage,
    setStage,
    interview,
    setInterview,
    error,
    setError,
    consent,
    setConsent,
    recording,
    setRecording,
    timeLeft,
    setTimeLeft,
    retakeCount,
    setRetakeCount,
    currentVersionNumber,
    setCurrentVersionNumber,
    uploading,
    setUploading,
    cameraStatus,
    setCameraStatus,
    screenStatus,
    setScreenStatus,
    screenSurface,
    setScreenSurface,
    setupBusy,
    setSetupBusy,
    setupError,
    setSetupError,
    transitionLabel,
    setTransitionLabel,
    videoRef,
    cameraRecorderRef,
    screenRecorderRef,
    timerRef,
    progressHeartbeatRef,
    progressFlushTimeoutRef,
    cameraStreamRef,
    screenStreamRef,
    discardRecordingRef,
    answerStartedAtRef,
    answerStartedAtMsRef,
    answerStoppedAtMsRef,
    answerDurationSecondsRef,
    stoppedRecordersRef,
    currentVersionNumberRef,
    behaviorSignalsRef,
    behaviorEventsRef,
    flushedBehaviorEventCountRef,
    progressRequestChainRef,
    pendingVersionActionRef,
    multipartUploadsRef,
    beginRecordingRef,
    autoStartedQuestionKeyRef,
    attachCameraPreview,
    clearRecordingArtifacts,
    stopActiveRecorders,
  };
}
