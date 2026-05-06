import type { MultipartUploadState } from './runtime';

interface EnqueueProgressFlushParams {
  progressRequestChainRef: { current: Promise<void> };
  flushAnswerProgress: (forceAllEvents: boolean) => Promise<void>;
  forceAllEvents?: boolean;
}

export function enqueueProgressFlush({
  progressRequestChainRef,
  flushAnswerProgress,
  forceAllEvents = false,
}: EnqueueProgressFlushParams) {
  progressRequestChainRef.current = progressRequestChainRef.current
    .catch(() => undefined)
    .then(() => flushAnswerProgress(forceAllEvents));

  return progressRequestChainRef.current;
}

interface ScheduleProgressFlushParams {
  multipartUploadsRef: { current: MultipartUploadState };
  progressFlushTimeoutRef: { current: ReturnType<typeof setTimeout> | null };
  enqueueProgressFlush: (forceAllEvents?: boolean) => Promise<void>;
  reason: 'event' | 'heartbeat' | 'start' | 'stop';
  progressDebounceMs: number;
}

export function scheduleProgressFlush({
  multipartUploadsRef,
  progressFlushTimeoutRef,
  enqueueProgressFlush,
  reason,
  progressDebounceMs,
}: ScheduleProgressFlushParams) {
  if (!multipartUploadsRef.current.camera) {
    return;
  }

  if (reason === 'start' || reason === 'stop') {
    if (progressFlushTimeoutRef.current) {
      clearTimeout(progressFlushTimeoutRef.current);
      progressFlushTimeoutRef.current = null;
    }

    void enqueueProgressFlush(true).catch(() => undefined);
    return;
  }

  if (progressFlushTimeoutRef.current) {
    return;
  }

  progressFlushTimeoutRef.current = setTimeout(() => {
    progressFlushTimeoutRef.current = null;
    void enqueueProgressFlush(false).catch(() => undefined);
  }, progressDebounceMs);
}

interface StartProgressHeartbeatParams {
  progressHeartbeatRef: { current: ReturnType<typeof setInterval> | null };
  progressHeartbeatMs: number;
  scheduleProgressFlush: (reason: 'heartbeat' | 'event' | 'start' | 'stop') => void;
}

export function startProgressHeartbeat({
  progressHeartbeatRef,
  progressHeartbeatMs,
  scheduleProgressFlush,
}: StartProgressHeartbeatParams) {
  if (progressHeartbeatRef.current) {
    clearInterval(progressHeartbeatRef.current);
  }

  progressHeartbeatRef.current = setInterval(() => {
    scheduleProgressFlush('heartbeat');
  }, progressHeartbeatMs);
}

interface BuildFlushBehaviorEventsParams {
  behaviorEvents: Array<{
    eventType: 'tab_hidden' | 'window_blur' | 'copy' | 'paste' | 'keydown' | 'resize';
    occurredAt: string;
    versionNumber: number;
  }>;
  forceAllEvents: boolean;
  flushedBehaviorEventCount: number;
}

export function buildFlushBehaviorEvents({
  behaviorEvents,
  forceAllEvents,
  flushedBehaviorEventCount,
}: BuildFlushBehaviorEventsParams) {
  const eventStartIndex = forceAllEvents ? 0 : flushedBehaviorEventCount;
  return behaviorEvents.slice(eventStartIndex);
}

