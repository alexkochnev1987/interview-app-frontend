import { describe, expect, it, vi } from 'vitest';

import { useTakeRecordingControls } from './use-take-recording-controls';

describe('useTakeRecordingControls', () => {
  it('does not request action when guard conditions fail', () => {
    const pendingVersionActionRef = { current: null as 'submit' | 'rerecord' | null };
    const answerStoppedAtMsRef = { current: null as number | null };
    const answerStartedAtMsRef = { current: null as number | null };
    const answerDurationSecondsRef = { current: 0 };
    const setTransitionLabel = vi.fn();
    const setStage = vi.fn();
    const scheduleProgressFlush = vi.fn();
    const stopActiveRecorders = vi.fn();

    const { requestVersionAction } = useTakeRecordingControls({
      uploading: true,
      recording: true,
      pendingVersionActionRef,
      answerStoppedAtMsRef,
      answerStartedAtMsRef,
      answerDurationSecondsRef,
      setTransitionLabel,
      setStage,
      scheduleProgressFlush,
      stopActiveRecorders,
    });

    requestVersionAction('submit');

    expect(pendingVersionActionRef.current).toBeNull();
    expect(setTransitionLabel).not.toHaveBeenCalled();
    expect(setStage).not.toHaveBeenCalled();
    expect(scheduleProgressFlush).not.toHaveBeenCalled();
    expect(stopActiveRecorders).not.toHaveBeenCalled();
  });

  it('applies transition flow for submit', () => {
    const pendingVersionActionRef = { current: null as 'submit' | 'rerecord' | null };
    const answerStoppedAtMsRef = { current: null as number | null };
    const answerStartedAtMsRef = { current: 1000 };
    const answerDurationSecondsRef = { current: 0 };
    const setTransitionLabel = vi.fn();
    const setStage = vi.fn();
    const scheduleProgressFlush = vi.fn();
    const stopActiveRecorders = vi.fn();

    const { requestVersionAction } = useTakeRecordingControls({
      uploading: false,
      recording: true,
      pendingVersionActionRef,
      answerStoppedAtMsRef,
      answerStartedAtMsRef,
      answerDurationSecondsRef,
      setTransitionLabel,
      setStage,
      scheduleProgressFlush,
      stopActiveRecorders,
    });

    requestVersionAction('submit');

    expect(pendingVersionActionRef.current).toBe('submit');
    expect(setTransitionLabel).toHaveBeenCalledWith(
      'Submitting answer and moving to the next question...',
    );
    expect(setStage).toHaveBeenCalledWith('transition');
    expect(scheduleProgressFlush).toHaveBeenCalledWith('stop');
    expect(stopActiveRecorders).toHaveBeenCalledTimes(1);
  });

  it('applies transition flow for rerecord', () => {
    const pendingVersionActionRef = { current: null as 'submit' | 'rerecord' | null };
    const answerStoppedAtMsRef = { current: null as number | null };
    const answerStartedAtMsRef = { current: 1000 };
    const answerDurationSecondsRef = { current: 0 };
    const setTransitionLabel = vi.fn();
    const setStage = vi.fn();
    const scheduleProgressFlush = vi.fn();
    const stopActiveRecorders = vi.fn();

    const { requestVersionAction } = useTakeRecordingControls({
      uploading: false,
      recording: true,
      pendingVersionActionRef,
      answerStoppedAtMsRef,
      answerStartedAtMsRef,
      answerDurationSecondsRef,
      setTransitionLabel,
      setStage,
      scheduleProgressFlush,
      stopActiveRecorders,
    });

    requestVersionAction('rerecord');

    expect(pendingVersionActionRef.current).toBe('rerecord');
    expect(setTransitionLabel).toHaveBeenCalledWith(
      'Saving this version and starting a new recording...',
    );
    expect(setStage).toHaveBeenCalledWith('transition');
    expect(scheduleProgressFlush).toHaveBeenCalledWith('stop');
    expect(stopActiveRecorders).toHaveBeenCalledTimes(1);
  });

  it('computes duration in stopRecording and keeps minimum 1 second', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-28T10:00:00.100Z'));

    const pendingVersionActionRef = { current: null as 'submit' | 'rerecord' | null };
    const answerStoppedAtMsRef = { current: null as number | null };
    const answerStartedAtMsRef = { current: new Date('2026-04-28T10:00:00.050Z').getTime() };
    const answerDurationSecondsRef = { current: 0 };
    const setTransitionLabel = vi.fn();
    const setStage = vi.fn();
    const scheduleProgressFlush = vi.fn();
    const stopActiveRecorders = vi.fn();

    const { stopRecording } = useTakeRecordingControls({
      uploading: false,
      recording: true,
      pendingVersionActionRef,
      answerStoppedAtMsRef,
      answerStartedAtMsRef,
      answerDurationSecondsRef,
      setTransitionLabel,
      setStage,
      scheduleProgressFlush,
      stopActiveRecorders,
    });

    stopRecording();

    expect(answerStoppedAtMsRef.current).toBe(new Date('2026-04-28T10:00:00.100Z').getTime());
    expect(answerDurationSecondsRef.current).toBe(1);
    expect(stopActiveRecorders).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
