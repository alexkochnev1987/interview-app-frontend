import { describe, expect, it, vi } from 'vitest'

import type { InterviewListItem, PaginatedInterviews } from '@/lib/api'

import {
  ASSESSMENTS_INTERVIEW_PAGE_SIZE,
  fetchAllInterviewPages,
} from './fetch-all-interviews'

function listItem(id: string): InterviewListItem {
  return {
    id,
    candidateName: `Candidate ${id}`,
    position: 'Engineer',
    status: 'completed',
    questionCount: 1,
    submittedAnswerCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('fetchAllInterviewPages', () => {
  it('pages through every result before returning', async () => {
    const fetchPage = vi
      .fn<(params: { page?: number; limit?: number }) => Promise<PaginatedInterviews>>()
      .mockResolvedValueOnce({
        items: [listItem('1'), listItem('2')],
        total: 3,
        page: 1,
        limit: ASSESSMENTS_INTERVIEW_PAGE_SIZE,
      })
      .mockResolvedValueOnce({
        items: [listItem('3')],
        total: 3,
        page: 2,
        limit: ASSESSMENTS_INTERVIEW_PAGE_SIZE,
      })

    const items = await fetchAllInterviewPages(fetchPage, {
      limit: ASSESSMENTS_INTERVIEW_PAGE_SIZE,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    })

    expect(items.map((item) => item.id)).toEqual(['1', '2', '3'])
    expect(fetchPage).toHaveBeenCalledTimes(2)
    expect(fetchPage.mock.calls[1]?.[0]).toMatchObject({ page: 2 })
  })
})
