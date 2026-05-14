import createClient from 'openapi-fetch';
import { paths, components } from './api-types';
import { ApiError } from './api-error';

export { ApiError, isForbiddenError } from './api-error';

const client = createClient<paths>({
  baseUrl: '/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

type Schemas = components['schemas'];

export type QuestionDifficulty = Schemas['QuestionResponseDto']['difficulty'];
export type AuthUserResponseDto = Schemas['AuthUserResponseDto'];
export type MeResponse = AuthUserResponseDto;
export type LoginPayload = Schemas['LoginDto'];
export type LogoutResponse = Schemas['LogoutResponseDto'];
export type FeedbackResponse = Schemas['FeedbackResponseDto'];
export type QuestionRedFlagSeverity = Schemas['QuestionRedFlagDto']['severity'];

export type QuestionExpectedConcept = Schemas['QuestionExpectedConceptDto'];
export type QuestionRedFlag = Schemas['QuestionRedFlagDto'];

export type QuestionDraft = Schemas['QuestionDraftResponseDto'];
export type QuestionInput = Schemas['CreateQuestionDto'];
export type UpdateQuestionInput = Schemas['UpdateQuestionDto'];
export type Question = Schemas['QuestionResponseDto'];

export type InterviewQuestion = Schemas['InterviewResponseDto']['questions'][number];

export type CandidateQuestionView = Schemas['CandidateQuestionViewDto'];

export type InterviewBehaviorRisk = NonNullable<Schemas['InterviewResultResponseDto']['behaviorSummary']>['riskLevel'];
export type InterviewDecision = NonNullable<Schemas['InterviewResultResponseDto']['decision']>;
export type AnswerDecisionHint = NonNullable<Schemas['InterviewQuestionResultDto']['decisionHint']>;

export type AnswerStatus = NonNullable<Schemas['TakeInterviewResponseDto']['currentAnswerMeta']>['status'];
export type AnswerValidationStatus = Schemas['StartAllAnswerValidationsResponseDto']['answers'][number]['status'];

export type InterviewWorkflowStatus = NonNullable<Schemas['InterviewResponseDto']['workflow']>['status'];
export type InterviewWorkflowStage = NonNullable<Schemas['InterviewResponseDto']['workflow']>['currentStage'];

export type MediaArtifact = Schemas['MediaArtifactDto'];
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
export type StartAnswerValidationResult = Schemas['StartAnswerValidationResultDto'];
export type InterviewAnswerMediaResponse = Schemas['InterviewAnswerMediaResponseDto'];
export type CandidateLinkResponse = Schemas['CandidateLinkResponseDto'];

export type CreateInterviewPayload = Schemas['CreateInterviewDto'];

export type PresignedUrlResponse = Schemas['PresignedUrlResponseDto'];
export type ConfirmUploadResponse = Schemas['ConfirmUploadResponseDto'];

export type TakeInterviewData = Schemas['TakeInterviewResponseDto'];
export type MultipartUploadSessionResponse = Schemas['MultipartUploadSessionResponseDto'];
export type MultipartUploadPartResponse = Schemas['MultipartUploadPartResponseDto'];

export type TakeProgressPayload = Schemas['SaveAnswerProgressDto'];

export type SubmitTakeAnswerPayload = Schemas['SubmitAnswerDto'];

export type CaptureTarget = 'camera' | 'screen';

type ApiResult<T> = { data?: T; error?: unknown; response: Response };

function messageFromError(error: unknown, status: number): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.length > 0) {
      return maybeMessage;
    }
  }
  return `API error ${status}`;
}

function messageFromBody(body: string, status: number): string {
  const trimmed = body.trim();
  if (trimmed.length === 0) return `API error ${status}`;
  try {
    const parsed = JSON.parse(trimmed) as { message?: unknown };
    if (typeof parsed.message === 'string' && parsed.message.length > 0) {
      return parsed.message;
    }
  } catch {}
  return trimmed;
}

async function handle<T>(promise: Promise<ApiResult<T>>): Promise<T> {
  const { data, error, response } = await promise;

  if (error) {
    const message = messageFromError(error, response.status);
    const path = new URL(response.url).pathname;
    throw new ApiError(response.status, message, path);
  }

  if (data === undefined) {
    const path = new URL(response.url).pathname;
    throw new ApiError(response.status, `API error ${response.status}: Empty response body`, path);
  }

  return data;
}

async function postWithQuery<T>(
  path: string,
  query?: Record<string, string>,
): Promise<T> {
  const queryString = query ? '?' + new URLSearchParams(query).toString() : '';
  const res = await fetch(`/api${path}${queryString}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, messageFromBody(body, res.status), path, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export type TeamMember = Schemas['AuthUserResponseDto'];

export async function updateUserRole(
  id: string,
  role: 'super_admin' | 'admin' | 'hr' | 'candidate',
): Promise<TeamMember> {
  return handle(client.PATCH('/users/{id}/role', {
    params: { path: { id } },
    body: { role },
  }));
}

export async function fetchQuestions(): Promise<Question[]> {
  return handle(client.GET('/questions'));
}

export async function login(data: LoginPayload): Promise<AuthUserResponseDto> {
  return handle(client.POST('/auth/login', {
    body: data,
  }));
}

export async function getCurrentUser(): Promise<AuthUserResponseDto> {
  return handle(client.GET('/auth/me'));
}

export async function logout(): Promise<LogoutResponse> {
  return handle(client.POST('/auth/logout'));
}

export async function getFeedbackByToken(
  id: string,
  token: string,
): Promise<FeedbackResponse> {
  return handle(client.GET('/feedback/{id}', {
    params: {
      path: { id },
      query: { token },
    },
  }));
}

export async function getQuestion(id: string): Promise<Question> {
  return handle(client.GET('/questions/{id}', {
    params: { path: { id } }
  }));
}

export async function createQuestion(data: QuestionInput): Promise<Question> {
  return handle(client.POST('/questions', {
    body: data
  }));
}

export async function updateQuestion(
  id: string,
  data: UpdateQuestionInput,
): Promise<Question> {
  return handle(client.PATCH('/questions/{id}', {
    params: { path: { id } },
    body: data
  }));
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
  const { data, error, response } = await client.DELETE('/questions/{id}', {
    params: { path: { id } }
  });
  const status = response.status;
  const path = `/questions/${id}`;

  if (status === 409) {
    let message = 'Question is used by an active interview.';
    if (error && typeof error === 'object' && error !== null && 'message' in error) {
      const maybeMessage = (error as { message?: unknown }).message;
      if (typeof maybeMessage === 'string') {
        message = maybeMessage;
      }
    }
    throw new QuestionInUseError(message);
  }

  if (error) {
    throw new ApiError(status, messageFromError(error, status), path);
  }

  if (!data) {
    throw new ApiError(status, 'API error: Empty response body', path);
  }

  if (data.deleted !== true) {
    throw new Error('API error: delete response did not confirm deletion.');
  }

  return { id: data.id, deleted: true };

}

export async function restoreQuestion(id: string): Promise<Question> {
  return handle(client.PATCH('/questions/{id}/restore', {
    params: { path: { id } }
  }));
}

export type BulkDeleteResult = Schemas['BulkDeleteQuestionsResponseDto'];

export async function deleteQuestionsBulk(
  ids: string[],
): Promise<BulkDeleteResult> {
  return handle(client.POST('/questions/bulk-delete', {
    body: { ids }
  }));
}

export async function draftQuestion(
  question: Schemas['DraftQuestionDto']['question'],
): Promise<QuestionDraft> {
  return handle(client.POST('/ai/question-draft', {
    body: { question }
  }));
}

export type SimilarQuestionMatch = Schemas['SimilarQuestionMatchDto'];

export async function findSimilarQuestions(
  draft: Partial<QuestionInput>,
  excludeQuestionId?: string,
  limit = 5,
): Promise<SimilarQuestionMatch[]> {
  const data = await handle(client.POST('/questions/similar', {
    body: { draft: draft as Schemas['FindSimilarDraftDto'], excludeQuestionId, limit }
  }));
  return data.matches;
}

export async function fetchInterviews(): Promise<Interview[]> {
  return handle(client.GET('/interviews'));

}

export async function createInterview(
  data: CreateInterviewPayload,
): Promise<Interview & CandidateLinkResponse> {
  return handle(client.POST('/interviews', {
    body: data
  }));
}

export async function getInterview(id: string): Promise<Interview> {
  return handle(client.GET('/interviews/{id}', {
    params: { path: { id } }
  }));
}


export async function generateCandidateLink(
  id: string,
): Promise<CandidateLinkResponse> {
  return handle(client.POST('/interviews/{id}/candidate-link', {
    params: { path: { id } }
  }));
}


export async function getPresignedUrl(
  interviewId: string,
  questionIndex: number,
  contentType: 'video/webm',
  mediaType: CaptureTarget = 'camera',
): Promise<PresignedUrlResponse> {
  return handle(
    client.POST('/interviews/{id}/questions/{questionIndex}/upload-url', {
      params: { path: { id: interviewId, questionIndex } },
      body: { contentType, mediaType },
    }),
  );
}

export async function completeUpload(
  interviewId: string,
  questionIndex: number,
  mediaKey: string,
): Promise<ConfirmUploadResponse> {
  return handle(
    client.POST('/interviews/{id}/questions/{questionIndex}/complete-upload', {
      params: { path: { id: interviewId, questionIndex } },
      body: { mediaKey },
    }),
  );
}

export async function completeUploadAndFetchInterview(
  interviewId: string,
  questionIndex: number,
  mediaKey: string,
): Promise<Interview> {
  await completeUpload(interviewId, questionIndex, mediaKey);
  return getInterview(interviewId);
}

export async function completeInterview(id: string): Promise<Interview> {
  return handle(client.PATCH('/interviews/{id}/complete', {
    params: { path: { id } }
  }));
}

export async function validateInterview(
  id: string,
  options: { force?: boolean } = {},
): Promise<ValidateAllAnswersResponse> {
  return postWithQuery<ValidateAllAnswersResponse>(
    `/interviews/${encodeURIComponent(id)}/validate`,
    options.force ? { force: 'true' } : undefined,
  );
}

export async function validateInterviewQuestion(
  id: string,
  questionIndex: number,
  options: { force?: boolean } = {},
): Promise<StartAnswerValidationResult> {
  return postWithQuery<StartAnswerValidationResult>(
    `/interviews/${encodeURIComponent(id)}/questions/${questionIndex}/validate`,
    options.force ? { force: 'true' } : undefined,
  );
}

export async function getInterviewAnswerMedia(
  interviewId: string,
  questionIndex: number,
): Promise<InterviewAnswerMediaResponse> {
  return handle(client.GET('/interviews/{id}/questions/{questionIndex}/media', {
    params: { path: { id: interviewId, questionIndex } }
  }));
}

export async function getResults(id: string): Promise<InterviewResult> {
  return handle(client.GET('/interviews/{id}/results', {
    params: { path: { id } }
  }));
}

export async function getTakeInterview(
  id: string,
  token?: string,
): Promise<TakeInterviewData> {
  return handle(client.GET('/take/{id}', {
    params: {
      path: { id },
      query: token ? { token } : undefined
    }
  }));
}

export async function startMultipartUpload(
  questionIndex: number,
  mediaType: CaptureTarget,
  contentType: 'video/webm' = 'video/webm',
): Promise<MultipartUploadSessionResponse> {
  return handle(client.POST('/upload/multipart/start', {
    body: {
      questionIndex,
      contentType,
      mediaType,
    }
  }));
}

export async function sendTakeAnswerProgress(
  id: string,
  payload: TakeProgressPayload,
): Promise<void> {
  await handle(client.POST('/take/{id}/answer/progress', {
    params: { path: { id } },
    body: payload
  }));
}

export async function presignMultipartPart(
  questionIndex: number,
  mediaKey: string,
  uploadId: string,
  partNumber: number,
): Promise<MultipartUploadPartResponse> {
  return handle(client.POST('/upload/multipart/part', {
    body: {
      questionIndex,
      mediaKey,
      uploadId,
      partNumber,
    }
  }));
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
  await handle(client.POST('/upload/multipart/complete', {
    body: {
      questionIndex,
      mediaKey,
      uploadId,
    }
  }));
}

export async function abortMultipartUpload(
  questionIndex: number,
  mediaKey: string,
  uploadId: string,
): Promise<void> {
  await handle(client.POST('/upload/multipart/abort', {
    body: {
      questionIndex,
      mediaKey,
      uploadId,
    }
  }));
}

export async function submitTakeAnswer(
  id: string,
  payload: SubmitTakeAnswerPayload,
): Promise<void> {
  await handle(client.POST('/take/{id}/answer', {
    params: { path: { id } },
    body: payload
  }));
}
