import type { UseInterviewsInfiniteResult } from '../hooks/use-interviews-infinite'
import type { UseInterviewsQueryResult } from '../hooks/use-interviews-query'

export type InterviewsViewSource = {
    items: UseInterviewsQueryResult['items']
    total: number
    loading: boolean
    toolbarLoading: boolean
    error: string | null
    retry: () => void
}

type QuerySlice = Pick<
    UseInterviewsQueryResult,
    'items' | 'total' | 'loading' | 'blockingError' | 'refetch'
>

export function pickInterviewsViewSource(
    isCardsView: boolean,
    query: QuerySlice,
    infinite: UseInterviewsInfiniteResult,
    isSearchPending = false,
): InterviewsViewSource {
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
