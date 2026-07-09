import { describe, expect, it } from 'vitest'

import type { InterviewFacetsResponse } from '@/lib/api'

import { computeDashboardMetrics } from './dashboard-metrics'

const facets: InterviewFacetsResponse = {
  positions: [{ value: 'Engineer', count: 2 }],
  statuses: [
    { value: 'pending', count: 1 },
    { value: 'in_progress', count: 2 },
    { value: 'processing', count: 1 },
    { value: 'completed', count: 3 },
  ],
  totalQuestionCount: 42,
}

describe('computeDashboardMetrics', () => {
  it('derives status metrics from facets and question volume from totalQuestionCount', () => {
    expect(computeDashboardMetrics(facets)).toEqual({
      activeCount: 4,
      completedCount: 3,
      totalCount: 7,
      questionVolume: 42,
    })
  })
})
