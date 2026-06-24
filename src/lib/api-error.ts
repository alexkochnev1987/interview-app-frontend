export type ApiErrorParamValue =
  | string
  | number
  | boolean
  | null
  | string[]
export type ApiErrorParams = Record<string, ApiErrorParamValue>

type ParsedApiErrorBody = {
  code?: string
  params?: ApiErrorParams
}

function normalizeApiErrorParams(input: unknown): ApiErrorParams | undefined {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return undefined
  }

  const normalized: ApiErrorParams = {}
  for (const [key, value] of Object.entries(input)) {
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      (Array.isArray(value) && value.every((item) => typeof item === 'string'))
    ) {
      normalized[key] = value
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

function parseApiErrorBody(body?: string): ParsedApiErrorBody {
  if (!body) return {}

  try {
    const parsed = JSON.parse(body) as { code?: unknown; params?: unknown }
    return {
      code: typeof parsed.code === 'string' ? parsed.code : undefined,
      params: normalizeApiErrorParams(parsed.params),
    }
  } catch {
    return {}
  }
}

export class ApiError extends Error {
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
    const parsed = parseApiErrorBody(body)
    this.code = code ?? parsed.code
    this.params = params ?? parsed.params
  }

  public readonly code?: string
  public readonly params?: ApiErrorParams
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
