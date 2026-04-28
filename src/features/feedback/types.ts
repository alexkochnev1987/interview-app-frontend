export interface Feedback {
  overallResult?: string;
  overallScore?: number;
  categoryScores?: Record<string, number>;
  generalFeedback?: string;
  improvements?: string;
  position: string;
  date: string;
  expiresAt: string;
}
