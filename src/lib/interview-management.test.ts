import { describe, expect, it } from 'vitest'

import {
  canDeleteInterview,
  canEditInterview,
  canEditInterviewDetails,
  canManageInterview,
  canOpenInterviewEdit,
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
    expect(canEditInterviewDetails(interviewFixture({ status: 'pending' }))).toBe(
      true,
    )
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

  it('opens edit for full edit or HR reassignment when allowed', () => {
    expect(
      canOpenInterviewEdit(interviewFixture({ status: 'pending' })),
    ).toBe(true)
    expect(
      canOpenInterviewEdit(interviewFixture({ status: 'in_progress' }), {
        canAssignHr: false,
      }),
    ).toBe(false)
    expect(
      canOpenInterviewEdit(interviewFixture({ status: 'completed' }), {
        canAssignHr: true,
      }),
    ).toBe(true)
    expect(
      canOpenInterviewEdit(
        interviewFixture({
          status: 'pending',
          answers: [submittedAnswerFixture()],
        }),
        { canAssignHr: true },
      ),
    ).toBe(true)
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

  it('allows delete only for completed or failed interviews', () => {
    expect(canDeleteInterview(interviewFixture({ status: 'completed' }))).toBe(
      true,
    )
    expect(canDeleteInterview(interviewFixture({ status: 'failed' }))).toBe(true)
    expect(canDeleteInterview(interviewFixture({ status: 'pending' }))).toBe(
      false,
    )
    expect(canDeleteInterview(interviewFixture({ status: 'in_progress' }))).toBe(
      false,
    )
    expect(canDeleteInterview(interviewFixture({ status: 'processing' }))).toBe(
      false,
    )
  })
})
