import { describe, expect, it } from 'vitest'

import { nextTableSort, tableSortDirectionFor } from './use-table-sort'

type Field = 'name' | 'updatedAt' | 'createdAt'

describe('nextTableSort', () => {
  it('defaults a newly clicked field to descending', () => {
    expect(nextTableSort<Field>('name', 'asc', 'updatedAt')).toEqual({
      field: 'updatedAt',
      order: 'desc',
    })
  })

  it('defaults a newly clicked field to ascending when listed in ascByDefault', () => {
    expect(nextTableSort<Field>('updatedAt', 'desc', 'name', ['name'])).toEqual({
      field: 'name',
      order: 'asc',
    })
  })

  it('toggles order when clicking the already-active field', () => {
    expect(nextTableSort<Field>('updatedAt', 'desc', 'updatedAt')).toEqual({
      field: 'updatedAt',
      order: 'asc',
    })
    expect(nextTableSort<Field>('updatedAt', 'asc', 'updatedAt')).toEqual({
      field: 'updatedAt',
      order: 'desc',
    })
  })
})

describe('tableSortDirectionFor', () => {
  it('returns none for a field that is not the active sort', () => {
    expect(tableSortDirectionFor<Field>('name', 'asc', 'updatedAt')).toBe('none')
  })

  it('returns the active order for the active field', () => {
    expect(tableSortDirectionFor<Field>('updatedAt', 'desc', 'updatedAt')).toBe('desc')
    expect(tableSortDirectionFor<Field>('updatedAt', 'asc', 'updatedAt')).toBe('asc')
  })
})
