import { ApiError } from '@/lib/api-error';

export const MAX_ANSWER_ATTEMPTS_PER_QUESTION = 3;

export const ANSWER_ATTEMPT_LIMIT_REACHED_CODE = 'ANSWER_ATTEMPT_LIMIT_REACHED';

export interface AnswerAttemptMeta {
  versionCount?: number;
  selectedVersionNumber?: number;
}

export function getUsedAttempts(meta?: AnswerAttemptMeta): number {
  return meta?.versionCount ?? 0;
}

export function canStartNewAttempt(meta?: AnswerAttemptMeta): boolean {
  return getUsedAttempts(meta) < MAX_ANSWER_ATTEMPTS_PER_QUESTION;
}

export function resolveInitialVersionNumber(meta?: AnswerAttemptMeta): number {
  const used = getUsedAttempts(meta);
  if (used >= MAX_ANSWER_ATTEMPTS_PER_QUESTION) {
    return meta?.selectedVersionNumber ?? used;
  }
  return used + 1;
}

export function resolveNextVersionAfterSave(
  savedVersionNumber: number,
  meta?: AnswerAttemptMeta,
): number | null {
  const usedAfterSave = Math.max(getUsedAttempts(meta), savedVersionNumber);
  const nextVersion = savedVersionNumber + 1;
  if (nextVersion > MAX_ANSWER_ATTEMPTS_PER_QUESTION || usedAfterSave >= MAX_ANSWER_ATTEMPTS_PER_QUESTION) {
    return null;
  }
  return nextVersion;
}

export function canRequestRetake(currentVersionNumber: number): boolean {
  return currentVersionNumber < MAX_ANSWER_ATTEMPTS_PER_QUESTION;
}

export function shouldSendAnswerProgressDuringRecording(versionNumber: number): boolean {
  return versionNumber < MAX_ANSWER_ATTEMPTS_PER_QUESTION;
}

export function getDisplayedAttemptNumber(
  meta: AnswerAttemptMeta | undefined,
  currentVersionNumber: number,
  recording: boolean,
): number {
  if (recording) {
    return currentVersionNumber;
  }
  return getUsedAttempts(meta);
}

export function isAnswerAttemptLimitError(error: unknown): boolean {
  return error instanceof ApiError && error.code === ANSWER_ATTEMPT_LIMIT_REACHED_CODE;
}
