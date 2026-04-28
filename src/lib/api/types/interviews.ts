import type { Answer, InterviewBehaviorSummary, InterviewQuestionResult } from './answers';
import type {
  InterviewDecision,
  InterviewWorkflowStage,
  InterviewWorkflowStatus,
} from './common';
import type { InterviewQuestion } from './questions';

export interface InterviewResult {
  overallScore: number;
  summary: string;
  categoryScores: Record<string, number>;
  rubricVersion?: string;
  decision?: InterviewDecision;
  trustScore?: number;
  trustFlags?: string[];
  behaviorSummary?: InterviewBehaviorSummary;
  questionResults?: InterviewQuestionResult[];
  completedAt: string;
}

export interface InterviewWorkflow {
  status: InterviewWorkflowStatus;
  currentStage?: InterviewWorkflowStage;
  executionId?: string;
  startedAt?: string;
  completedAt?: string;
  lastUpdatedAt: string;
  errorMessage?: string;
}

export interface Interview {
  id: string;
  candidateName: string;
  position: string;
  questions: InterviewQuestion[];
  answers: Answer[];
  status: 'pending' | 'in_progress' | 'processing' | 'completed' | 'failed';
  result?: InterviewResult;
  workflow?: InterviewWorkflow;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewPayload {
  candidateName: string;
  position: string;
  questionIds: string[];
}
