export type TakeStage = 'loading' | 'consent' | 'interview' | 'recording' | 'transition' | 'complete';

export interface InterviewDataView {
  id: string;
  position: string;
  candidateName: string;
  totalQuestions: number;
  currentQuestion: { text: string } | null;
  currentQuestionIndex: number;
  currentAnswerMeta?: {
    status: 'recording' | 'submitted';
    versionCount: number;
    selectedVersionNumber: number;
  } | null;
}

export type PermissionStatus = 'idle' | 'pending' | 'granted' | 'denied';
