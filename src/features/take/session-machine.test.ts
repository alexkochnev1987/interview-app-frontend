import { describe, expect, it } from 'vitest';

import type { TakeInterviewData } from '@/lib/api';

import {
  canRequestVersionAction,
  progressValueForStage,
  stageAfterInterviewLoad,
  transitionLabelForAction,
} from './session-machine';

function makeInterview(overrides: Partial<TakeInterviewData> = {}): TakeInterviewData {
  return {
    id: 'i1',
    position: 'Frontend',
    candidateName: 'Test',
    totalQuestions: 4,
    currentQuestion: { text: 'Q1' },
    currentQuestionIndex: 1,
    currentAnswerMeta: null,
    completed: false,
    ...overrides,
  };
}

describe('take session machine', () => {
  it('calculates stage after interview load', () => {
    expect(stageAfterInterviewLoad(makeInterview({ completed: true }), 'initial')).toBe('complete');
    expect(stageAfterInterviewLoad(makeInterview(), 'initial')).toBe('consent');
    expect(stageAfterInterviewLoad(makeInterview(), 'resume')).toBe('interview');
  });

  it('guards version actions by recording/upload state', () => {
    expect(canRequestVersionAction({ action: 'submit', uploading: false, recording: true })).toBe(true);
    expect(canRequestVersionAction({ action: null, uploading: false, recording: true })).toBe(false);
    expect(canRequestVersionAction({ action: 'submit', uploading: true, recording: true })).toBe(false);
    expect(canRequestVersionAction({ action: 'rerecord', uploading: false, recording: false })).toBe(false);
  });

  it('returns transition labels for critical commands', () => {
    expect(transitionLabelForAction('submit')).toContain('Submitting answer');
    expect(transitionLabelForAction('rerecord')).toContain('starting a new recording');
  });

  it('computes progress value by stage', () => {
    const interview = makeInterview({ currentQuestionIndex: 1, totalQuestions: 4 });
    expect(progressValueForStage({ interview, stage: 'interview' })).toBe(25);
    expect(progressValueForStage({ interview, stage: 'complete' })).toBe(50);
  });
});
