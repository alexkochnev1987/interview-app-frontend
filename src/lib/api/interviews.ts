import { client, handle, postWithQuery, Schemas } from './client';
import { RECORDING_CONTENT_TYPE } from './uploads';
import type {
  CandidateLinkResponse,
  CaptureTarget,
  CreateInterviewPayload,
  Interview,
  InterviewAnswerMediaResponse,
  InterviewCancelResponse,
  InterviewResult,
  PresignedUrlResponse,
  StartAnswerValidationResult,
  UpdateInterviewPayload,
  ValidateAllAnswersResponse,
} from './types';

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

export async function getInterviews(): Promise<Interview[]> {
  return handle(client.GET('/interviews'));
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
  contentType: typeof RECORDING_CONTENT_TYPE,
  mediaType: CaptureTarget = 'camera',
): Promise<PresignedUrlResponse> {
  return handle(
    client.POST('/interviews/{id}/questions/{questionIndex}/upload-url', {
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
    params: { path: { id: interviewId, questionIndex } }
  }));
}

export async function getResults(id: string): Promise<InterviewResult> {
  return handle(client.GET('/interviews/{id}/results', {
    params: { path: { id } }
  }));
}
