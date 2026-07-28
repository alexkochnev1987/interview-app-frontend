import { ApiError } from '@/lib/api-error';

export const MAX_ANSWER_ATTEMPTS_PER_QUESTION = 3;

export const ANSWER_ATTEMPT_LIMIT_REACHED_CODE = 'ANSWER_ATTEMPT_LIMIT_REACHED';
export const RECORDING_SESSION_MISMATCH_CODE = 'RECORDING_SESSION_MISMATCH';
export const ANSWER_VERSION_OVERWRITE_FORBIDDEN_CODE = 'ANSWER_VERSION_OVERWRITE_FORBIDDEN';

export interface AnswerAttemptMeta {
  versionCount?: number;
  selectedVersionNumber?: number;
  /** Interview-level max (or reserve response); falls back to MAX_ANSWER_ATTEMPTS_PER_QUESTION. */
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
 * Reuse the same reserved slot only for a true stub (no media on this version yet).
 * Once progress/upload has a mediaKey for the current version, retake must reserve N+1.
 */
export function shouldReuseReservedAttemptForRetake(params: {
  currentVersionNumber: number;
  hasSubmittableMedia?: boolean;
  latestSubmittableVersionNumber?: number | null;
  localVersionHasMedia: boolean;
}): boolean {
  const serverHasMediaOnCurrent =
    Boolean(params.hasSubmittableMedia) &&
    params.latestSubmittableVersionNumber === params.currentVersionNumber;
  return !serverHasMediaOnCurrent && !params.localVersionHasMedia;
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

export function isAnswerVersionOverwriteError(error: unknown): boolean {
  return error instanceof ApiError && error.code === ANSWER_VERSION_OVERWRITE_FORBIDDEN_CODE;
}
