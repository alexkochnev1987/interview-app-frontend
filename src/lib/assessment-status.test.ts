import { describe, expect, it } from 'vitest'

import {
  behaviorRiskTone,
  canRerunReview,
  decisionLabel,
  decisionTone,
  deriveAnswerState,
  deriveReviewStatus,
  getCompletionDate,
  hasScoringInProgress,
  isHrVisibleAssessment,
  isPlaceholderResult,
  isScoring,
  isValidationInFlight,
  reviewStatusLabel,
  selectHrVisibleAssessments,
} from '@/lib/assessment-status'
import {
  interviewFixture,
  interviewResultFixture,
  questionFixture,
  submittedAnswerFixture,
} from '@/lib/test-fixtures/interview'

function readyToScoreInterview() {
  return interviewFixture({
    status: 'in_progress',
    questions: [questionFixture()],
    answers: [submittedAnswerFixture({ questionIndex: 0 })],
  })
}

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

  it('derives answer state from validation and evaluation', () => {
    expect(deriveAnswerState(undefined)).toBe('none')
    expect(
      deriveAnswerState(
        submittedAnswerFixture({ validation: { status: 'failed' } }),
      ),
    ).toBe('failed')
    expect(
      deriveAnswerState(
        submittedAnswerFixture({ validation: { status: 'queued' } }),
      ),
    ).toBe('scoring')
    expect(
      deriveAnswerState(
        submittedAnswerFixture({ validation: { status: 'processing' } }),
      ),
    ).toBe('scoring')
    expect(
      deriveAnswerState(
        submittedAnswerFixture({ evaluation: { overallScore: 80 } }),
      ),
    ).toBe('scored')
    expect(deriveAnswerState(submittedAnswerFixture())).toBe('awaiting')
  })

  it('reports validation in flight only for submitted, scoring answers', () => {
    expect(
      isValidationInFlight(
        interviewFixture({
          answers: [
            submittedAnswerFixture({ validation: { status: 'processing' } }),
          ],
        }),
      ),
    ).toBe(true)
    expect(isValidationInFlight(readyToScoreInterview())).toBe(false)
  })

  it('derives ready_to_score only once every answer is submitted and idle', () => {
    expect(deriveReviewStatus(readyToScoreInterview())).toBe('ready_to_score')

    // No questions: nothing to score yet.
    expect(
      deriveReviewStatus(
        interviewFixture({ status: 'in_progress', answers: [] }),
      ),
    ).toBe('in_progress')

    // A question is still unanswered.
    expect(
      deriveReviewStatus(
        interviewFixture({
          status: 'in_progress',
          questions: [questionFixture({ id: 'q1' }), questionFixture({ id: 'q2' })],
          answers: [submittedAnswerFixture({ questionIndex: 0 })],
        }),
      ),
    ).toBe('in_progress')

    // Validation already running keeps it in progress, not ready_to_score.
    expect(
      deriveReviewStatus(
        interviewFixture({
          status: 'in_progress',
          questions: [questionFixture()],
          answers: [
            submittedAnswerFixture({
              questionIndex: 0,
              validation: { status: 'processing' },
            }),
          ],
        }),
      ),
    ).toBe('in_progress')

    // A result already exists, so there is nothing left to kick off.
    expect(
      deriveReviewStatus(
        interviewFixture({
          status: 'in_progress',
          questions: [questionFixture()],
          answers: [submittedAnswerFixture({ questionIndex: 0 })],
          result: interviewResultFixture({ summary: 'Done' }),
        }),
      ),
    ).toBe('in_progress')
  })

  it('gates rerun to states with prior evaluation work', () => {
    expect(canRerunReview('ready')).toBe(true)
    expect(canRerunReview('scoring')).toBe(true)
    expect(canRerunReview('failed')).toBe(true)
    expect(canRerunReview('ready_to_score')).toBe(false)
    expect(canRerunReview('in_progress')).toBe(false)
    expect(canRerunReview('pending')).toBe(false)
  })

  it('flags scoring interviews for live polling', () => {
    const scoring = interviewFixture({
      status: 'processing',
      answers: [submittedAnswerFixture({ validation: { status: 'processing' } })],
    })
    const ready = interviewFixture({
      status: 'completed',
      result: interviewResultFixture({ summary: 'Done' }),
    })
    expect(isScoring(scoring)).toBe(true)
    expect(isScoring(ready)).toBe(false)
    expect(hasScoringInProgress([ready, scoring])).toBe(true)
    expect(hasScoringInProgress([ready])).toBe(false)
  })

  it('selects and orders only HR-visible assessments', () => {
    const ready = interviewFixture({
      id: 'ready',
      status: 'completed',
      result: interviewResultFixture({
        completedAt: '2024-03-01T00:00:00.000Z',
        summary: 'Done',
      }),
    })
    const failed = interviewFixture({
      id: 'failed',
      status: 'failed',
      updatedAt: '2024-04-01T00:00:00.000Z',
    })
    const pending = interviewFixture({ id: 'pending', status: 'pending' })

    expect(isHrVisibleAssessment(ready)).toBe(true)
    expect(isHrVisibleAssessment(pending)).toBe(false)

    const selected = selectHrVisibleAssessments([pending, ready, failed])
    expect(selected.map((interview) => interview.id)).toEqual([
      'ready',
      'failed',
    ])
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
