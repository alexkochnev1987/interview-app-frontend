import type {
  FetchQuestionFacetsParams,
  FetchQuestionsParams,
} from '@/lib/api'

const QUESTIONS_ROOT = 'questions' as const

export const questionsRootQueryKey = () => [QUESTIONS_ROOT] as const

export const questionsListQueryKey = (params: FetchQuestionsParams) =>
  [QUESTIONS_ROOT, 'list', params] as const

export const questionsInfiniteQueryKey = (
  params: Omit<FetchQuestionsParams, 'page'>,
) => [QUESTIONS_ROOT, 'infinite', params] as const

export const questionFacetsQueryKey = (params: FetchQuestionFacetsParams) =>
  [QUESTIONS_ROOT, 'facets', params] as const

export const similarQuestionsQueryKey = (
  signature: string,
  excludeId: string | undefined,
) => [QUESTIONS_ROOT, 'similar', { signature, excludeId }] as const
