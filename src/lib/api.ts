import createClient from 'openapi-fetch';
import { paths, components } from './api-types';
import { ApiError, QuestionInUseError } from './api-error';
import { extractApiErrorFields, extractApiErrorFieldsFromBody } from './api-error-fields';
import { normalizeInterviewsResponse } from './interviews-response';
import { buildApiLocaleHeaders, resolveApiLocale } from './api-locale';
import {
  buildGenerateDraftRequestPayload,
  buildTranslateDraftRequestPayload,
} from './question-editor/ai-draft-request';
import { LOCALES, type Locale } from '@/i18n/locales';
import {
  createEmptyCandidateFeedback,
  mapCandidateFeedbackFromApi,
  parseCandidateFeedbackBody,
  parseGenerateAllCandidateFeedbackPostBody,
  type ApiCandidateFeedbackDto,
  type CandidateFeedbackResponse,
  type GenerateAllCandidateFeedbackOutcome,
  type GenerateAllCandidateFeedbackPlan,
  type UpdateCandidateFeedbackPayload,
} from './candidate-feedback';

export { ApiError, QuestionInUseError } from './api-error';
export { resolveApiLocale } from './api-locale';
export type LocaleCode = Locale;

function getInitialClientApiLocale(): LocaleCode {
  if (typeof document === 'undefined') {
    return resolveApiLocale();
  }
  return resolveApiLocale(document.documentElement.lang);
}

let clientApiLocale = getInitialClientApiLocale();

export function setClientApiLocale(locale?: string | null): void {
  clientApiLocale = resolveApiLocale(locale);
}

const client = createClient<paths>({
  baseUrl: '/api',
  credentials: 'include',
});

function buildClientApiHeaders(headers?: HeadersInit): Headers {
  return buildApiLocaleHeaders(clientApiLocale, {
    'Content-Type': 'application/json',
    ...headers,
  });
}

function buildClientBaseHeaders(headers?: HeadersInit): Headers {
  return new Headers({
    'Content-Type': 'application/json',
    ...headers,
  });
}

function fetchClientApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    credentials: 'include',
    ...init,
    headers: buildClientApiHeaders(init?.headers),
  });
}

const LOCALIZED_HEADERS = {
  get headers() {
    return buildClientApiHeaders();
  },
} as const;

type Schemas = components['schemas'];

export type QuestionDifficulty = Schemas['ResolvedQuestionResponseDto']['difficulty'];
export type AuthUserResponseDto = Schemas['AuthUserResponseDto'];
export type MeResponse = AuthUserResponseDto;
export type LoginPayload = Schemas['LoginDto'];
export type LogoutResponse = Schemas['LogoutResponseDto'];
export type CompleteOnboardingStatus = 'completed' | 'skipped';
export type FeedbackResponse = Schemas['FeedbackResponseDto'];

export type QuestionExpectedConcept = Schemas['QuestionExpectedConceptDto'];
export type QuestionRedFlag = Schemas['QuestionRedFlagDto'];

export type QuestionDraft = Schemas['QuestionDraftContentResponseDto'];
export type QuestionGenerateDraft = Schemas['QuestionDraftGenerateResponseDto'];
type LocaleQuestionTranslation = Schemas['QuestionTranslationDto'];
type LocalizedQuestionTranslations =
  Schemas['CreateQuestionDto']['translations'] &
  Partial<Record<LocaleCode, LocaleQuestionTranslation>>;
export type QuestionInput = {
  primaryLocale?: Locale;
  translations?: LocalizedQuestionTranslations;
  externalId?: string;
  role?: string;
  focus?: string;
  category?: string;
  subcategory?: string;
  questionText: string;
  followUpQuestions?: string[];
  expectedConcepts?: QuestionExpectedConcept[];
  redFlags?: QuestionRedFlag[];
  difficulty?: "easy" | "medium" | "hard";
  weight?: number;
  sampleGoodAnswer?: string;
  minimumPassScore?: number;
  tags?: string[];
  metadata?: {
    [key: string]: unknown;
  };
};
export type UpdateQuestionInput = Partial<QuestionInput> & {
  translationsMode?: "merge" | "replace";
};
export type Question = Omit<
  Schemas['ResolvedQuestionResponseDto'],
  'resolvedLocale' | 'availableLocales' | 'expectedConcepts' | 'redFlags'
> & {
  resolvedLocale?: Schemas['ResolvedQuestionResponseDto']['resolvedLocale'];
  availableLocales?: Schemas['ResolvedQuestionResponseDto']['availableLocales'];
  expectedConcepts: QuestionExpectedConcept[];
  redFlags: QuestionRedFlag[];
  pendingDeletion?: Schemas['QuestionResponseDto']['pendingDeletion'];
  blockingInterviews?: Schemas['QuestionResponseDto']['blockingInterviews'];
};
export type PaginatedQuestions = Schemas['PaginatedQuestionsResponseDto'];
export type QuestionFacetsResponse = Schemas['QuestionFacetsResponseDto'];
export type FetchQuestionsParams = NonNullable<paths['/questions']['get']['parameters']['query']>;
export type QuestionSortField = NonNullable<FetchQuestionsParams['sortBy']>;
export type QuestionSortOrder = NonNullable<FetchQuestionsParams['sortOrder']>;
export type QuestionStatusFilter = NonNullable<FetchQuestionsParams['status']>;

export type InterviewQuestion = Question;

export type InterviewBehaviorRisk = NonNullable<Schemas['InterviewResultResponseDto']['behaviorSummary']>['riskLevel'];
export type InterviewDecision = NonNullable<Schemas['InterviewResultResponseDto']['decision']>;
export type AnswerDecisionHint = NonNullable<Schemas['InterviewQuestionResultDto']['decisionHint']>;

export type ClientTranscriptPayload = Schemas['ClientTranscriptDto'];
export type Answer = Schemas['AnswerDto'];

export type InterviewResult = Schemas['InterviewResultResponseDto'];
export type Interview = Schemas['InterviewResponseDto'];
export type UpdateInterviewPayload = Schemas['UpdateInterviewDto'];
export type InterviewStatus = Interview['status'];

type ValidateAllAnswersResponse = Schemas['StartAllAnswerValidationsResponseDto'];
export type StartAnswerValidationResult = Schemas['StartAnswerValidationResultDto'];
export type InterviewAnswerMediaResponse = Schemas['InterviewAnswerMediaResponseDto'];
export type CandidateLinkResponse = Schemas['CandidateLinkResponseDto'];
export type FeedbackLinkResponse = Schemas['FeedbackLinkResponseDto'];
export type InterviewCancelResponse = Schemas['InterviewCancelResponseDto'];
export type InterviewDeleteResponse = Schemas['InterviewDeleteResponseDto'];

export type InterviewListItem = Schemas['InterviewListItemDto'];
export type PaginatedInterviews = Schemas['PaginatedInterviewsResponseDto'];
export type InterviewFacetsResponse = Schemas['InterviewFacetsResponseDto'];
export type InterviewFacetCount = Schemas['InterviewFacetCountDto'];
export type FetchInterviewsParams = NonNullable<
  paths['/interviews']['get']['parameters']['query']
>;
export type InterviewSortField = NonNullable<FetchInterviewsParams['sortBy']>;
export type InterviewSortOrder = NonNullable<FetchInterviewsParams['sortOrder']>;
export type InterviewStatusFilter = NonNullable<FetchInterviewsParams['status']>;
export type FetchInterviewFacetsParams = NonNullable<
  paths['/interviews/facets']['get']['parameters']['query']
>;

export type CreateInterviewPayload = Schemas['CreateInterviewDto'];

export type PresignedUrlResponse = Schemas['PresignedUrlResponseDto'];

export type TakeInterviewData = Schemas['TakeInterviewResponseDto'];
export type MultipartUploadSessionResponse = Schemas['MultipartUploadSessionResponseDto'];
export type MultipartUploadPartResponse = Schemas['MultipartUploadPartResponseDto'];

export type TakeProgressPayload = Schemas['SaveAnswerProgressDto'];
export type TakeProgressResponse = Schemas['SaveTakeAnswerProgressResponseDto'];

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
    const { code, params } = extractApiErrorFields(error);
    throw new ApiError(response.status, message, path, undefined, code, params);
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
  const res = await fetchClientApi(`/api${path}${queryString}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const body = await res.text();
    const { code, params } = extractApiErrorFieldsFromBody(body);
    throw new ApiError(res.status, messageFromBody(body, res.status), path, body, code, params);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

function normalizeTranslations(
  translations?: LocalizedQuestionTranslations,
): Schemas['CreateQuestionDto']['translations'] | Schemas['UpdateQuestionDto']['translations'] | undefined {
  if (!translations) return undefined;

  const entries = Object.entries(translations).filter(([locale]) =>
    (LOCALES as readonly string[]).includes(locale),
  );
  if (entries.length === 0) return undefined;

  return Object.fromEntries(entries);
}

function toCreateQuestionDto(data: QuestionInput): Schemas['CreateQuestionDto'] {
  const {
    primaryLocale,
    translations,
    externalId,
    role,
    focus,
    category,
    subcategory,
    difficulty,
    weight,
    minimumPassScore,
    tags,
    metadata,
  } = data;

  return {
    primaryLocale: primaryLocale ?? resolveApiLocale(),
    translations: normalizeTranslations(translations) ?? {},
    externalId,
    role,
    focus,
    category,
    subcategory,
    difficulty,
    weight,
    minimumPassScore,
    tags,
    metadata,
  };
}

function toUpdateQuestionDto(data: UpdateQuestionInput): Schemas['UpdateQuestionDto'] {
  const {
    primaryLocale,
    translationsMode,
    translations,
    externalId,
    role,
    focus,
    category,
    subcategory,
    difficulty,
    weight,
    minimumPassScore,
    tags,
    metadata,
  } = data;

  return {
    primaryLocale,
    translationsMode: translationsMode ?? 'merge',
    translations: normalizeTranslations(translations),
    externalId,
    role,
    focus,
    category,
    subcategory,
    difficulty,
    weight,
    minimumPassScore,
    tags,
    metadata,
  };
}

export type TeamMember = Schemas['AuthUserResponseDto'];

export type FetchUsersParams = NonNullable<paths['/users']['get']['parameters']['query']>;

export type AssignedHr = Schemas['AssignedHrDto'];

export async function fetchUsers(
  params?: FetchUsersParams,
  init?: { signal?: AbortSignal },
): Promise<TeamMember[]> {
  return handle(
    client.GET('/users', {
      ...LOCALIZED_HEADERS,
      params: { query: params ?? {} },
      signal: init?.signal,
    }),
  );
}

export async function fetchHrUsers(
    init?: { signal?: AbortSignal },
): Promise<AssignedHr[]> {
  const pageSize = 200
  const hrUsers: AssignedHr[] = []
  let offset = 0

  while (true) {
    const users = await fetchUsers({ limit: pageSize, offset, role: 'hr' }, init)
    hrUsers.push(
      ...users.map(({ id, name, email }) => ({ id, name, email })),
    )
    if (users.length < pageSize) break
    offset += pageSize
  }

  return hrUsers
}

export async function updateUserRole(
  id: string,
  role: 'super_admin' | 'admin' | 'hr' | 'candidate',
): Promise<TeamMember> {
  return handle(client.PATCH('/users/{id}/role', {
    ...LOCALIZED_HEADERS,
    params: { path: { id } },
    body: { role },
  }));
}

export async function fetchQuestions(
  params?: FetchQuestionsParams,
  init?: { signal?: AbortSignal },
): Promise<PaginatedQuestions> {
  return handle(
    client.GET('/questions', {
      ...LOCALIZED_HEADERS,
      params: { query: params ?? {} },
      signal: init?.signal,
    }),
  );
}

export type FetchQuestionFacetsParams = NonNullable<
  paths['/questions/facets']['get']['parameters']['query']
>;

export type FacetCount = Schemas['FacetCountDto'];

export async function fetchQuestionFacets(
  params?: FetchQuestionFacetsParams,
  init?: { signal?: AbortSignal },
): Promise<QuestionFacetsResponse> {
  return handle(
    client.GET('/questions/facets', {
      ...LOCALIZED_HEADERS,
      params: { query: params ?? {} },
      signal: init?.signal,
    }),
  );
}

export async function login(data: LoginPayload): Promise<AuthUserResponseDto> {
  return handle(client.POST('/auth/login', {
    ...LOCALIZED_HEADERS,
    body: data,
  }));
}

export async function demoLogin(): Promise<AuthUserResponseDto> {
  return handle(client.POST('/auth/demo', LOCALIZED_HEADERS));
}

export async function logout(): Promise<LogoutResponse> {
  return handle(client.POST('/auth/logout', LOCALIZED_HEADERS));
}

export async function completeOnboarding(): Promise<AuthUserResponseDto> {
  return handle(
    client.PATCH('/auth/me/onboarding', {
      ...LOCALIZED_HEADERS,
    }),
  );
}

export async function createQuestion(data: QuestionInput): Promise<Question> {
  return handle(client.POST('/questions', {
    ...LOCALIZED_HEADERS,
    body: toCreateQuestionDto(data),
  }));
}

export async function updateQuestion(
  id: string,
  data: UpdateQuestionInput,
): Promise<Question> {
  return handle(client.PUT('/questions/{id}', {
    ...LOCALIZED_HEADERS,
    params: { path: { id } },
    body: toUpdateQuestionDto(data),
  }));
}

export type QuestionDeleteBlockingInterview =
  Schemas['QuestionDeleteBlockingInterviewDto'];

export type DeleteQuestionResult =
  | { id: string; deleted: true }
  | {
      id: string;
      scheduled: true;
      blockingInterviews: QuestionDeleteBlockingInterview[];
    };

export async function deleteQuestion(
  id: string,
): Promise<DeleteQuestionResult> {
  const { data, error, response } = await client.DELETE('/questions/{id}', {
    ...LOCALIZED_HEADERS,
    params: { path: { id } }
  });
  const status = response.status;
  const path = `/questions/${id}`;

  if (error) {
    const { code, params } = extractApiErrorFields(error);
    throw new ApiError(status, messageFromError(error, status), path, undefined, code, params);
  }

  if (!data) {
    throw new ApiError(status, 'API error: Empty response body', path);
  }

  if (data.scheduled === true) {
    return {
      id: data.id,
      scheduled: true,
      blockingInterviews: data.blockingInterviews ?? [],
    };
  }

  if (data.deleted !== true) {
    throw new Error('API error: delete response did not confirm deletion.');
  }

  return { id: data.id, deleted: true };

}

export async function restoreQuestion(id: string): Promise<Question> {
  return handle(client.PATCH('/questions/{id}/restore', {
    ...LOCALIZED_HEADERS,
    params: { path: { id } }
  }));
}

export type BulkDeleteResult = Schemas['BulkDeleteQuestionsResponseDto'];

export async function deleteQuestionsBulk(
  ids: string[],
): Promise<BulkDeleteResult> {
  return handle(client.POST('/questions/bulk-delete', {
    ...LOCALIZED_HEADERS,
    body: { ids }
  }));
}

export type DraftQuestionMode = NonNullable<Schemas['DraftQuestionDto']['mode']>;

export type DraftQuestionParams = {
  mode: DraftQuestionMode;
  question: QuestionInput;
  targetLocale?: LocaleCode;
};

export async function draftQuestion({
  mode,
  question,
  targetLocale,
}: DraftQuestionParams): Promise<QuestionGenerateDraft | QuestionDraft> {
  const resolvedTargetLocale = resolveApiLocale(
    targetLocale ?? question.primaryLocale ?? clientApiLocale,
  );

  if (mode === 'translate') {
    return handle(
      client.POST('/questions/ai/draft', {
        headers: buildApiLocaleHeaders(resolvedTargetLocale),
        body: buildTranslateDraftRequestPayload(
          resolveApiLocale(question.primaryLocale ?? clientApiLocale),
          resolvedTargetLocale,
          question,
        ),
      }),
    );
  }

  return handle(
    client.POST('/questions/ai/draft', {
      headers: buildApiLocaleHeaders(resolvedTargetLocale),
      body: buildGenerateDraftRequestPayload(resolvedTargetLocale, question),
    }),
  );
}

export type SimilarQuestionMatch = Schemas['SimilarQuestionMatchDto'];

export async function findSimilarQuestions(
  draft: Partial<QuestionInput>,
  excludeQuestionId?: string,
  limit = 5,
  init?: { signal?: AbortSignal },
): Promise<SimilarQuestionMatch[]> {
  const data = await handle(client.POST('/questions/similar', {
    ...LOCALIZED_HEADERS,
    body: { draft: draft as Schemas['FindSimilarDraftDto'], excludeQuestionId, limit },
    signal: init?.signal,
  }));
  return data.matches;
}

export async function createInterview(
  data: CreateInterviewPayload,
): Promise<Interview & CandidateLinkResponse> {
  return handle(client.POST('/interviews', {
    ...LOCALIZED_HEADERS,
    body: data
  }));
}

export async function getInterview(id: string): Promise<Interview> {
  return handle(client.GET('/interviews/{id}', {
    headers: buildClientBaseHeaders(),
    params: { path: { id } }
  }));
}

export async function getInterviews(): Promise<Interview[]> {
  const data = await handle(client.GET('/interviews'));
  return normalizeInterviewsResponse<Interview>(data, 'client:/interviews');
}

export async function fetchInterviews(
  params?: FetchInterviewsParams,
  init?: { signal?: AbortSignal },
): Promise<PaginatedInterviews> {
  return handle(
    client.GET('/interviews', {
      ...LOCALIZED_HEADERS,
      params: { query: params ?? {} },
      signal: init?.signal,
    }),
  );
}

export async function fetchInterviewFacets(
  params?: FetchInterviewFacetsParams,
  init?: { signal?: AbortSignal },
): Promise<InterviewFacetsResponse> {
  return handle(
    client.GET('/interviews/facets', {
      ...LOCALIZED_HEADERS,
      params: { query: params ?? {} },
      signal: init?.signal,
    }),
  );
}

export function emptyPaginatedInterviews(limit = 20): PaginatedInterviews {
  return { items: [], total: 0, page: 1, limit };
}

export async function updateInterview(
  id: string,
  data: UpdateInterviewPayload,
): Promise<Interview> {
  return handle(client.PATCH('/interviews/{id}', {
    params: { path: { id } },
    body: data,
  }));
}

export async function cancelInterview(id: string): Promise<InterviewCancelResponse> {
  return handle(client.PATCH('/interviews/{id}/cancel', {
    params: { path: { id } },
  }));
}

export async function deleteInterview(id: string): Promise<InterviewDeleteResponse> {
  return handle(client.DELETE('/interviews/{id}', {
    params: { path: { id } },
  }));
}

export async function generateCandidateLink(
  id: string,
): Promise<CandidateLinkResponse> {
  return handle(client.POST('/interviews/{id}/candidate-link', {
    ...LOCALIZED_HEADERS,
    params: { path: { id } }
  }));
}

export async function generateFeedbackLink(
  id: string,
): Promise<FeedbackLinkResponse> {
  return handle(client.POST('/interviews/{id}/feedback-link', {
    ...LOCALIZED_HEADERS,
    params: { path: { id } }
  }));
}

export type {
  ApiCandidateFeedbackDto,
  CandidateFeedbackBlock,
  CandidateFeedbackBlockState,
  CandidateFeedbackEditableState,
  CandidateFeedbackQuestionBlock,
  CandidateFeedbackResponse,
  CandidateFeedbackSkipReason,
  GenerateAllCandidateFeedbackOutcome,
  GenerateAllCandidateFeedbackPlan,
  GenerateAllCandidateFeedbackQuestionResult,
  UpdateCandidateFeedbackOverallPayload,
  UpdateCandidateFeedbackPayload,
  UpdateCandidateFeedbackQuestionPayload,
} from './candidate-feedback';
export {
  buildQuestionBlocksView,
  candidateFeedbackPath,
  canRegenerateAnyCandidateFeedbackBlock,
  createEmptyCandidateFeedback,
  getSkippedGenerateAllQuestionResults,
  isCandidateFeedbackEmpty,
  isCandidateFeedbackGenerating,
  isOverallBlockGenerationBusy,
  isQuestionBlockGenerationBusy,
  mapCandidateFeedbackFromApi,
  parseCandidateFeedbackBody,
} from './candidate-feedback';

export async function getCandidateFeedback(
  id: string,
  interviewLocale: Locale,
): Promise<CandidateFeedbackResponse> {
  const path = `/interviews/${encodeURIComponent(id)}/candidate-feedback`;
  const res = await fetchClientApi(`/api${path}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.text();
    const { code, params } = extractApiErrorFieldsFromBody(body);
    throw new ApiError(res.status, messageFromBody(body, res.status), path, body, code, params);
  }

  const body = await res.text();
  return parseCandidateFeedbackBody(body, id, interviewLocale);
}

export async function updateCandidateFeedback(
  id: string,
  payload: UpdateCandidateFeedbackPayload,
  interviewLocale: Locale,
): Promise<CandidateFeedbackResponse> {
  const path = `/interviews/${encodeURIComponent(id)}/candidate-feedback`;
  const res = await fetchClientApi(`/api${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    const { code, params } = extractApiErrorFieldsFromBody(body);
    throw new ApiError(res.status, messageFromBody(body, res.status), path, body, code, params);
  }

  const body = await res.text();
  if (!body) {
    return getCandidateFeedback(id, interviewLocale);
  }

  return parseCandidateFeedbackBody(body, id, interviewLocale);
}

export async function generateCandidateFeedbackQuestion(
  interviewId: string,
  questionIndex: number,
  interviewLocale: Locale,
): Promise<CandidateFeedbackResponse> {
  const path = `/interviews/${encodeURIComponent(interviewId)}/candidate-feedback/questions/${encodeURIComponent(String(questionIndex))}/generate`;
  const res = await fetchClientApi(`/api${path}`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.text();
    const { code, params } = extractApiErrorFieldsFromBody(body);
    throw new ApiError(res.status, messageFromBody(body, res.status), path, body, code, params);
  }

  return getCandidateFeedback(interviewId, interviewLocale);
}

export async function generateCandidateFeedbackAll(
  interviewId: string,
  interviewLocale: Locale,
): Promise<GenerateAllCandidateFeedbackOutcome> {
  const path = `/interviews/${encodeURIComponent(interviewId)}/candidate-feedback/generate?scope=all`;
  const res = await fetchClientApi(`/api${path}`, {
    method: 'POST',
    credentials: 'include',
  });

  const body = await res.text();

  if (!res.ok) {
    const { code, params } = extractApiErrorFieldsFromBody(body);
    throw new ApiError(res.status, messageFromBody(body, res.status), path, body, code, params);
  }

  let plan: GenerateAllCandidateFeedbackPlan | undefined
  let postFeedback: CandidateFeedbackResponse | undefined

  if (body.trim()) {
    const parsed = parseGenerateAllCandidateFeedbackPostBody(body)
    plan = parsed.plan
    if (parsed.feedbackDto) {
      postFeedback = mapCandidateFeedbackFromApi(
        {
          ...parsed.feedbackDto,
          interviewId: parsed.feedbackDto.interviewId ?? interviewId,
        },
        interviewLocale,
      )
    }
  }

  const feedback =
    postFeedback ?? (await getCandidateFeedback(interviewId, interviewLocale))
  return { feedback, plan }
}


export async function getPresignedUrl(
  interviewId: string,
  questionIndex: number,
  contentType: 'video/webm',
  mediaType: CaptureTarget = 'camera',
): Promise<PresignedUrlResponse> {
  return handle(
    client.POST('/interviews/{id}/questions/{questionIndex}/upload-url', {
      ...LOCALIZED_HEADERS,
      params: { path: { id: interviewId, questionIndex } },
      body: { contentType, mediaType },
    }),
  );
}

async function completeUpload(
  interviewId: string,
  questionIndex: number,
  mediaKey: string,
): Promise<Schemas['ConfirmUploadResponseDto']> {
  return handle(
    client.POST('/interviews/{id}/questions/{questionIndex}/complete-upload', {
      ...LOCALIZED_HEADERS,
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
    ...LOCALIZED_HEADERS,
    params: { path: { id: interviewId, questionIndex } }
  }));
}

export async function getResults(id: string): Promise<InterviewResult> {
  return handle(client.GET('/interviews/{id}/results', {
    headers: buildClientBaseHeaders(),
    params: { path: { id } }
  }));
}

export async function getTakeInterview(
  id: string,
  token?: string,
  contentLocale?: Locale,
  init?: { signal?: AbortSignal },
): Promise<TakeInterviewData> {
  return handle(client.GET('/take/{id}', {
    headers: buildClientBaseHeaders(),
    params: {
      path: { id },
      query: {
        ...(token ? { token } : {}),
        ...(contentLocale ? { contentLocale } : {}),
      },
    },
    signal: init?.signal,
  }));
}

export async function syncCandidateSession(id: string, token: string): Promise<void> {
  const path = `/take/${encodeURIComponent(id)}`;
  const query = new URLSearchParams({ token });
  const res = await fetchClientApi(`/api${path}?${query}`, { credentials: 'include' });

  if (!res.ok) {
    const body = await res.text();
    const { code, params } = extractApiErrorFieldsFromBody(body);
    throw new ApiError(res.status, messageFromBody(body, res.status), path, body, code, params);
  }

  await res.text();
}

export async function startMultipartUpload(
  questionIndex: number,
  mediaType: CaptureTarget,
  options?: {
    contentType?: 'video/webm';
    versionNumber?: number;
  },
): Promise<MultipartUploadSessionResponse> {
  const contentType = options?.contentType ?? 'video/webm';
  return handle(client.POST('/upload/multipart/start', {
    ...LOCALIZED_HEADERS,
    body: {
      questionIndex,
      contentType,
      mediaType,
      ...(options?.versionNumber !== undefined ? { versionNumber: options.versionNumber } : {}),
    } as Schemas['StartMultipartUploadDto'] & { versionNumber?: number },
  }));
}

export async function sendTakeAnswerProgress(
  id: string,
  payload: TakeProgressPayload,
): Promise<TakeProgressResponse> {
  return handle(client.POST('/take/{id}/answer/progress', {
    ...LOCALIZED_HEADERS,
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
    ...LOCALIZED_HEADERS,
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
    ...LOCALIZED_HEADERS,
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
    ...LOCALIZED_HEADERS,
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
    ...LOCALIZED_HEADERS,
    params: { path: { id } },
    body: payload
  }));
}

// Interview templates; questions are live-resolved for the request locale.
export type Template = Omit<Schemas['TemplateResponseDto'], 'questions'> & {
  questions: Question[];
};
// List item: summary fields only, no resolved questions (the list never reads them).
export type TemplateSummary = Schemas['TemplateSummaryResponseDto'];
export type CreateTemplatePayload = Schemas['CreateTemplateDto'];
export type UpdateTemplatePayload = Schemas['UpdateTemplateDto'];
export type DeleteTemplateResponse = Schemas['DeleteTemplateResponseDto'];

export async function getTemplates(): Promise<TemplateSummary[]> {
  return handle(client.GET('/templates', {
    ...LOCALIZED_HEADERS,
  }));
}

export async function getTemplate(id: string): Promise<Template> {
  return handle(client.GET('/templates/{id}', {
    ...LOCALIZED_HEADERS,
    params: { path: { id } },
  }));
}

export async function createTemplate(
  data: CreateTemplatePayload,
): Promise<Template> {
  return handle(client.POST('/templates', {
    ...LOCALIZED_HEADERS,
    body: data,
  }));
}

export async function updateTemplate(
  id: string,
  data: UpdateTemplatePayload,
): Promise<Template> {
  return handle(client.PATCH('/templates/{id}', {
    ...LOCALIZED_HEADERS,
    params: { path: { id } },
    body: data,
  }));
}

export async function deleteTemplate(id: string): Promise<DeleteTemplateResponse> {
  return handle(client.DELETE('/templates/{id}', {
    params: { path: { id } },
  }));
}
