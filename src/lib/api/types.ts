export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionRedFlagSeverity = 'low' | 'medium' | 'high';

export interface QuestionExpectedConcept {
  id: string;
  label: string;
  weight: number;
  description: string;
}

export interface QuestionRedFlag {
  id: string;
  label: string;
  severity: QuestionRedFlagSeverity;
}

interface QuestionBase {
  externalId?: string;
  role?: string;
  focus?: string;
  outputLanguage: string;
  category?: string;
  subcategory?: string;
  questionText: string;
  followUpQuestions: string[];
  expectedConcepts: QuestionExpectedConcept[];
  redFlags: QuestionRedFlag[];
  difficulty: QuestionDifficulty;
  weight: number;
  sampleGoodAnswer?: string;
  minimumPassScore: number;
  tags: string[];
  metadata: Record<string, unknown>;
}

export type QuestionDraft = QuestionBase;

export type QuestionInput = QuestionBase;

export interface Question extends QuestionInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  externalId?: string;
  role?: string;
  focus?: string;
  outputLanguage: string;
  category?: string;
  subcategory?: string;
  questionText: string;
  followUpQuestions: string[];
  expectedConcepts: QuestionExpectedConcept[];
  redFlags: QuestionRedFlag[];
  difficulty: QuestionDifficulty;
  weight: number;
  sampleGoodAnswer?: string;
  minimumPassScore: number;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface CandidateQuestionView {
  text: string;
}

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

export interface PresignedUrlResponse {
  uploadUrl: string;
  mediaKey: string;
}

export interface SimilarQuestionMatch {
  question: Question;
  score: number;
  reasons: string[];
}
