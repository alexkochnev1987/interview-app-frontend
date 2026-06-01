import { describe, expect, it } from 'vitest'

import {
  behaviorRiskTone,
  decisionLabel,
  decisionTone,
  deriveReviewStatus,
  getCompletionDate,
  isPlaceholderResult,
  reviewStatusLabel,
} from '@/lib/assessment-status'
import {
  interviewFixture,
  interviewResultFixture,
  submittedAnswerFixture,
} from '@/lib/test-fixtures/interview'

describe('assessment-status', () => {
  it('derives review status across interview lifecycle', () => {
    expect(deriveReviewStatus(interviewFixture({ status: 'failed' }))).toBe(
      'failed',
    )
    expect(
      deriveReviewStatus(interviewFixture({ status: 'in_progress' })),
    ).toBe('in_progress')
    expect(
      deriveReviewStatus(
        interviewFixture({
          status: 'processing',
          answers: [
            submittedAnswerFixture({
              validation: { status: 'processing' },
            }),
          ],
        }),
      ),
    ).toBe('scoring')
    expect(
      deriveReviewStatus(
        interviewFixture({
          status: 'processing',
          result: interviewResultFixture({ summary: 'Done' }),
        }),
      ),
    ).toBe('ready')
    expect(
      deriveReviewStatus(
        interviewFixture({ status: 'completed', result: undefined }),
      ),
    ).toBe('scoring')
    expect(
      deriveReviewStatus(
        interviewFixture({
          status: 'completed',
          result: interviewResultFixture({ summary: 'Done' }),
        }),
      ),
    ).toBe('ready')
  })

  it('maps labels, decision tones, and completion date', () => {
    expect(reviewStatusLabel('ready')).toBe('Ready for review')
    expect(decisionLabel('reject')).toBe('Reject')
    expect(decisionTone('proceed')).toBe('completed')
    expect(behaviorRiskTone('high')).toBe('failed')
    expect(
      getCompletionDate(
        interviewFixture({
          result: interviewResultFixture({
            completedAt: '2024-01-05T00:00:00.000Z',
            summary: 'x',
          }),
        }),
      ),
    ).toBe('2024-01-05T00:00:00.000Z')
    expect(
      getCompletionDate(
        interviewFixture({
          status: 'completed',
          updatedAt: '2024-01-02T00:00:00.000Z',
        }),
      ),
    ).toBe('2024-01-02T00:00:00.000Z')
    expect(getCompletionDate(interviewFixture({ status: 'pending' }))).toBeNull()
  })

  it('detects placeholder scoring summaries', () => {
    expect(
      isPlaceholderResult(
        interviewResultFixture({ summary: 'Simulated evaluation result' }),
      ),
    ).toBe(true)
    expect(
      isPlaceholderResult(
        interviewResultFixture({ summary: 'Strong hire signal' }),
      ),
    ).toBe(false)
  })
})
