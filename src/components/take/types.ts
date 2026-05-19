import type { TakeInterviewData } from '@/lib/api';

export type TakeStage =
  | 'loading'
  | 'consent'
  | 'lobby'
  | 'interview'
  | 'recording'
  | 'transition'
  | 'complete';

export type InterviewDataView = Pick<
  TakeInterviewData,
  'id' | 'position' | 'candidateName' | 'totalQuestions' | 'currentQuestion' | 'currentQuestionIndex' | 'currentAnswerMeta'
>;

export type PermissionStatus = 'idle' | 'pending' | 'granted' | 'denied';
