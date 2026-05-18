import type { TakeBehaviorSignals } from './utils';
import type { ClientTranscriptPayload } from '@/lib/api';

export type CaptureTarget = 'camera' | 'screen';

export interface AnswerBehaviorEvent {
  eventType: 'tab_hidden' | 'window_blur' | 'copy' | 'paste' | 'keydown' | 'resize';
  occurredAt: string;
  versionNumber: number;
}

export interface MultipartUploadSession {
  questionIndex: number;
  mediaKey: string;
  uploadId: string;
  partBlobType?: string;
  nextPartNumber: number;
  uploadedPartCount: number;
  bufferedChunks: Blob[];
  bufferedBytes: number;
  recordedBytes: number;
  uploadChain: Promise<void>;
  completed: boolean;
  aborted: boolean;
}

export interface MultipartUploadState {
  camera: MultipartUploadSession | null;
  screen: MultipartUploadSession | null;
}

export interface MultipartSessionSeed {
  questionIndex: number;
  mediaKey: string;
  uploadId: string;
}

export function stopMediaStream(stream: MediaStream | null) {
  if (!stream) {
    return;
  }

  stream.getTracks().forEach((track) => {
    track.onended = null;
    track.stop();
  });
}

export function releaseCaptureStreams(
  cameraStreamRef: { current: MediaStream | null },
  screenStreamRef: { current: MediaStream | null },
  videoRef: { current: HTMLVideoElement | null },
) {
  stopMediaStream(cameraStreamRef.current);
  stopMediaStream(screenStreamRef.current);
  cameraStreamRef.current = null;
  screenStreamRef.current = null;

  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
}

export function releaseCameraCapture(
  cameraStreamRef: { current: MediaStream | null },
  videoRef: { current: HTMLVideoElement | null },
) {
  stopMediaStream(cameraStreamRef.current);
  cameraStreamRef.current = null;

  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
}

export function clearProgressTimers(
  timerRef: { current: ReturnType<typeof setInterval> | null },
  progressHeartbeatRef: { current: ReturnType<typeof setInterval> | null },
  progressFlushTimeoutRef: { current: ReturnType<typeof setTimeout> | null },
) {
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  if (progressHeartbeatRef.current) {
    clearInterval(progressHeartbeatRef.current);
    progressHeartbeatRef.current = null;
  }

  if (progressFlushTimeoutRef.current) {
    clearTimeout(progressFlushTimeoutRef.current);
    progressFlushTimeoutRef.current = null;
  }
}

export function createMultipartUploadSession(session: MultipartSessionSeed): MultipartUploadSession {
  return {
    questionIndex: session.questionIndex,
    mediaKey: session.mediaKey,
    uploadId: session.uploadId,
    nextPartNumber: 1,
    uploadedPartCount: 0,
    bufferedChunks: [],
    bufferedBytes: 0,
    recordedBytes: 0,
    uploadChain: Promise.resolve(),
    completed: false,
    aborted: false,
  };
}

export function getMultipartSession(
  multipartUploads: MultipartUploadState,
  target: CaptureTarget,
): MultipartUploadSession {
  const session = multipartUploads[target];
  if (!session) {
    throw new Error(`${target} upload session is not initialized.`);
  }

  return session;
}

export interface ProgressPayloadArgs {
  questionIndex: number;
  versionNumber: number;
  mediaKey: string;
  screenMediaKey?: string;
  durationSeconds?: number;
  startedAt?: string;
  submittedAtMs?: number | null;
  cameraFileSizeBytes?: number;
  screenFileSizeBytes?: number;
  behaviorSignals: TakeBehaviorSignals;
  behaviorEvents: AnswerBehaviorEvent[];
  clientTranscript?: ClientTranscriptPayload;
}

export function buildProgressPayload(args: ProgressPayloadArgs) {
  return {
    questionIndex: args.questionIndex,
    versionNumber: args.versionNumber,
    mediaKey: args.mediaKey,
    screenMediaKey: args.screenMediaKey,
    durationSeconds: args.durationSeconds || undefined,
    startedAt: args.startedAt ?? undefined,
    submittedAt: args.submittedAtMs ? new Date(args.submittedAtMs).toISOString() : undefined,
    cameraFileSizeBytes: args.cameraFileSizeBytes || undefined,
    screenFileSizeBytes: args.screenFileSizeBytes || undefined,
    behaviorSignals: args.behaviorSignals,
    behaviorEvents: args.behaviorEvents,
    clientTranscript: args.clientTranscript,
  };
}
