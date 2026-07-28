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
    const review = interviewFixture({
      currentAnswerMeta: answerMetaFixture({
        versionCount: 3,
        hasSubmittableMedia: true,
        latestSubmittableVersionNumber: 2,
      }),
    });
    const blocked = interviewFixture({
      currentAnswerMeta: answerMetaFixture({ versionCount: 3 }),
    });

    expect(resolveQuestionAnswerPhase(recording)).toBe('recording');
    expect(resolveQuestionAnswerPhase(review)).toBe('review');
    expect(resolveQuestionAnswerPhase(blocked)).toBe('blocked');

    expect(stageAfterInterviewLoad(interviewFixture(), 'initial')).toBe('consent');
    expect(stageAfterInterviewLoad(recording, 'returning')).toBe('lobby');
    expect(stageAfterInterviewLoad(review, 'returning')).toBe('interview');
    expect(stageAfterInterviewLoad(blocked, 'returning')).toBe('interview');
  });
});
