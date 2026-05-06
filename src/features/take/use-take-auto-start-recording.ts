import { useEffect } from 'react';

import type { TakeInterviewData } from '@/lib/api';

interface UseTakeAutoStartRecordingParams {
  stage: 'loading' | 'consent' | 'interview' | 'recording' | 'transition' | 'complete';
  recording: boolean;
  uploading: boolean;
  interview: TakeInterviewData | null;
  cameraStatus: 'idle' | 'pending' | 'granted' | 'denied';
  screenStatus: 'idle' | 'pending' | 'granted' | 'denied';
  screenSurface: string;
  autoStartedQuestionKeyRef: { current: string };
  beginRecordingRef: { current: (nextVersionNumber: number, currentQuestionIndex: number) => Promise<void> };
}

export function useTakeAutoStartRecording({
  stage,
  recording,
  uploading,
  interview,
  cameraStatus,
  screenStatus,
  screenSurface,
  autoStartedQuestionKeyRef,
  beginRecordingRef,
}: UseTakeAutoStartRecordingParams) {
  useEffect(() => {
    const readyForAutoStart =
      stage === 'interview' &&
      !recording &&
      !uploading &&
      Boolean(interview?.currentQuestion) &&
      cameraStatus === 'granted' &&
      screenStatus === 'granted' &&
      screenSurface === 'monitor';

    if (!readyForAutoStart || !interview) {
      return;
    }

    const questionKey = `${interview.id}:${interview.currentQuestionIndex}:${interview.currentAnswerMeta?.versionCount ?? 0}:${stage}`;
    if (autoStartedQuestionKeyRef.current === questionKey) {
      return;
    }

    autoStartedQuestionKeyRef.current = questionKey;
    const nextVersionNumber = (interview.currentAnswerMeta?.versionCount ?? 0) + 1;
    void beginRecordingRef.current(nextVersionNumber, interview.currentQuestionIndex);
  }, [
    cameraStatus,
    interview,
    recording,
    screenStatus,
    screenSurface,
    stage,
    uploading,
    autoStartedQuestionKeyRef,
    beginRecordingRef,
  ]);
}
