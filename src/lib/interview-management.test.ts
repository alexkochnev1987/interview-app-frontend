import { describe, expect, it } from 'vitest'

import {
  canEditInterview,
  canManageInterview,
  hasInterviewAnswers,
  isPendingInterview,
} from '@/lib/interview-management'
import {
  interviewFixture,
  submittedAnswerFixture,
} from '@/lib/test-fixtures/interview'

describe('interview-management', () => {
  it('detects pending interviews', () => {
    expect(isPendingInterview(interviewFixture({ status: 'pending' }))).toBe(true)
    expect(isPendingInterview(interviewFixture({ status: 'in_progress' }))).toBe(
      false,
    )
    expect(isPendingInterview(interviewFixture({ status: 'completed' }))).toBe(
      false,
    )
  })

  it('detects interviews with uploaded answers', () => {
    expect(hasInterviewAnswers(interviewFixture())).toBe(false)
    expect(
      hasInterviewAnswers(
        interviewFixture({ answers: [submittedAnswerFixture()] }),
      ),
    ).toBe(true)
  })

  it('allows editing only for pending interviews without answers', () => {
    expect(canEditInterview(interviewFixture({ status: 'pending' }))).toBe(true)
    expect(
      canEditInterview(
        interviewFixture({
          status: 'pending',
          answers: [submittedAnswerFixture()],
        }),
      ),
    ).toBe(false)
    expect(canEditInterview(interviewFixture({ status: 'in_progress' }))).toBe(
      false,
    )
  })

  it('allows management only for pending interviews', () => {
    expect(canManageInterview(interviewFixture({ status: 'pending' }))).toBe(true)
    expect(
      canManageInterview(
        interviewFixture({
          status: 'pending',
          answers: [submittedAnswerFixture()],
        }),
      ),
    ).toBe(true)
    expect(canManageInterview(interviewFixture({ status: 'in_progress' }))).toBe(
      false,
    )
    expect(canManageInterview(interviewFixture({ status: 'processing' }))).toBe(
      false,
    )
    expect(canManageInterview(interviewFixture({ status: 'completed' }))).toBe(
      false,
    )
    expect(canManageInterview(interviewFixture({ status: 'failed' }))).toBe(false)
    expect(canManageInterview(interviewFixture({ status: 'completed' }))).toBe(
      false,
    )
  })
})
