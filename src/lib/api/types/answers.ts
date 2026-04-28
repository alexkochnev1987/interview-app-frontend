import type { AnswerDecisionHint, InterviewBehaviorRisk, AnswerStatus } from './common';

export interface MediaArtifact {
  mediaKey: string;
  contentType: string;
  fileSizeBytes?: number;
  uploadedAt: string;
}

export interface AnswerBehaviorSignals {
  tabHiddenCount: number;
  windowBlurCount: number;
  pasteCount: number;
  keydownCount: number;
  resizeCount: number;
}

export interface AnswerBehaviorEvent {
  eventType: 'tab_hidden' | 'window_blur' | 'paste' | 'keydown' | 'resize';
  occurredAt: string;
  versionNumber: number;
}

export interface AnswerTranscript {
  text?: string;
  language?: string;
  provider?: string;
  generatedAt?: string;
}

export interface AnswerEvaluation {
  overallScore?: number;
  categoryScores?: Record<string, number>;
  coveredConceptIds?: string[];
  missedConceptIds?: string[];
  redFlagIds?: string[];
  behaviorRisk?: InterviewBehaviorRisk;
  summary?: string;
  decisionHint?: AnswerDecisionHint;
  evaluatedAt?: string;
}

export interface AnswerVersion {
  versionNumber: number;
  mediaKey: string;
  screenMediaKey?: string;
  uploadedAt: string;
  durationSeconds?: number;
  startedAt?: string;
  submittedAt?: string;
  camera?: MediaArtifact;
  screen?: MediaArtifact;
  behaviorSignals?: AnswerBehaviorSignals;
  behaviorEvents?: AnswerBehaviorEvent[];
}

export interface Answer {
  questionIndex: number;
  questionId: string;
  status: AnswerStatus;
  mediaKey: string;
  screenMediaKey?: string;
  uploadedAt: string;
  durationSeconds?: number;
  retakeCount?: number;
  startedAt?: string;
  submittedAt?: string;
  camera?: MediaArtifact;
  screen?: MediaArtifact;
  behaviorSignals?: AnswerBehaviorSignals;
  selectedVersionNumber?: number;
  versions?: AnswerVersion[];
  behaviorEvents?: AnswerBehaviorEvent[];
  transcript?: AnswerTranscript;
  evaluation?: AnswerEvaluation;
}

export interface InterviewQuestionResult {
  questionIndex: number;
  questionId: string;
  score?: number;
  categoryScores?: Record<string, number>;
  summary?: string;
  decisionHint?: AnswerDecisionHint;
}

export interface InterviewBehaviorSummary {
  riskLevel?: InterviewBehaviorRisk;
  notes: string[];
}
