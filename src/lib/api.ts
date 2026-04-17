// In production, requests go to /api/* which Next.js rewrites to the backend.
// This avoids Mixed Content (HTTPS frontend → HTTP backend).
const API_URL = '/api';

export interface Answer {
  questionIndex: number;
  mediaKey: string;
  uploadedAt: string;
}

export interface InterviewResult {
  overallScore: number;
  summary: string;
  categoryScores: Record<string, number>;
  completedAt: string;
}

export interface Interview {
  id: string;
  candidateName: string;
  position: string;
  questions: string[];
  answers: Answer[];
  status: 'pending' | 'in_progress' | 'processing' | 'completed' | 'failed';
  result?: InterviewResult;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewPayload {
  candidateName: string;
  position: string;
  questions: string[];
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  mediaKey: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchInterviews(): Promise<Interview[]> {
  return request<Interview[]>('/interviews');
}

export async function createInterview(
  data: CreateInterviewPayload,
): Promise<Interview> {
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
