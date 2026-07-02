type InterviewListEnvelope = {
  items?: unknown
}

type InterviewLike = {
  questions?: unknown
  answers?: unknown
  [key: string]: unknown
}

export type NormalizedInterview = InterviewLike & {
  questions: unknown[]
  answers: unknown[]
}

export type InterviewsListResponse<T extends InterviewLike = NormalizedInterview> =
  | T[]
  | {
      items: T[]
      total: number
      page: number
      limit: number
    }

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function warnMalformedInterviewsPayload(payload: unknown, source: string): void {
  const payloadType =
    payload === null ? 'null' : Array.isArray(payload) ? 'array' : typeof payload
  const hasItems =
    Boolean(payload) && typeof payload === 'object' && 'items' in (payload as object)
  const itemsType = hasItems
    ? Array.isArray((payload as InterviewListEnvelope).items)
      ? 'array'
      : typeof (payload as InterviewListEnvelope).items
    : 'missing'

  const details = {
    source,
    payloadType,
    hasItems,
    itemsType,
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('[normalizeInterviewsResponse] Unexpected interviews payload shape', details)
    return
  }

  console.warn('[normalizeInterviewsResponse] Unexpected interviews payload shape', details)
}

function normalizeInterview<T extends InterviewLike>(
  interview: unknown,
): T | null {
  if (!interview || typeof interview !== 'object') {
    return null
  }

  const candidate = interview as T & {
    questions?: unknown
    answers?: unknown
  }

  return {
    ...candidate,
    questions: asArray(candidate.questions),
    answers: asArray(candidate.answers),
  } as T
}

export function normalizeInterviewsResponse<T extends InterviewLike>(
  payload: unknown,
  source = '/interviews',
): T[] {
  let sourceItems: unknown[] | null = null
  if (Array.isArray(payload)) {
    sourceItems = payload
  } else {
    const maybeItems = (payload as InterviewListEnvelope | null)?.items
    if (Array.isArray(maybeItems)) {
      sourceItems = maybeItems
    }
  }

  if (!sourceItems) {
    warnMalformedInterviewsPayload(payload, source)
    return []
  }

  return sourceItems
    .map((item) => normalizeInterview<T>(item))
    .filter((item): item is T => item !== null)
}
