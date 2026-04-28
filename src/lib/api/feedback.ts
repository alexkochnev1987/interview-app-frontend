import { request } from './client';

export interface FeedbackResponse {
  overallResult?: string;
  overallScore?: number;
  categoryScores?: Record<string, number>;
  generalFeedback?: string;
  improvements?: string;
  position: string;
  date: string;
  expiresAt: string;
}

export function fetchFeedback(id: string, token: string) {
  const tokenPart = encodeURIComponent(token);
  return request<FeedbackResponse>(`/feedback/${id}?token=${tokenPart}`);
}
