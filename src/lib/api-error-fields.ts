export type ApiErrorParamValue =
  | string
  | number
  | boolean
  | null
  | string[]
export type ApiErrorParams = Record<string, ApiErrorParamValue>

type ApiErrorPayload = { code?: unknown; params?: unknown }

export function extractApiErrorFields(source: unknown): {
  code?: string
  params?: ApiErrorParams
} {
  if (!source || typeof source !== 'object') {
    return {}
  }

  const payload = source as ApiErrorPayload
  const code = typeof payload.code === 'string' ? payload.code : undefined
  const rawParams = payload.params
  if (!rawParams || typeof rawParams !== 'object' || Array.isArray(rawParams)) {
    return { code }
  }

  const params: ApiErrorParams = {}
  for (const [key, value] of Object.entries(rawParams)) {
    const isStringArray =
      Array.isArray(value) && value.every((item) => typeof item === 'string')
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      isStringArray
    ) {
      params[key] = value
    }
  }

  return {
    code,
    params: Object.keys(params).length > 0 ? params : undefined,
  }
}

export function extractApiErrorFieldsFromBody(body: string): {
  code?: string
  params?: ApiErrorParams
} {
  const trimmed = body.trim()
  if (!trimmed) return {}

  try {
    return extractApiErrorFields(JSON.parse(trimmed) as unknown)
  } catch {
    return {}
  }
}
