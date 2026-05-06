import { ApiError } from './api-error';

export { ApiError, isForbiddenError } from './api-error';

const API_URL = '/api';

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

export interface QuestionDraft {
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

export interface QuestionInput {
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

export interface Question extends QuestionInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
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
export type AnswerValidationStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
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
  provider?: 'browser-web-speech' | 'whisper';
  generatedAt?: string;
  isFinal?: boolean;
}

export interface ClientTranscriptPayload {
  text: string;
  language: string;
  provider: 'browser-web-speech' | 'whisper';
  generatedAt: string;
  isFinal: boolean;
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

export interface AnswerValidation {
  status: AnswerValidationStatus;
  executionArn?: string;
  sourceVersionNumber?: number;
  requestedAt?: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
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
  validation?: AnswerValidation;
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

export interface ValidateAllAnswersResponse {
  ok: true;
  interviewId: string;
  requestedCount: number;
  queuedCount: number;
  reusedCount: number;
  skippedCount: number;
  answers: Array<{
    status: AnswerValidationStatus;
    questionIndex: number;
    sourceVersionNumber: number;
    reused: boolean;
  }>;
}

export interface InterviewAnswerMediaResponse {
  questionIndex: number;
  cameraUrl?: string;
  screenUrl?: string;
}

export interface CandidateLinkResponse {
  candidateLink: string;
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

export interface MeResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

function extractApiMessage(status: number, body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return `API error ${status}`;
  try {
    const parsed = JSON.parse(trimmed) as { message?: unknown };
    if (typeof parsed.message === 'string' && parsed.message.length > 0) {
      return parsed.message;
    }
  } catch {}
  return `API error ${status}: ${trimmed}`;
}

const REQUEST_TIMEOUT_MS = 30_000;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { signal, headers, ...rest } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...headers },
    signal: signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, extractApiMessage(res.status, body), path, body);
  }

  const body = await res.text();
  if (!body) return undefined as T;
  return JSON.parse(body) as T;
}

export async function fetchQuestions(): Promise<Question[]> {
  return request<Question[]>('/questions');
}

export async function getQuestion(id: string): Promise<Question> {
  return request<Question>(`/questions/${id}`);
}

export async function createQuestion(data: QuestionInput): Promise<Question> {
  return request<Question>('/questions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateQuestion(
  id: string,
  data: QuestionInput,
): Promise<Question> {
  return request<Question>(`/questions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export class QuestionInUseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuestionInUseError';
  }
}

export async function deleteQuestion(
  id: string,
): Promise<{ id: string; deleted: true }> {
  const res = await fetch(`${API_URL}/questions/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.status === 409) {
    const body = await res.text();
    let message = 'Question is used by an active interview.';
    try {
      const parsed = JSON.parse(body) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {}
    throw new QuestionInUseError(message);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<{ id: string; deleted: true }>;
}

export async function restoreQuestion(id: string): Promise<Question> {
  return request<Question>(`/questions/${id}/restore`, {
    method: 'PATCH',
  });
}

export interface BulkDeleteResult {
  deleted: string[];
  blocked: Array<{ id: string; questionText: string; reason: string }>;
}

export async function deleteQuestionsBulk(
  ids: string[],
): Promise<BulkDeleteResult> {
  return request<BulkDeleteResult>('/questions/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export async function draftQuestion(
  question: Partial<QuestionInput>,
): Promise<QuestionDraft> {
  return request<QuestionDraft>('/ai/question-draft', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

export interface SimilarQuestionMatch {
  question: Question;
  score: number;
  reasons: string[];
}

export async function findSimilarQuestions(
  draft: Partial<QuestionInput>,
  excludeQuestionId?: string,
  limit = 5,
): Promise<SimilarQuestionMatch[]> {
  const res = await request<{ matches: SimilarQuestionMatch[] }>(
    '/questions/similar',
    {
      method: 'POST',
      body: JSON.stringify({ draft, excludeQuestionId, limit }),
    },
  );
  return res.matches;
}

export async function fetchInterviews(): Promise<Interview[]> {
  return request<Interview[]>('/interviews');
}

export async function createInterview(
  data: CreateInterviewPayload,
): Promise<Interview & CandidateLinkResponse> {
  return request<Interview & CandidateLinkResponse>('/interviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getInterview(id: string): Promise<Interview> {
  return request<Interview>(`/interviews/${id}`);
}

export async function generateCandidateLink(
  id: string,
): Promise<CandidateLinkResponse> {
  return request<CandidateLinkResponse>(`/interviews/${id}/candidate-link`, {
    method: 'POST',
  });
}

export async function getPresignedUrl(
  interviewId: string,
  questionIndex: number,
  contentType: string,
): Promise<PresignedUrlResponse> {
  return request<PresignedUrlResponse>(
    `/interviews/${interviewId}/questions/${questionIndex}/upload-url`,
    {
      method: 'POST',
      body: JSON.stringify({ contentType }),
    },
  );
}

export async function completeUpload(
  interviewId: string,
  questionIndex: number,
  mediaKey: string,
): Promise<Interview> {
  return request<Interview>(
    `/interviews/${interviewId}/questions/${questionIndex}/complete-upload`,
    {
      method: 'POST',
      body: JSON.stringify({ mediaKey }),
    },
  );
}

export async function completeInterview(id: string): Promise<Interview> {
  return request<Interview>(`/interviews/${id}/complete`, {
    method: 'PATCH',
  });
}

export async function validateInterview(id: string): Promise<ValidateAllAnswersResponse> {
  return request<ValidateAllAnswersResponse>(
    `/interviews/${encodeURIComponent(id)}/validate`,
    { method: 'POST' },
  );
}

export async function validateInterviewQuestion(
  id: string,
  questionIndex: number,
): Promise<ValidateAllAnswersResponse> {
  return request<ValidateAllAnswersResponse>(
    `/interviews/${encodeURIComponent(id)}/questions/${questionIndex}/validate`,
    { method: 'POST' },
  );
}

export async function getInterviewAnswerMedia(
  interviewId: string,
  questionIndex: number,
): Promise<InterviewAnswerMediaResponse> {
  return request<InterviewAnswerMediaResponse>(
    `/interviews/${interviewId}/questions/${questionIndex}/media`,
  );
}

export async function getResults(id: string): Promise<InterviewResult> {
  return request<InterviewResult>(`/interviews/${id}/results`);
}

type CaptureTarget = 'camera' | 'screen';

export interface TakeInterviewData {
  id: string;
  position: string;
  candidateName: string;
  totalQuestions: number;
  currentQuestion: { text: string } | null;
  currentQuestionIndex: number;
  currentAnswerMeta: {
    status: 'recording' | 'submitted';
    versionCount: number;
    selectedVersionNumber: number;
  } | null;
  completed: boolean;
}

export interface MultipartUploadSessionResponse {
  mediaKey: string;
  uploadId: string;
}

export interface MultipartUploadPartResponse {
  mediaKey: string;
  uploadId: string;
  partNumber: number;
  uploadUrl: string;
}

export interface TakeProgressPayload {
  questionIndex: number;
  versionNumber: number;
  mediaKey: string;
  screenMediaKey?: string;
  durationSeconds?: number;
  startedAt?: string;
  submittedAt?: string;
  cameraFileSizeBytes?: number;
  screenFileSizeBytes?: number;
  behaviorSignals: AnswerBehaviorSignals;
  behaviorEvents: AnswerBehaviorEvent[];
  clientTranscript?: ClientTranscriptPayload;
}

export interface SubmitTakeAnswerPayload extends TakeProgressPayload {
  submitAnswer: boolean;
}

export async function getTakeInterview(
  id: string,
  token?: string,
): Promise<TakeInterviewData> {
  const query = token ? `?token=${encodeURIComponent(token)}` : '';
  return request<TakeInterviewData>(`/take/${id}${query}`);
}

export async function startMultipartUpload(
  questionIndex: number,
  mediaType: CaptureTarget,
): Promise<MultipartUploadSessionResponse> {
  return request<MultipartUploadSessionResponse>('/upload/multipart/start', {
    method: 'POST',
    body: JSON.stringify({
      questionIndex,
      contentType: 'video/webm',
      mediaType,
    }),
  });
}

export async function sendTakeAnswerProgress(
  id: string,
  payload: TakeProgressPayload,
): Promise<void> {
  await request<void>(`/take/${id}/answer/progress`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function presignMultipartPart(
  questionIndex: number,
  mediaKey: string,
  uploadId: string,
  partNumber: number,
): Promise<MultipartUploadPartResponse> {
  return request<MultipartUploadPartResponse>('/upload/multipart/part', {
    method: 'POST',
    body: JSON.stringify({
      questionIndex,
      mediaKey,
      uploadId,
      partNumber,
    }),
  });
}

export async function uploadMultipartPart(uploadUrl: string, partBlob: Blob): Promise<void> {
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: partBlob,
    headers: { 'Content-Type': 'video/webm' },
  });
  if (!uploadResponse.ok) {
    throw new Error('Chunk upload failed for recording.');
  }
}

export async function completeMultipartUpload(
  questionIndex: number,
  mediaKey: string,
  uploadId: string,
): Promise<void> {
  await request<void>('/upload/multipart/complete', {
    method: 'POST',
    body: JSON.stringify({
      questionIndex,
      mediaKey,
      uploadId,
    }),
  });
}

export async function abortMultipartUpload(
  questionIndex: number,
  mediaKey: string,
  uploadId: string,
): Promise<void> {
  await request<void>('/upload/multipart/abort', {
    method: 'POST',
    body: JSON.stringify({
      questionIndex,
      mediaKey,
      uploadId,
    }),
  });
}

export async function submitTakeAnswer(
  id: string,
  payload: SubmitTakeAnswerPayload,
): Promise<void> {
  await request<void>(`/take/${id}/answer`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
