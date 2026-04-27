export type TakeStage = 'loading' | 'consent' | 'interview' | 'recording' | 'transition' | 'complete';

export interface InterviewDataView {
  id: string;
  position: string;
  candidateName: string;
  totalQuestions: number;
  currentQuestion: { text: string } | null;
  currentQuestionIndex: number;
}

export type PermissionStatus = 'idle' | 'pending' | 'granted' | 'denied';
