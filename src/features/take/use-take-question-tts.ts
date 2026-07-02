import type { MutableRefObject } from 'react';
import { useRef } from 'react';

import type { TakeStage } from '@/components/take/types';
import type { TakeInterviewData } from '@/lib/api';

export type InterviewerPresence = 'speaking' | 'listening';

export type QuestionSpeechSynthCapture = Readonly<{
  pauseRecognitionBeforeSpeak: () => void;
  scheduleRecognitionResumeAfterSynthUtterance: () => void;
  discardOutboundSynthGuards: () => void;
}>;

export function useTakeQuestionTts(
  _interview: TakeInterviewData | null,
  _stage: TakeStage,
  _speechCapture?: QuestionSpeechSynthCapture | null,
): readonly [InterviewerPresence, MutableRefObject<boolean>] {
  const recordingAllowedRef = useRef(true);

  return ['listening', recordingAllowedRef] as const;
}
