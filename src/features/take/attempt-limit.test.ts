import { describe, expect, it } from 'vitest'

import type { TakeInterviewData } from '@/lib/api'

import { canStartNewAttempt, shouldReuseReservedAttemptForRetake } from './attempt-limit'
import {
  resolveQuestionAnswerPhase,
  shouldCleanupExhaustedSession,
  stageAfterInterviewLoad,
} from './session-machine'

function answerMetaFixture(
  overrides: Partial<NonNullable<TakeInterviewData['currentAnswerMeta']>> = {},
): NonNullable<TakeInterviewData['currentAnswerMeta']> {
  return {
    status: 'recording',
    versionCount: 0,
    selectedVersionNumber: 1,
    hasSubmittableMedia: false,
    latestSubmittableVersionNumber: null,
    ...overrides,
  }
}

function interviewFixture(overrides: Partial<TakeInterviewData> = {}): TakeInterviewData {
  return {
    id: 'interview-1',
    position: 'Engineer',
    interviewLocale: 'en',
    candidateName: 'Alex',
    status: 'in_progress',
    totalQuestions: 2,
    currentQuestionIndex: 0,
    maxAttempts: 3,
    completed: false,
    ...overrides,
  }
}

describe('take attempt UX', () => {
  it('gates new attempts and retake reuse vs advance when version already has media', () => {
    expect(canStartNewAttempt({ versionCount: 2, maxAttempts: 3 })).toBe(true)
    expect(canStartNewAttempt({ versionCount: 3, maxAttempts: 3 })).toBe(false)

    expect(
      shouldReuseReservedAttemptForRetake({
        currentVersionNumber: 1,
        hasSubmittableMedia: false,
        latestSubmittableVersionNumber: null,
        localVersionHasMedia: false,
      }),
    ).toBe(true)
    expect(
      shouldReuseReservedAttemptForRetake({
        currentVersionNumber: 1,
        hasSubmittableMedia: false,
        latestSubmittableVersionNumber: null,
        localVersionHasMedia: true,
      }),
    ).toBe(false)
    expect(
      shouldReuseReservedAttemptForRetake({
        currentVersionNumber: 2,
        hasSubmittableMedia: true,
        latestSubmittableVersionNumber: 2,
        localVersionHasMedia: false,
      }),
    ).toBe(false)
  })

  it('maps phases, reload staging, and never cleans up in-flight final attempt', () => {
    const recording = interviewFixture({
      currentAnswerMeta: answerMetaFixture({ versionCount: 1 }),
    })
    const reviewMid = interviewFixture({
      currentAnswerMeta: answerMetaFixture({
        versionCount: 3,
        hasSubmittableMedia: true,
        latestSubmittableVersionNumber: 2,
      }),
    })
    const blockedMid = interviewFixture({
      currentAnswerMeta: answerMetaFixture({ versionCount: 3 }),
    })
    const exhaustedLast = interviewFixture({
      currentQuestionIndex: 1,
      totalQuestions: 2,
      currentAnswerMeta: answerMetaFixture({
        versionCount: 3,
        hasSubmittableMedia: true,
        latestSubmittableVersionNumber: 3,
      }),
    })

    expect(resolveQuestionAnswerPhase(recording)).toBe('recording')
    expect(resolveQuestionAnswerPhase(reviewMid)).toBe('review')
    expect(resolveQuestionAnswerPhase(blockedMid)).toBe('blocked')

    expect(stageAfterInterviewLoad(interviewFixture(), 'initial')).toBe('consent')
    expect(stageAfterInterviewLoad(recording, 'returning')).toBe('lobby')
    expect(stageAfterInterviewLoad(reviewMid, 'returning')).toBe('lobby')
    expect(stageAfterInterviewLoad(exhaustedLast, 'returning')).toBe('interview')

    expect(
      shouldCleanupExhaustedSession({
        phase: 'review',
        recording: false,
        recordingStartBusy: true,
        hasActiveMultipart: true,
      }),
    ).toBe(false)
    expect(
      shouldCleanupExhaustedSession({
        phase: 'review',
        recording: true,
        recordingStartBusy: false,
        hasActiveMultipart: true,
      }),
    ).toBe(false)
    expect(
      shouldCleanupExhaustedSession({
        phase: 'review',
        recording: false,
        recordingStartBusy: false,
        hasActiveMultipart: false,
      }),
    ).toBe(true)
  })
})
