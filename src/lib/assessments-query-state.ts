export const ASSESSMENTS_STATUS_FILTERS = [
  'all',
  'ready_to_score',
  'ready',
  'scoring',
  'failed',
] as const

export type AssessmentsStatusFilter = (typeof ASSESSMENTS_STATUS_FILTERS)[number]

export type AssessmentsQueryState = {
  q: string
  status: AssessmentsStatusFilter
}

export const DEFAULT_ASSESSMENTS_QUERY: AssessmentsQueryState = {
  q: '',
  status: 'all',
}

export const ASSESSMENTS_SEARCH_DEBOUNCE_MS = 500

const ASSESSMENT_STATUS_SET = new Set<AssessmentsStatusFilter>(ASSESSMENTS_STATUS_FILTERS)

function isAssessmentsStatusFilter(value: string): value is AssessmentsStatusFilter {
  return (ASSESSMENT_STATUS_SET as Set<string>).has(value)
}

export function readAssessmentsFromSearchParams(
  params: URLSearchParams,
  fallback: AssessmentsQueryState = DEFAULT_ASSESSMENTS_QUERY,
): AssessmentsQueryState {
  const next: AssessmentsQueryState = { ...fallback }

  const q = params.get('q')
  if (q !== null) {
    next.q = q
  }

  const status = params.get('status')
  if (status && isAssessmentsStatusFilter(status)) {
    next.status = status
  }

  return next
}

export function writeAssessmentsToSearchParams(state: AssessmentsQueryState): URLSearchParams {
  const params = new URLSearchParams()

  if (state.q.trim()) {
    params.set('q', state.q.trim())
  }
  if (state.status !== 'all') {
    params.set('status', state.status)
  }

  return params
}
