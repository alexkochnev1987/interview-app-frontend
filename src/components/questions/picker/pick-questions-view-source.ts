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
  isSearchPending = false,
): QuestionsViewSource {
  if (isCardsView) {
    const loading = isSearchPending ? false : infinite.isInitialLoading
    return {
      items: infinite.items,
      total: infinite.total,
      loading,
      toolbarLoading: loading,
      error: infinite.blockingError,
      retry: infinite.refetch,
    }
  }
  const loading = isSearchPending ? false : query.loading
  return {
    items: query.items,
    total: query.total,
    loading,
    toolbarLoading: loading,
    error: query.blockingError,
    retry: query.refetch,
  }
}
