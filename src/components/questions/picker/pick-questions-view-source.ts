import type { UseQuestionsInfiniteResult } from './use-questions-infinite'
import type { UseQuestionsQueryResult } from './use-questions-query'

export type QuestionsViewSource = {
  items: UseQuestionsQueryResult['items']
  total: number
  loading: boolean
  toolbarLoading: boolean
  error: string | null
  retry: () => void
}

type QuerySlice = Pick<
  UseQuestionsQueryResult,
  'items' | 'total' | 'loading' | 'blockingError' | 'refetch'
>

export function pickQuestionsViewSource(
  isCardsView: boolean,
  query: QuerySlice,
  infinite: UseQuestionsInfiniteResult,
): QuestionsViewSource {
  if (isCardsView) {
    return {
      items: infinite.items,
      total: infinite.total,
      loading: infinite.isInitialLoading,
      toolbarLoading: infinite.isInitialLoading || infinite.isFetching,
      error: infinite.blockingError,
      retry: infinite.refetch,
    }
  }
  return {
    items: query.items,
    total: query.total,
    loading: query.loading,
    toolbarLoading: query.loading,
    error: query.blockingError,
    retry: query.refetch,
  }
}
