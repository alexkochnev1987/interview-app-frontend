import createClient from 'openapi-fetch';
import { paths, components } from './api-types';

const client = createClient<paths>({ 
  baseUrl: '/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

type Schemas = components['schemas'];

export type QuestionDifficulty = Schemas['QuestionResponseDto']['difficulty'];
export type AuthUserResponseDto = Schemas['AuthUserResponseDto'];
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
export type AnswerBehaviorSignals = Schemas['BehaviorSignalsDto'] & { copyCount?: number };
export type AnswerBehaviorEvent = Omit<Schemas['BehaviorEventDto'], 'eventType'> & { 
  eventType: Schemas['BehaviorEventDto']['eventType'] | 'copy' 
};
export type AnswerTranscript = Schemas['AnswerTranscriptDto'];
export type ClientTranscriptPayload = Schemas['ClientTranscriptDto'];
export type AnswerEvaluation = Schemas['AnswerEvaluationDto'];
export type AnswerValidation = Schemas['AnswerValidationDto'];
export type Answer = Omit<Schemas['AnswerDto'], 'behaviorSignals'> & {
  behaviorSignals?: AnswerBehaviorSignals;
};
export type AnswerVersion = Schemas['AnswerVersionDto'];

export type InterviewQuestionResult = Schemas['InterviewQuestionResultDto'];
export type InterviewBehaviorSummary = Schemas['InterviewBehaviorSummaryDto'];
export type InterviewResult = Schemas['InterviewResultResponseDto'];
export type InterviewWorkflow = Schemas['InterviewWorkflowDto'];
export type Interview = Omit<Schemas['InterviewResponseDto'], 'answers'> & {
  answers: Answer[];
};

export type ValidateAllAnswersResponse = Schemas['StartAllAnswerValidationsResponseDto'];
export type InterviewAnswerMediaResponse = Schemas['InterviewAnswerMediaResponseDto'];
export type CandidateLinkResponse = Schemas['CandidateLinkResponseDto'];

export type CreateInterviewPayload = Schemas['CreateInterviewDto'];

export type PresignedUrlResponse = Schemas['PresignedUrlResponseDto'];
export type ConfirmUploadResponse = Schemas['ConfirmUploadResponseDto'];

export type TakeInterviewData = Schemas['TakeInterviewResponseDto'];
export type MultipartUploadSessionResponse = Schemas['MultipartUploadSessionResponseDto'];
export type MultipartUploadPartResponse = Schemas['MultipartUploadPartResponseDto'];

export type TakeProgressPayload = Omit<Schemas['SaveAnswerProgressDto'], 'behaviorEvents'> & {
  behaviorEvents: AnswerBehaviorEvent[];
};

export type SubmitTakeAnswerPayload = Omit<Schemas['SubmitAnswerDto'], 'behaviorEvents'> & {
  behaviorEvents: AnswerBehaviorEvent[];
};

export type CaptureTarget = 'camera' | 'screen';

/**
 * Helper to handle openapi-fetch responses and throw errors on failure
 */
type ApiResult<T> = { data?: T; error?: unknown; response: Response };

async function handle<T>(promise: Promise<ApiResult<T>>): Promise<T> {
  const { data, error, response } = await promise;

  if (error) {
    let message = JSON.stringify(error);
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const maybeMessage = (error as { message?: unknown }).message;
      if (typeof maybeMessage === 'string') {
        message = maybeMessage;
      }
    }
    throw new Error(`API error ${response.status}: ${message}`);
  }

  if (data === undefined) {
    throw new Error(`API error ${response.status}: Empty response body`);
  }

  return data;
}

function createServerClient(origin: string, cookieHeader: string) {
  const serverFetch: typeof fetch = (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');
    headers.set('cookie', cookieHeader);

    return fetch(input, {
      ...init,
      cache: 'no-store',
      headers,
    });
  };

  return createClient<paths>({
    baseUrl: `${origin}/api`,
    fetch: serverFetch,
  });
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

  if (response.status === 409) {
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
    throw new Error(`API error ${response.status}: ${JSON.stringify(error)}`);
  }

  if (!data) {
    throw new Error('API error: Empty response body');
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
  const data = await handle(client.POST('/questions/similar', {
    body: { draft, excludeQuestionId, limit }
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

export async function getInterviewServer(
  id: string,
  origin: string,
  cookieHeader: string,
): Promise<Interview> {
  const serverClient = createServerClient(origin, cookieHeader);
  return handle(serverClient.GET('/interviews/{id}', {
    params: { path: { id } },
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
  questionIndex: number,
  contentType: 'video/webm',
  mediaType?: CaptureTarget,
): Promise<PresignedUrlResponse>;
export async function getPresignedUrl(
  interviewId: string,
  questionIndex: number,
  contentType: 'video/webm',
  mediaType?: CaptureTarget,
): Promise<PresignedUrlResponse>;
export async function getPresignedUrl(
  arg1: number | string,
  arg2: number | 'video/webm',
  arg3?: 'video/webm' | CaptureTarget,
  arg4?: CaptureTarget,
): Promise<PresignedUrlResponse> {
  const [resolvedQuestionIndex, resolvedContentType, resolvedMediaType] =
    typeof arg1 === 'string'
      ? [arg2 as number, arg3 as 'video/webm', arg4 ?? 'camera']
      : [arg1, arg2 as 'video/webm', (arg3 as CaptureTarget | undefined) ?? 'camera'];

  return handle(client.POST('/upload/presign', {
    body: {
      questionIndex: resolvedQuestionIndex,
      contentType: resolvedContentType,
      mediaType: resolvedMediaType,
    }
  }));
}

export async function completeUpload(
  questionIndex: number,
  mediaKey: string,
): Promise<ConfirmUploadResponse> {
  return handle(client.POST('/upload/complete', {
    body: { questionIndex, mediaKey }
  }));
}

export async function completeUploadAndFetchInterview(
  interviewId: string,
  questionIndex: number,
  mediaKey: string,
): Promise<Interview> {
  await completeUpload(questionIndex, mediaKey);
  return getInterview(interviewId);
}

export async function completeInterview(id: string): Promise<Interview> {
  return handle(client.PATCH('/interviews/{id}/complete', {
    params: { path: { id } }
  }));
}

export async function validateInterview(id: string): Promise<ValidateAllAnswersResponse> {
  return handle(client.POST('/interviews/{id}/validate', {
    params: { path: { id } }
  }));
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

export async function getResultsServer(
  id: string,
  origin: string,
  cookieHeader: string,
): Promise<InterviewResult> {
  const serverClient = createServerClient(origin, cookieHeader);
  return handle(serverClient.GET('/interviews/{id}/results', {
    params: { path: { id } },
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
