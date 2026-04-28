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
    transcriptText?: string;
    hasTranscript?: boolean;
    transcriptStatus?: 'pending' | 'processing' | 'ready' | 'failed';
    transcript?: {
      text?: string;
      status?: 'pending' | 'processing' | 'ready' | 'failed';
      ready?: boolean;
    };
  } | null;
}

export type PermissionStatus = 'idle' | 'pending' | 'granted' | 'denied';
