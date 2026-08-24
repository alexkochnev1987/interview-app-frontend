import { describe, expect, it } from 'vitest'

import {
  DEFAULT_ASSESSMENTS_QUERY,
  readAssessmentsFromSearchParams,
  writeAssessmentsToSearchParams,
} from '@/lib/assessments-query-state'

describe('assessments-query-state', () => {
  it('reads status and q from search params', () => {
    const params = new URLSearchParams('status=ready&q=react')
    expect(readAssessmentsFromSearchParams(params)).toEqual({
      q: 'react',
      status: 'ready',
    })
  })

  it('ignores invalid status values', () => {
    const params = new URLSearchParams('status=invalid')
    expect(readAssessmentsFromSearchParams(params)).toEqual(DEFAULT_ASSESSMENTS_QUERY)
  })

  it('writes only active filters to the URL', () => {
    expect(writeAssessmentsToSearchParams({ q: '', status: 'all' }).toString()).toBe('')
    expect(writeAssessmentsToSearchParams({ q: 'react', status: 'ready' }).toString()).toBe(
      'q=react&status=ready',
    )
  })
})
