import { describe, expect, it } from 'vitest'

import { getNextInfinitePageParam } from './use-infinite-resource'

describe('use-infinite-resource', () => {
  describe('getNextInfinitePageParam', () => {
    it('returns undefined when lastPage is undefined', () => {
      const next = getNextInfinitePageParam(undefined, [])
      expect(next).toBeUndefined()
    })

    it('returns undefined when initial page has 0 items and total 0', () => {
      const allPages = [{ items: [], total: 0 }]
      const next = getNextInfinitePageParam(allPages[0], allPages)
      expect(next).toBeUndefined()
    })

    it('returns next page number when loaded items is less than total and items exist', () => {
      const allPages = [{ items: ['a', 'b'], total: 6 }]
      const next = getNextInfinitePageParam(allPages[0], allPages)
      expect(next).toBe(2)
    })

    it('returns 3 when 2 pages are loaded and more items remain', () => {
      const allPages = [
        { items: ['a', 'b'], total: 6 },
        { items: ['c', 'd'], total: 6 },
      ]
      const next = getNextInfinitePageParam(allPages[1], allPages)
      expect(next).toBe(3)
    })

    it('returns undefined when loaded items reach total', () => {
      const allPages = [
        { items: ['a', 'b'], total: 4 },
        { items: ['c', 'd'], total: 4 },
      ]
      const next = getNextInfinitePageParam(allPages[1], allPages)
      expect(next).toBeUndefined()
    })

    it('returns undefined when loaded items exceed total', () => {
      const allPages = [{ items: ['a', 'b', 'c', 'd', 'e'], total: 4 }]
      const next = getNextInfinitePageParam(allPages[0], allPages)
      expect(next).toBeUndefined()
    })

    it('returns undefined when page returns empty items even if loaded < total (prevents runaway requests)', () => {
      const allPages = [
        { items: ['a', 'b'], total: 10 },
        { items: [], total: 10 },
      ]
      // Page 2 returned no items: no progress, must terminate rather than looping indefinitely
      const next = getNextInfinitePageParam(allPages[1], allPages)
      expect(next).toBeUndefined()
    })

    it('returns undefined when items array is missing or empty on lastPage', () => {
      const allPages = [{ items: undefined, total: 10 }]
      const next = getNextInfinitePageParam(allPages[0], allPages)
      expect(next).toBeUndefined()
    })
  })
})
