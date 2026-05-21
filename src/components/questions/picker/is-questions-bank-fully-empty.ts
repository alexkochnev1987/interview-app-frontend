import type { QuestionsQueryState } from '@/lib/questions-query-state'

type FilterSlice = Pick<
  QuestionsQueryState,
  'difficulty' | 'category' | 'subcategory' | 'role' | 'tags' | 'status'
>

export function isQuestionsBankFullyEmpty({
  items,
  loading,
  total,
  debouncedQ,
  filterState,
  requireActiveStatus,
}: {
  items: unknown[]
  loading: boolean
  total: number
  debouncedQ: string
  filterState: FilterSlice
  requireActiveStatus?: boolean
}): boolean {
  if (items.length > 0 || loading || total !== 0 || debouncedQ !== '') {
    return false
  }
  if (
    filterState.difficulty ||
    filterState.category ||
    filterState.subcategory ||
    filterState.role ||
    filterState.tags.length > 0
  ) {
    return false
  }
  if (requireActiveStatus && filterState.status !== 'active') {
    return false
  }
  return true
}
