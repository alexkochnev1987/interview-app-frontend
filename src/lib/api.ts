// In production, requests go to /api/* which Next.js rewrites to the backend.
// This avoids Mixed Content (HTTPS frontend → HTTP backend).
const API_URL = '/api';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuestionDraft {
  expectedConcepts: string[];
  redFlags: string[];
  difficulty: QuestionDifficulty;
  weight: number;
}

export interface QuestionInput {
  text: string;
  expectedConcepts: string[];
  redFlags: string[];
  difficulty: QuestionDifficulty;
  weight: number;
}

export interface Question extends QuestionInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  expectedConcepts: string[];
  redFlags: string[];
  difficulty: QuestionDifficulty;
  weight: number;
}

export interface CandidateQuestionView {
  text: string;
}

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
  questions: InterviewQuestion[];
  answers: Answer[];
  status: 'pending' | 'in_progress' | 'processing' | 'completed' | 'failed';
  result?: InterviewResult;
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

export async function draftQuestion(
  text: string,
  position: string,
): Promise<QuestionDraft> {
  return request<QuestionDraft>('/ai/question-draft', {
    method: 'POST',
    body: JSON.stringify({ text, position }),
  });
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
