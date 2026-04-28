export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionRedFlagSeverity = 'low' | 'medium' | 'high';

export type InterviewBehaviorRisk = 'low' | 'medium' | 'high';
export type InterviewDecision = 'proceed' | 'review' | 'reject';
export type AnswerDecisionHint = 'pass' | 'review' | 'fail';
export type AnswerStatus = 'recording' | 'submitted';

export type InterviewWorkflowStatus =
  | 'idle'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

export type InterviewWorkflowStage =
  | 'validate_answers'
  | 'transcribe_audio'
  | 'analyze_answers'
  | 'aggregate_result'
  | 'store_result';
