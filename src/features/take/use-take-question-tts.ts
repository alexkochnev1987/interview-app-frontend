import type { MutableRefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { TakeStage } from '@/components/take/types';
import type { TakeInterviewData } from '@/lib/api';

export type InterviewerPresence = 'speaking' | 'listening';

export type QuestionSpeechSynthCapture = Readonly<{
  pauseRecognitionBeforeSpeak: () => void;
  scheduleRecognitionResumeAfterSynthUtterance: () => void;
  discardOutboundSynthGuards: () => void;
}>;

function speakQuestion(
  text: string,
  onEnd: () => void,
  speechCapture?: QuestionSpeechSynthCapture | null,
) {
  if (typeof window === 'undefined') {
    speechCapture?.discardOutboundSynthGuards();
    queueMicrotask(onEnd);
    return;
  }

  const synth = window.speechSynthesis;
  if (!synth) {
    speechCapture?.discardOutboundSynthGuards();
    queueMicrotask(onEnd);
    return;
  }

  speechCapture?.pauseRecognitionBeforeSpeak();

  synth.cancel();
  try {
    synth.resume();
  } catch {
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.95;
  utterance.pitch = 1;

  const finish = () => {
    queueMicrotask(onEnd);
    speechCapture?.scheduleRecognitionResumeAfterSynthUtterance();
  };

  utterance.onend = finish;
  utterance.onerror = finish;

  synth.speak(utterance);
}

export function useTakeQuestionTts(
  interview: TakeInterviewData | null,
  stage: TakeStage,
  speechCapture?: QuestionSpeechSynthCapture | null,
): readonly [InterviewerPresence, MutableRefObject<boolean>] {
  const [speakingActive, setSpeakingActive] = useState(false);
  const recordingAllowedRef = useRef(true);

  const takeAudioStage = stage === 'interview' || stage === 'recording';

  useEffect(() => {
    if (!takeAudioStage) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      speechCapture?.discardOutboundSynthGuards();
      recordingAllowedRef.current = true;
      queueMicrotask(() => setSpeakingActive(false));
      return;
    }

    const text = interview?.currentQuestion?.text?.trim();
    if (!text) {
      speechCapture?.discardOutboundSynthGuards();
      recordingAllowedRef.current = true;
      queueMicrotask(() => setSpeakingActive(false));
      return;
    }

    recordingAllowedRef.current = false;
    queueMicrotask(() => setSpeakingActive(true));

    let done = false;
    const release = () => {
      if (done) return;
      done = true;
      recordingAllowedRef.current = true;
      queueMicrotask(() => setSpeakingActive(false));
    };

    speakQuestion(text, release, speechCapture ?? null);

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      speechCapture?.discardOutboundSynthGuards();
      release();
    };
  }, [
    takeAudioStage,
    interview?.id,
    interview?.currentQuestion?.text,
    interview?.currentQuestionIndex,
    interview?.currentAnswerMeta?.versionCount,
    speechCapture,
  ]);

  const presence: InterviewerPresence =
    takeAudioStage && speakingActive ? 'speaking' : 'listening';

  return [presence, recordingAllowedRef] as const;
}