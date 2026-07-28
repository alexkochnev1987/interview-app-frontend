import { describe, expect, it } from 'vitest';

import { canStartNewAttempt, shouldReuseReservedAttemptForRetake } from './attempt-limit';
import {
  resolveQuestionAnswerPhase,
  stageAfterInterviewLoad,
} from './session-machine';
import type { TakeInterviewData } from '@/lib/api';

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
  };
}

function interviewFixture(
  overrides: Partial<TakeInterviewData> = {},
): TakeInterviewData {
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
  };
}

describe('take attempt UX', () => {
  it('gates new attempts and retake reuse vs advance when version already has media', () => {
    expect(canStartNewAttempt({ versionCount: 2, maxAttempts: 3 })).toBe(true);
    expect(canStartNewAttempt({ versionCount: 3, maxAttempts: 3 })).toBe(false);

    expect(
      shouldReuseReservedAttemptForRetake({
        currentVersionNumber: 1,
        hasSubmittableMedia: false,
        latestSubmittableVersionNumber: null,
        localVersionHasMedia: false,
      }),
    ).toBe(true);
    expect(
      shouldReuseReservedAttemptForRetake({
        currentVersionNumber: 1,
        hasSubmittableMedia: false,
        latestSubmittableVersionNumber: null,
        localVersionHasMedia: true,
      }),
    ).toBe(false);
    expect(
      shouldReuseReservedAttemptForRetake({
        currentVersionNumber: 2,
        hasSubmittableMedia: true,
        latestSubmittableVersionNumber: 2,
        localVersionHasMedia: false,
      }),
    ).toBe(false);
    expect(
      shouldReuseReservedAttemptForRetake({
        currentVersionNumber: 2,
        hasSubmittableMedia: true,
        latestSubmittableVersionNumber: 1,
        localVersionHasMedia: false,
      }),
    ).toBe(true);
  });

  it('maps phases and returning reload stages for recording/review/blocked', () => {
    const recording = interviewFixture({
      currentAnswerMeta: answerMetaFixture({ versionCount: 1 }),
    });
    const reviewMid = interviewFixture({
      currentAnswerMeta: answerMetaFixture({
        versionCount: 3,
        hasSubmittableMedia: true,
        latestSubmittableVersionNumber: 2,
      }),
    });
    const reviewLast = interviewFixture({
      currentQuestionIndex: 1,
      totalQuestions: 2,
      currentAnswerMeta: answerMetaFixture({
        versionCount: 3,
        hasSubmittableMedia: true,
        latestSubmittableVersionNumber: 3,
      }),
    });
    const blockedMid = interviewFixture({
      currentAnswerMeta: answerMetaFixture({ versionCount: 3 }),
    });
    const blockedLast = interviewFixture({
      currentQuestionIndex: 1,
      totalQuestions: 2,
      currentAnswerMeta: answerMetaFixture({ versionCount: 3 }),
    });

    expect(resolveQuestionAnswerPhase(recording)).toBe('recording');
    expect(resolveQuestionAnswerPhase(reviewMid)).toBe('review');
    expect(resolveQuestionAnswerPhase(blockedMid)).toBe('blocked');

    expect(stageAfterInterviewLoad(interviewFixture(), 'initial')).toBe('consent');
    expect(stageAfterInterviewLoad(recording, 'returning')).toBe('lobby');
    // Exhausted mid-interview: lobby so devices are ready after Submit → next question.
    expect(stageAfterInterviewLoad(reviewMid, 'returning')).toBe('lobby');
    expect(stageAfterInterviewLoad(blockedMid, 'returning')).toBe('lobby');
    // Exhausted on last question: Submit finishes — skip lobby.
    expect(stageAfterInterviewLoad(reviewLast, 'returning')).toBe('interview');
    expect(stageAfterInterviewLoad(blockedLast, 'returning')).toBe('interview');
  });
});
