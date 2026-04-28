import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildFlushBehaviorEvents,
  enqueueProgressFlush,
  scheduleProgressFlush,
  startProgressHeartbeat,
} from './progress';
import type { MultipartUploadSession } from './runtime';

function makeSession(): MultipartUploadSession {
  return {
    mediaKey: 'm',
    uploadId: 'u',
    nextPartNumber: 1,
    bufferedChunks: [],
    bufferedBytes: 0,
    recordedBytes: 0,
    uploadChain: Promise.resolve(),
    completed: false,
    aborted: false,
  };
}

describe('take progress helpers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('serializes progress flush calls via request chain', async () => {
    const calls: boolean[] = [];
    const progressRequestChainRef = { current: Promise.resolve() };
    const flushAnswerProgress = async (forceAllEvents: boolean) => {
      calls.push(forceAllEvents);
    };

    await Promise.all([
      enqueueProgressFlush({ progressRequestChainRef, flushAnswerProgress, forceAllEvents: false }),
      enqueueProgressFlush({ progressRequestChainRef, flushAnswerProgress, forceAllEvents: true }),
    ]);

    expect(calls).toEqual([false, true]);
  });

  it('schedules debounced flush and avoids duplicate timer creation', () => {
    vi.useFakeTimers();
    const multipartUploadsRef = { current: { camera: makeSession(), screen: null } };
    const progressFlushTimeoutRef: { current: ReturnType<typeof setTimeout> | null } = { current: null };
    const enqueue = vi.fn(() => Promise.resolve());

    scheduleProgressFlush({
      multipartUploadsRef,
      progressFlushTimeoutRef,
      enqueueProgressFlush: enqueue,
      reason: 'event',
      progressDebounceMs: 200,
    });
    scheduleProgressFlush({
      multipartUploadsRef,
      progressFlushTimeoutRef,
      enqueueProgressFlush: enqueue,
      reason: 'event',
      progressDebounceMs: 200,
    });

    expect(enqueue).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(enqueue).toHaveBeenCalledTimes(1);
    expect(enqueue).toHaveBeenCalledWith(false);
  });

  it('flushes immediately for start/stop reasons', () => {
    const multipartUploadsRef = { current: { camera: makeSession(), screen: null } };
    const progressFlushTimeoutRef: { current: ReturnType<typeof setTimeout> | null } = { current: null };
    const enqueue = vi.fn(() => Promise.resolve());

    scheduleProgressFlush({
      multipartUploadsRef,
      progressFlushTimeoutRef,
      enqueueProgressFlush: enqueue,
      reason: 'start',
      progressDebounceMs: 500,
    });

    expect(enqueue).toHaveBeenCalledWith(true);
  });

  it('starts heartbeat interval and emits heartbeat flushes', () => {
    vi.useFakeTimers();
    const progressHeartbeatRef: { current: ReturnType<typeof setInterval> | null } = { current: null };
    const schedule = vi.fn();

    startProgressHeartbeat({
      progressHeartbeatRef,
      progressHeartbeatMs: 1000,
      scheduleProgressFlush: schedule,
    });

    vi.advanceTimersByTime(3000);
    expect(schedule).toHaveBeenCalledTimes(3);
    expect(schedule).toHaveBeenCalledWith('heartbeat');
  });

  it('builds behavior event slice based on flush mode', () => {
    const behaviorEvents = [
      { eventType: 'paste' as const, occurredAt: 't1', versionNumber: 1 },
      { eventType: 'resize' as const, occurredAt: 't2', versionNumber: 1 },
      { eventType: 'keydown' as const, occurredAt: 't3', versionNumber: 1 },
    ];

    expect(
      buildFlushBehaviorEvents({
        behaviorEvents,
        forceAllEvents: false,
        flushedBehaviorEventCount: 1,
      }),
    ).toEqual([behaviorEvents[1], behaviorEvents[2]]);

    expect(
      buildFlushBehaviorEvents({
        behaviorEvents,
        forceAllEvents: true,
        flushedBehaviorEventCount: 2,
      }),
    ).toEqual(behaviorEvents);
  });
});
