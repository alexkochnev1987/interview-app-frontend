import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_QUESTIONS_QUERY } from '@/lib/questions-query-state'

import { buildActiveFilterChips } from './build-active-chips'

describe('buildActiveFilterChips', () => {
  it('includes a removable locale chip when locale filter is active', () => {
    const setLocale = vi.fn()
    const chips = buildActiveFilterChips(
      { ...DEFAULT_QUESTIONS_QUERY, locale: 'pl' },
      {
        setLocale,
        setDifficulty: vi.fn(),
        setCategory: vi.fn(),
        setSubcategory: vi.fn(),
        setRole: vi.fn(),
        setTags: vi.fn(),
        setStatus: vi.fn(),
      },
      { showStatusFilter: false },
      ({ kind, value }) => `${kind}:${value}`,
    )

    expect(chips).toEqual([
      {
        key: 'locale:pl',
        label: 'locale:pl',
        onRemove: expect.any(Function),
      },
    ])

    chips[0]?.onRemove()
    expect(setLocale).toHaveBeenCalledWith(undefined)
  })
})
