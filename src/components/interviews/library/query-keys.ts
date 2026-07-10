import type {
    FetchInterviewFacetsParams,
    FetchInterviewsParams,
} from '@/lib/api'

const INTERVIEWS_ROOT = 'interviews' as const

export const interviewsRootQueryKey = () => [INTERVIEWS_ROOT] as const

export const interviewsListQueryKey = (params: FetchInterviewsParams) =>
    [INTERVIEWS_ROOT, 'list', params] as const

export const interviewsInfiniteQueryKey = (
    params: Omit<FetchInterviewsParams, 'page'>,
) => [INTERVIEWS_ROOT, 'infinite', params] as const

export const interviewFacetsQueryKey = (params: FetchInterviewFacetsParams) =>
    [INTERVIEWS_ROOT, 'facets', params] as const

