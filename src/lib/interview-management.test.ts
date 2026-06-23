import { describe, expect, it } from 'vitest'

import {
  canManageInterview,
  isPendingInterview,
} from '@/lib/interview-management'
import { interviewFixture } from '@/lib/test-fixtures/interview'

describe('interview-management', () => {
  it('detects pending interviews', () => {
    expect(isPendingInterview(interviewFixture({ status: 'pending' }))).toBe(true)
    expect(isPendingInterview(interviewFixture({ status: 'in_progress' }))).toBe(
      false,
    )
    expect(isPendingInterview(interviewFixture({ status: 'canceled' }))).toBe(false)
  })

  it('allows management only for pending interviews', () => {
    expect(canManageInterview(interviewFixture({ status: 'pending' }))).toBe(true)
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
    expect(canManageInterview(interviewFixture({ status: 'canceled' }))).toBe(false)
  })
})
