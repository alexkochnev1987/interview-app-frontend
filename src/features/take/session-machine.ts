import type { TakeInterviewData } from '@/lib/api';
import type { TakeStage } from '@/components/take/types';

export type PendingVersionAction = 'submit' | 'rerecord' | null;
export type VersionPersistKind = Exclude<PendingVersionAction, null>;
type LoadMode = 'initial' | 'resume';

export function stageAfterInterviewLoad(
  interview: TakeInterviewData,
  mode: LoadMode,
): TakeStage {
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

export function progressValueForStage(params: {
  interview: TakeInterviewData;
  stage: TakeStage;
}) {
  const { interview, stage } = params;
  if (interview.totalQuestions === 0) return 0;
  return Math.round(
    ((interview.currentQuestionIndex + (stage === 'complete' ? 1 : 0)) / interview.totalQuestions) *
      100,
  );
}
