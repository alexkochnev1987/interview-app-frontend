import {
  extractApiErrorFieldsFromBody,
  type ApiErrorParams,
  type ApiErrorParamValue,
} from './api-error-fields'

export type { ApiErrorParamValue, ApiErrorParams } from './api-error-fields'

export class ApiError extends Error {
  public readonly code?: string
  public readonly params?: ApiErrorParams

  constructor(
    public readonly status: number,
    message: string,
    public readonly path?: string,
    public readonly body?: string,
    code?: string,
    params?: ApiErrorParams,
  ) {
    super(message)
    this.name = 'ApiError'

    if (code !== undefined || params !== undefined) {
      this.code = code
      this.params = params
      return
    }

    if (!body) {
      return
    }

    const parsed = extractApiErrorFieldsFromBody(body)
    this.code = parsed.code
    this.params = parsed.params
  }
}

export class QuestionInUseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QuestionInUseError'
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

export function getDeleteQuestionErrorTitle(
  err: unknown,
  defaultTitle: string,
  inUseTitle: string,
): string {
  return isConflictError(err) ? inUseTitle : defaultTitle
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}

export function getApiErrorStatus(err: unknown): number | undefined {
  return isApiError(err) ? err.status : undefined
}

export function isConflictError(err: unknown): boolean {
  return err instanceof QuestionInUseError || getApiErrorStatus(err) === 409
}

type ApiErrorTranslator = {
  has: (key: string) => boolean
  t: (key: string, params?: Record<string, string | number | Date>) => string
}

function toTranslationParams(
  params?: ApiErrorParams,
): Record<string, string | number | Date> | undefined {
  if (!params) return undefined

  const normalized: Record<string, string | number | Date> = {}
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' || typeof value === 'number') {
      normalized[key] = value
      continue
    }
    if (typeof value === 'boolean') {
      normalized[key] = value ? 'true' : 'false'
      continue
    }
    if (Array.isArray(value)) {
      normalized[key] = value.join(', ')
      continue
    }
    if (value === null) {
      normalized[key] = ''
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

export function resolveApiErrorMessage(
  error: unknown,
  translator: ApiErrorTranslator,
): string | undefined {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : undefined
  }

  if (error.code && translator.has(error.code)) {
    return translator.t(error.code, toTranslationParams(error.params))
  }

  if (
    error.code === 'VALIDATION_ERROR' &&
    Array.isArray(error.params?.errors) &&
    error.params.errors.length > 0
  ) {
    return error.params.errors.join('; ')
  }

  return error.message
}
