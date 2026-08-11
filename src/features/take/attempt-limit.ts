import { ApiError } from '@/lib/api-error'

export const MAX_ANSWER_ATTEMPTS_PER_QUESTION = 3

export const ANSWER_ATTEMPT_LIMIT_REACHED_CODE = 'ANSWER_ATTEMPT_LIMIT_REACHED'
export const ANSWER_VERSION_OVERWRITE_FORBIDDEN_CODE = 'ANSWER_VERSION_OVERWRITE_FORBIDDEN'

export interface AnswerAttemptMeta {
  versionCount?: number
  selectedVersionNumber?: number
  maxAttempts?: number
}

/**
 * Resolve the effective max-attempts budget for a question.
 *
 * Priority: `meta.maxAttempts` (per-interview override from the backend)
 *         → `configDefault`    (dynamic value from `useAppConfig()`)
 *         → `MAX_ANSWER_ATTEMPTS_PER_QUESTION` (hardcoded fallback)
 */
export function getMaxAttempts(meta?: AnswerAttemptMeta, configDefault?: number): number {
  return meta?.maxAttempts ?? configDefault ?? MAX_ANSWER_ATTEMPTS_PER_QUESTION
}

export function getUsedAttempts(meta?: AnswerAttemptMeta): number {
  return meta?.versionCount ?? 0
}

export function canStartNewAttempt(meta?: AnswerAttemptMeta, configDefault?: number): boolean {
  return getUsedAttempts(meta) < getMaxAttempts(meta, configDefault)
}

export function resolveInitialVersionNumber(
  meta?: AnswerAttemptMeta,
  configDefault?: number,
): number {
  const used = getUsedAttempts(meta)
  const max = getMaxAttempts(meta, configDefault)
  if (used >= max) {
    return meta?.selectedVersionNumber ?? used
  }
  return used + 1
}

export function resolveNextVersionAfterSave(
  savedVersionNumber: number,
  meta?: AnswerAttemptMeta,
  configDefault?: number,
): number | null {
  const max = getMaxAttempts(meta, configDefault)
  const usedAfterSave = Math.max(getUsedAttempts(meta), savedVersionNumber)
  const nextVersion = savedVersionNumber + 1
  if (nextVersion > max || usedAfterSave >= max) {
    return null
  }
  return nextVersion
}

export function canRequestRetake(
  currentVersionNumber: number,
  meta?: AnswerAttemptMeta,
  configDefault?: number,
): boolean {
  return currentVersionNumber < getMaxAttempts(meta, configDefault)
}

export function shouldReuseReservedAttemptForRetake(params: {
  currentVersionNumber: number
  hasSubmittableMedia?: boolean
  latestSubmittableVersionNumber?: number | null
  localVersionHasMedia: boolean
}): boolean {
  const serverHasMediaOnCurrent =
    Boolean(params.hasSubmittableMedia) &&
    params.latestSubmittableVersionNumber === params.currentVersionNumber
  return !serverHasMediaOnCurrent && !params.localVersionHasMedia
}

export function getDisplayedAttemptNumber(
  meta: AnswerAttemptMeta | undefined,
  currentVersionNumber: number,
  recording: boolean,
): number {
  if (recording) {
    return currentVersionNumber
  }
  const usedAttempts = getUsedAttempts(meta)
  return usedAttempts > 0 ? usedAttempts : 1
}

export function isAnswerAttemptLimitError(error: unknown): boolean {
  return error instanceof ApiError && error.code === ANSWER_ATTEMPT_LIMIT_REACHED_CODE
}

export function isAnswerVersionOverwriteError(error: unknown): boolean {
  return error instanceof ApiError && error.code === ANSWER_VERSION_OVERWRITE_FORBIDDEN_CODE
}
