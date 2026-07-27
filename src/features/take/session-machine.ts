import type { TakeInterviewData } from '@/lib/api';
import type { TakeStage } from '@/components/take/types';
import {
  canStartNewAttempt,
  type AnswerAttemptMeta,
} from './attempt-limit';

export type PendingVersionAction = 'submit' | 'rerecord' | null;
export type VersionPersistKind = Exclude<PendingVersionAction, null>;

/** initial = first-time invite (consent); resume = soft continue in-tab; returning = cookie reload. */
export type InterviewLoadMode = 'initial' | 'resume' | 'returning';

export type ExhaustedHint = 'submit' | 'no-media' | 'unavailable';

export function stageAfterInterviewLoad(
  interview: TakeInterviewData,
  mode: InterviewLoadMode,
): TakeStage {
  if (interview.completed) {
    return 'complete';
  }
  if (mode === 'initial') {
    return 'consent';
  }
  if (mode === 'returning') {
    // Devices/MediaRecorder cannot resume after F5 — re-check capture in lobby.
    return 'lobby';
  }
  return 'interview';
}

export function answerAttemptMetaFromInterview(
  interview: TakeInterviewData | null | undefined,
): AnswerAttemptMeta | undefined {
  if (!interview) {
    return undefined;
  }
  return {
    ...interview.currentAnswerMeta,
    maxAttempts: interview.maxAttempts,
  };
}

export function isAttemptsExhausted(meta?: AnswerAttemptMeta): boolean {
  return !canStartNewAttempt(meta);
}

export function resolveExhaustedHint(params: {
  attemptsExhausted: boolean;
  recording: boolean;
  submitAllowed: boolean;
  serverHasMedia: boolean;
}): ExhaustedHint | null {
  if (!params.attemptsExhausted || params.recording) {
    return null;
  }
  if (params.submitAllowed) {
    return 'submit';
  }
  return params.serverHasMedia ? 'unavailable' : 'no-media';
}

export function canRequestVersionAction(params: {
  action: PendingVersionAction;
  uploading: boolean;
  recording: boolean;
}) {
  const { action, uploading, recording } = params;
  return Boolean(action && !uploading && recording);
}

export function progressValueForStage(params: {
  interview: TakeInterviewData;
  stage: TakeStage;
}) {
  const { interview, stage } = params;
  if (interview.totalQuestions === 0) return 0;
  return Math.round(
    ((interview.currentQuestionIndex + (stage === 'complete' ? 1 : 0)) / interview.totalQuestions) *
      100,
  );
}
