import type { TakeInterviewData } from '@/lib/api';

export type Stage = 'loading' | 'consent' | 'interview' | 'recording' | 'transition' | 'complete';
export type PendingVersionAction = 'submit' | 'rerecord' | null;
type LoadMode = 'initial' | 'resume';

export function stageAfterInterviewLoad(
  interview: TakeInterviewData,
  mode: LoadMode,
): Stage {
  if (interview.completed) {
    return 'complete';
  }
  return mode === 'initial' ? 'consent' : 'interview';
}

export function canRequestVersionAction(params: {
  action: PendingVersionAction;
  uploading: boolean;
  recording: boolean;
}) {
  const { action, uploading, recording } = params;
  return Boolean(action && !uploading && recording);
}

export function transitionLabelForAction(action: Exclude<PendingVersionAction, null>) {
  return action === 'submit'
    ? 'Submitting answer and moving to the next question...'
    : 'Saving this version and starting a new recording...';
}

export function progressValueForStage(params: {
  interview: TakeInterviewData;
  stage: Stage;
}) {
  const { interview, stage } = params;
  if (interview.totalQuestions === 0) return 0;
  return Math.round(
    ((interview.currentQuestionIndex + (stage === 'complete' ? 1 : 0)) / interview.totalQuestions) *
      100,
  );
}
