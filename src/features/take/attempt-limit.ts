import { ApiError } from '@/lib/api-error';

export const MAX_ANSWER_ATTEMPTS_PER_QUESTION = 3;

export const ANSWER_ATTEMPT_LIMIT_REACHED_CODE = 'ANSWER_ATTEMPT_LIMIT_REACHED';
export const RECORDING_SESSION_MISMATCH_CODE = 'RECORDING_SESSION_MISMATCH';

export interface AnswerAttemptMeta {
  versionCount?: number;
  selectedVersionNumber?: number;
  /** Optional until BE exposes it; falls back to MAX_ANSWER_ATTEMPTS_PER_QUESTION. */
  maxAttempts?: number;
}

export function getMaxAttempts(meta?: AnswerAttemptMeta): number {
  return meta?.maxAttempts ?? MAX_ANSWER_ATTEMPTS_PER_QUESTION;
}

export function getUsedAttempts(meta?: AnswerAttemptMeta): number {
  return meta?.versionCount ?? 0;
}

export function canStartNewAttempt(meta?: AnswerAttemptMeta): boolean {
  return getUsedAttempts(meta) < getMaxAttempts(meta);
}

export function resolveInitialVersionNumber(meta?: AnswerAttemptMeta): number {
  const used = getUsedAttempts(meta);
  const max = getMaxAttempts(meta);
  if (used >= max) {
    return meta?.selectedVersionNumber ?? used;
  }
  // After reload, never retarget an already-reserved version — always next unused slot.
  return used + 1;
}

export function resolveNextVersionAfterSave(
  savedVersionNumber: number,
  meta?: AnswerAttemptMeta,
): number | null {
  const max = getMaxAttempts(meta);
  const usedAfterSave = Math.max(getUsedAttempts(meta), savedVersionNumber);
  const nextVersion = savedVersionNumber + 1;
  if (nextVersion > max || usedAfterSave >= max) {
    return null;
  }
  return nextVersion;
}

export function canRequestRetake(
  currentVersionNumber: number,
  meta?: AnswerAttemptMeta,
): boolean {
  return currentVersionNumber < getMaxAttempts(meta);
}

/**
 * Progress is sent for every in-flight reserved attempt, including the final one.
 * Do not gate on versionCount: reserve already increments versionCount before upload.
 */
export function shouldSendAnswerProgressDuringRecording(
  versionNumber: number,
  meta?: AnswerAttemptMeta,
): boolean {
  const max = getMaxAttempts(meta);
  return versionNumber >= 1 && versionNumber <= max;
}

export function getDisplayedAttemptNumber(
  meta: AnswerAttemptMeta | undefined,
  currentVersionNumber: number,
  recording: boolean,
): number {
  if (recording) {
    return currentVersionNumber;
  }
  const usedAttempts = getUsedAttempts(meta);
  return usedAttempts > 0 ? usedAttempts : 1;
}

export function isAnswerAttemptLimitError(error: unknown): boolean {
  return error instanceof ApiError && error.code === ANSWER_ATTEMPT_LIMIT_REACHED_CODE;
}

export function isRecordingSessionMismatchError(error: unknown): boolean {
  return error instanceof ApiError && error.code === RECORDING_SESSION_MISMATCH_CODE;
}
