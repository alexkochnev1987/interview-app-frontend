import { request } from './client';
import type {
  CreateInterviewPayload,
  Interview,
  InterviewResult,
  PresignedUrlResponse,
} from './types';

export async function fetchInterviews(): Promise<Interview[]> {
  return request<Interview[]>('/interviews');
}

export async function createInterview(data: CreateInterviewPayload): Promise<Interview> {
  return request<Interview>('/interviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getInterview(id: string): Promise<Interview> {
  return request<Interview>(`/interviews/${id}`);
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

export async function getResults(id: string): Promise<InterviewResult> {
  return request<InterviewResult>(`/interviews/${id}/results`);
}
