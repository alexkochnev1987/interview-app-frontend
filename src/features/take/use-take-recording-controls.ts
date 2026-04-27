import type { MutableRefObject } from 'react';

type PendingVersionAction = 'submit' | 'rerecord' | null;

interface UseTakeRecordingControlsParams {
  uploading: boolean;
  recording: boolean;
  pendingVersionActionRef: MutableRefObject<PendingVersionAction>;
  answerStoppedAtMsRef: MutableRefObject<number | null>;
  answerStartedAtMsRef: MutableRefObject<number | null>;
  answerDurationSecondsRef: MutableRefObject<number>;
  setTransitionLabel: (value: string) => void;
  setStage: (value: 'transition') => void;
  scheduleProgressFlush: (reason: 'stop') => void;
  stopActiveRecorders: () => void;
}

export function useTakeRecordingControls({
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
}: UseTakeRecordingControlsParams) {
  function stopRecording() {
    const stopTimestamp = Date.now();

    if (!answerStoppedAtMsRef.current) {
      answerStoppedAtMsRef.current = stopTimestamp;
    }

    if (answerStartedAtMsRef.current) {
      answerDurationSecondsRef.current = Math.max(
        1,
        Math.round((answerStoppedAtMsRef.current - answerStartedAtMsRef.current) / 1000),
      );
    }

    stopActiveRecorders();
  }

  function requestVersionAction(action: PendingVersionAction) {
    if (!action || uploading || !recording) {
      return;
    }

    pendingVersionActionRef.current = action;
    setTransitionLabel(
      action === 'submit'
        ? 'Submitting answer and moving to the next question...'
        : 'Saving this version and starting a new recording...',
    );
    setStage('transition');
    scheduleProgressFlush('stop');
    stopRecording();
  }

  return { stopRecording, requestVersionAction };
}
