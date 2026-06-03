import { QuestionInUseError } from '@/lib/api'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly path?: string,
    public readonly body?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401
}

export function isForbiddenError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 403
}

export function getErrorMessage(err: unknown): string | undefined {
  return err instanceof Error ? err.message : undefined
}

export function getDeleteQuestionErrorTitle(
  err: unknown,
  defaultTitle: string,
  inUseTitle: string,
): string {
  return err instanceof QuestionInUseError ? inUseTitle : defaultTitle
}