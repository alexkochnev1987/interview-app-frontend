import { describe, expect, it } from 'vitest'

import { buildPaginationItems } from './pagination-items'

describe('buildPaginationItems', () => {
  it('returns a single page when there is nothing to paginate', () => {
    expect(buildPaginationItems(1, 1)).toEqual([1])
    expect(buildPaginationItems(1, 0)).toEqual([1])
  })

  it('lists every page when there are three or fewer', () => {
    expect(buildPaginationItems(1, 3)).toEqual([1, 2, 3])
    expect(buildPaginationItems(2, 2)).toEqual([1, 2])
  })

  it('shows a trailing ellipsis when starting near the first page', () => {
    expect(buildPaginationItems(1, 10)).toEqual([1, 2, 'ellipsis-end'])
    expect(buildPaginationItems(2, 10)).toEqual([1, 2, 3, 4])
  })

  it('shows a leading ellipsis when near the last page', () => {
    expect(buildPaginationItems(9, 10)).toEqual(['ellipsis-start', 8, 9, 10])
    expect(buildPaginationItems(10, 10)).toEqual(['ellipsis-start', 8, 9, 10])
  })

  it('shows both ellipses when in the middle of a long range', () => {
    expect(buildPaginationItems(5, 10)).toEqual(['ellipsis-start', 4, 5, 6, 'ellipsis-end'])
  })
})
