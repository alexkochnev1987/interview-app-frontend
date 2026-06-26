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
  return getApiErrorStatus(err) === 401
}

export function isForbiddenError(err: unknown): boolean {
  return getApiErrorStatus(err) === 403
}

export function getErrorMessage(err: unknown, fallback = ''): string {
  if (err == null) return ''
  if (!(err instanceof Error)) return ''
  if (err.message.trim().length > 0) return err.message
  return fallback
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}

export function getApiErrorStatus(err: unknown): number | undefined {
  return isApiError(err) ? err.status : undefined
}
