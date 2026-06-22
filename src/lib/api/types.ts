import { paths } from '../api-types';
import { Schemas } from './client';

export type QuestionDifficulty = Schemas['QuestionResponseDto']['difficulty'];
export type AuthUserResponseDto = Schemas['AuthUserResponseDto'];
export type MeResponse = AuthUserResponseDto;
export type LoginPayload = Schemas['LoginDto'];
export type LogoutResponse = Schemas['LogoutResponseDto'];
export type FeedbackResponse = Schemas['FeedbackResponseDto'];

export type QuestionExpectedConcept = Schemas['QuestionExpectedConceptDto'];
export type QuestionRedFlag = Schemas['QuestionRedFlagDto'];

export type QuestionDraft = Schemas['QuestionDraftResponseDto'];
export type QuestionInput = Schemas['CreateQuestionDto'];
export type UpdateQuestionInput = Schemas['UpdateQuestionDto'];
export type Question = Schemas['QuestionResponseDto'];
export type PaginatedQuestions = Schemas['PaginatedQuestionsResponseDto'];
export type QuestionFacetsResponse = Schemas['QuestionFacetsResponseDto'];
export type FetchQuestionsParams = NonNullable<paths['/questions']['get']['parameters']['query']>;
export type QuestionSortField = NonNullable<FetchQuestionsParams['sortBy']>;
export type QuestionSortOrder = NonNullable<FetchQuestionsParams['sortOrder']>;
export type QuestionStatusFilter = NonNullable<FetchQuestionsParams['status']>;

export type InterviewQuestion = Schemas['InterviewResponseDto']['questions'][number];

export type InterviewBehaviorRisk = NonNullable<Schemas['InterviewResultResponseDto']['behaviorSummary']>['riskLevel'];
export type InterviewDecision = NonNullable<Schemas['InterviewResultResponseDto']['decision']>;
export type AnswerDecisionHint = NonNullable<Schemas['InterviewQuestionResultDto']['decisionHint']>;

export type ClientTranscriptPayload = Schemas['ClientTranscriptDto'];
export type Answer = Schemas['AnswerDto'];

export type InterviewResult = Schemas['InterviewResultResponseDto'];
export type Interview = Schemas['InterviewResponseDto'];

export type ValidateAllAnswersResponse = Schemas['StartAllAnswerValidationsResponseDto'];
export type StartAnswerValidationResult = Schemas['StartAnswerValidationResultDto'];
export type InterviewAnswerMediaResponse = Schemas['InterviewAnswerMediaResponseDto'];
export type CandidateLinkResponse = Schemas['CandidateLinkResponseDto'];

export type CreateInterviewPayload = Schemas['CreateInterviewDto'];

export type PresignedUrlResponse = Schemas['PresignedUrlResponseDto'];

export type TakeInterviewData = Schemas['TakeInterviewResponseDto'];
export type MultipartUploadSessionResponse = Schemas['MultipartUploadSessionResponseDto'];
export type MultipartUploadPartResponse = Schemas['MultipartUploadPartResponseDto'];

export type TakeProgressPayload = Schemas['SaveAnswerProgressDto'];

export type SubmitTakeAnswerPayload = Schemas['SubmitAnswerDto'];

export type CaptureTarget = 'camera' | 'screen';

export type TeamMember = Schemas['AuthUserResponseDto'];

export type FetchQuestionFacetsParams = NonNullable<
  paths['/questions/facets']['get']['parameters']['query']
>;

export type FacetCount = Schemas['FacetCountDto'];

export type BulkDeleteResult = Schemas['BulkDeleteQuestionsResponseDto'];

export type SimilarQuestionMatch = Schemas['SimilarQuestionMatchDto'];
