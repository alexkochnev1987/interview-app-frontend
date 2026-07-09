import { describe, expect, it } from 'vitest'

import type { InterviewFacetsResponse, InterviewListItem } from '@/lib/api'

import { computeDashboardMetrics } from './dashboard-metrics'

const facets: InterviewFacetsResponse = {
  positions: [{ value: 'Engineer', count: 2 }],
  statuses: [
    { value: 'pending', count: 1 },
    { value: 'in_progress', count: 2 },
    { value: 'processing', count: 1 },
    { value: 'completed', count: 3 },
  ],
}

const interviews: InterviewListItem[] = [
  {
    id: '1',
    candidateName: 'Alice',
    position: 'Engineer',
    status: 'pending',
    questionCount: 10,
    submittedAnswerCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    candidateName: 'Bob',
    position: 'Engineer',
    status: 'completed',
    questionCount: 32,
    submittedAnswerCount: 32,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

describe('computeDashboardMetrics', () => {
  it('derives status metrics from facets and question volume from interview rows', () => {
    expect(computeDashboardMetrics(facets, interviews)).toEqual({
      activeCount: 4,
      completedCount: 3,
      totalCount: 7,
      questionVolume: 42,
    })
  })
})
