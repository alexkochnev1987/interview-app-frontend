import { describe, expect, it } from 'vitest'

import {
  clampInterviewsSearchQuery,
  MAX_INTERVIEWS_Q_LENGTH,
  readInterviewsFromSearchParams,
} from './interviews-query-state'

describe('interviews-query-state', () => {
  it('truncates q from search params to the server limit', () => {
    const params = new URLSearchParams({ q: 'x'.repeat(150) })

    expect(readInterviewsFromSearchParams(params).q).toHaveLength(
      MAX_INTERVIEWS_Q_LENGTH,
    )
  })

  it('clamps typed search input to the server limit', () => {
    expect(clampInterviewsSearchQuery('x'.repeat(150))).toHaveLength(
      MAX_INTERVIEWS_Q_LENGTH,
    )
    expect(clampInterviewsSearchQuery('alice')).toBe('alice')
  })
})
