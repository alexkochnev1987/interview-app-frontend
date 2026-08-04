import type { SortDirection } from '@/components/ui/sortable-table-head'

export function nextTableSort<TField extends string>(
  active: TField,
  order: 'asc' | 'desc',
  clicked: TField,
  ascByDefault: readonly TField[] = [],
): { field: TField; order: 'asc' | 'desc' } {
  if (active !== clicked) {
    return { field: clicked, order: ascByDefault.includes(clicked) ? 'asc' : 'desc' }
  }
  return { field: clicked, order: order === 'desc' ? 'asc' : 'desc' }
}

export function tableSortDirectionFor<TField extends string>(
  active: TField,
  order: 'asc' | 'desc',
  field: TField,
): SortDirection {
  if (active !== field) return 'none'
  return order
}

export type UseTableSortOptions<TField extends string> = {
  sortBy: TField
  sortOrder: 'asc' | 'desc'
  onSortChange: (sortBy: TField, sortOrder: 'asc' | 'desc') => void
  /** Fields whose first click should default to ascending order (e.g. name/text columns). */
  ascByDefault?: readonly TField[]
}

export function useTableSort<TField extends string>({
  sortBy,
  sortOrder,
  onSortChange,
  ascByDefault,
}: UseTableSortOptions<TField>) {
  function handleSortClick(field: TField) {
    const next = nextTableSort(sortBy, sortOrder, field, ascByDefault)
    onSortChange(next.field, next.order)
  }

  function directionFor(field: TField): SortDirection {
    return tableSortDirectionFor(sortBy, sortOrder, field)
  }

  return { handleSortClick, directionFor }
}
