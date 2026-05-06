import { components } from './api-types';

const API_URL = '/api';

type Schemas = components['schemas'];

export type QuestionDifficulty = Schemas['QuestionResponseDto']['difficulty'];
export type AuthUserResponseDto = Schemas['AuthUserResponseDto'];
export type QuestionRedFlagSeverity = Schemas['QuestionRedFlagDto']['severity'];

export type QuestionExpectedConcept = Schemas['QuestionExpectedConceptDto'];
export type QuestionRedFlag = Schemas['QuestionRedFlagDto'];

export type QuestionDraft = Schemas['QuestionDraftResponseDto'];
export type QuestionInput = Schemas['CreateQuestionDto'];
export type Question = Schemas['QuestionResponseDto'];

export type InterviewQuestion = Schemas['InterviewResponseDto']['questions'][number];

export type CandidateQuestionView = Schemas['CandidateQuestionViewDto'];

export type InterviewBehaviorRisk = NonNullable<Schemas['InterviewResultResponseDto']['behaviorSummary']>['riskLevel'] & string;
export type InterviewDecision = NonNullable<Schemas['InterviewResultResponseDto']['decision']>;
export type AnswerDecisionHint = NonNullable<Schemas['InterviewQuestionResultDto']['decisionHint']>;

export type AnswerStatus = Schemas['TakeInterviewResponseDto']['currentAnswerMeta'] extends { status: infer S } ? S : string;
export type AnswerValidationStatus = Schemas['StartAllAnswerValidationsResponseDto']['answers'][number]['status'];

export type InterviewWorkflowStatus = Schemas['InterviewResponseDto']['workflow'] extends { status: infer S } ? S : string;
export type InterviewWorkflowStage = Schemas['InterviewResponseDto']['workflow'] extends { currentStage?: infer S } ? S : string;

export type MediaArtifact = Schemas['MediaArtifactDto'];
export type AnswerBehaviorSignals = Schemas['BehaviorSignalsDto'];
export type AnswerBehaviorEvent = Schemas['BehaviorEventDto'];
export type AnswerTranscript = Schemas['AnswerTranscriptDto'];
export type ClientTranscriptPayload = Schemas['ClientTranscriptDto'];
export type AnswerEvaluation = Schemas['AnswerEvaluationDto'];
export type AnswerValidation = Schemas['AnswerValidationDto'];
export type Answer = Schemas['AnswerDto'];
export type AnswerVersion = Schemas['AnswerVersionDto'];

export type InterviewQuestionResult = Schemas['InterviewQuestionResultDto'];
export type InterviewBehaviorSummary = Schemas['InterviewBehaviorSummaryDto'];
export type InterviewResult = Schemas['InterviewResultResponseDto'];
export type InterviewWorkflow = Schemas['InterviewWorkflowDto'];
export type Interview = Schemas['InterviewResponseDto'];

export type ValidateAllAnswersResponse = Schemas['StartAllAnswerValidationsResponseDto'];
export type InterviewAnswerMediaResponse = Schemas['InterviewAnswerMediaResponseDto'];
export type CandidateLinkResponse = Schemas['CandidateLinkResponseDto'];

export interface CreateInterviewPayload {
  candidateName: string;
  position: string;
  questionIds: string[];
}

export type PresignedUrlResponse = Schemas['PresignedUrlResponseDto'];

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
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

export type BulkDeleteResult = Schemas['BulkDeleteQuestionsResponseDto'];

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
  return request<ValidateAllAnswersResponse>(`/interviews/${id}/validate`, {
    method: 'POST',
  });
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

export type TakeInterviewData = Schemas['TakeInterviewResponseDto'];

export type MultipartUploadSessionResponse = Schemas['MultipartUploadSessionResponseDto'];

export type MultipartUploadPartResponse = Schemas['MultipartUploadPartResponseDto'];

export type TakeProgressPayload = Schemas['SaveAnswerProgressDto'];

export type SubmitTakeAnswerPayload = Schemas['SubmitAnswerDto'];

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
