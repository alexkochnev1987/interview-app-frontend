import { describe, expect, it } from 'vitest';

import {
  canStartNewAttempt,
  shouldSendAnswerProgressDuringRecording,
} from './attempt-limit';
import {
  resolveExhaustedHint,
  stageAfterInterviewLoad,
} from './session-machine';
import type { TakeInterviewData } from '@/lib/api';

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

describe('attempt helpers + resume UX', () => {
  it('gates new attempts on versionCount/maxAttempts and still allows progress on the final reserved attempt', () => {
    expect(canStartNewAttempt({ versionCount: 2, maxAttempts: 3 })).toBe(true);
    expect(canStartNewAttempt({ versionCount: 3, maxAttempts: 3 })).toBe(false);
    expect(shouldSendAnswerProgressDuringRecording(3, { versionCount: 3 })).toBe(true);
  });

  it('skips consent for returning sessions and maps exhausted submit hints', () => {
    expect(stageAfterInterviewLoad(interviewFixture(), 'initial')).toBe('consent');
    expect(stageAfterInterviewLoad(interviewFixture(), 'returning')).toBe('lobby');
    expect(
      resolveExhaustedHint({
        attemptsExhausted: true,
        recording: false,
        submitAllowed: true,
        serverHasMedia: true,
      }),
    ).toBe('submit');
    expect(
      resolveExhaustedHint({
        attemptsExhausted: true,
        recording: false,
        submitAllowed: false,
        serverHasMedia: false,
      }),
    ).toBe('no-media');
  });
});
