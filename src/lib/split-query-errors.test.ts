import { describe, expect, it } from 'vitest'

import { splitInfiniteQueryErrors, splitListQueryErrors } from './split-query-errors'

describe('split-query-errors', () => {
  describe('splitListQueryErrors', () => {
    it('returns nulls when errorMessage is null', () => {
      expect(splitListQueryErrors(null, 5, false)).toEqual({
        blockingError: null,
        paginationError: null,
      })
    })

    it('returns blocking error on initial load without items', () => {
      expect(splitListQueryErrors('Network failed', 0, false)).toEqual({
        blockingError: 'Network failed',
        paginationError: null,
      })
    })

    it('returns pagination error when items exist and isPlaceholderData is true', () => {
      expect(splitListQueryErrors('Page 2 failed', 10, true)).toEqual({
        blockingError: null,
        paginationError: 'Page 2 failed',
      })
    })

    it('returns blocking error when items exist but isPlaceholderData is false', () => {
      expect(splitListQueryErrors('Failed', 10, false)).toEqual({
        blockingError: 'Failed',
        paginationError: null,
      })
    })
  })

  describe('splitInfiniteQueryErrors', () => {
    it('returns nulls when errorMessage is null', () => {
      expect(splitInfiniteQueryErrors(null, 5, false)).toEqual({
        blockingError: null,
        paginationError: null,
      })
    })

    it('returns blocking error when no items loaded yet', () => {
      expect(splitInfiniteQueryErrors('Failed', 0, false)).toEqual({
        blockingError: 'Failed',
        paginationError: null,
      })
    })

    it('returns pagination error when items exist and is not placeholder data', () => {
      expect(splitInfiniteQueryErrors('Next page failed', 15, false)).toEqual({
        blockingError: null,
        paginationError: 'Next page failed',
      })
    })

    it('returns blocking error when placeholder data is true', () => {
      expect(splitInfiniteQueryErrors('Failed', 15, true)).toEqual({
        blockingError: 'Failed',
        paginationError: null,
      })
    })
  })
})
