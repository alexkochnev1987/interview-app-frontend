import { describe, expect, it } from 'vitest'

import { ASSIGNED_HR_FILTER_UNASSIGNED } from './assigned-hr-filter'
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

  it('accepts assignedHrId when it is a UUID or unassigned sentinel', () => {
    const uuid = '00000000-0000-4000-8000-000000000001'
    const params = new URLSearchParams({ assignedHrId: uuid })

    expect(readInterviewsFromSearchParams(params).assignedHrId).toBe(uuid)

    const unassignedParams = new URLSearchParams({
      assignedHrId: ASSIGNED_HR_FILTER_UNASSIGNED,
    })
    expect(readInterviewsFromSearchParams(unassignedParams).assignedHrId).toBe(
      ASSIGNED_HR_FILTER_UNASSIGNED,
    )
  })

  it('ignores invalid assignedHrId values', () => {
    const params = new URLSearchParams({ assignedHrId: 'not-a-uuid' })

    expect(readInterviewsFromSearchParams(params).assignedHrId).toBeUndefined()
  })

  it('drops assignedHrId when the filter is not allowed for the role', () => {
    const params = new URLSearchParams({
      assignedHrId: '00000000-0000-4000-8000-000000000001',
    })

    expect(
      readInterviewsFromSearchParams(params, undefined, {
        allowAssignedHrFilter: false,
      }).assignedHrId,
    ).toBeUndefined()
  })
})
