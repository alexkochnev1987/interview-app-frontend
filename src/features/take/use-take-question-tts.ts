import type { MutableRefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { TakeStage } from '@/components/take/types';
import type { TakeInterviewData } from '@/lib/api';

const QUESTION_SPEAK_MS_PER_CHAR = 100;
const QUESTION_SPEAK_WATCHDOG_SLACK_MS = 15_000;
const QUESTION_SPEAK_WATCHDOG_MIN_MS = 10_000;
const QUESTION_SPEAK_WATCHDOG_MAX_MS = 25 * 60 * 1000;

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
    let watchdogTimer: ReturnType<typeof setTimeout> | undefined;

    const release = () => {
      if (done) return;
      done = true;
      if (watchdogTimer !== undefined) {
        clearTimeout(watchdogTimer);
        watchdogTimer = undefined;
      }
      recordingAllowedRef.current = true;
      queueMicrotask(() => setSpeakingActive(false));
    };

    const watchdogMs = Math.min(
      QUESTION_SPEAK_WATCHDOG_MAX_MS,
      Math.max(
        QUESTION_SPEAK_WATCHDOG_MIN_MS,
        text.length * QUESTION_SPEAK_MS_PER_CHAR + QUESTION_SPEAK_WATCHDOG_SLACK_MS,
      ),
    );

    watchdogTimer = setTimeout(() => {
      speechCapture?.scheduleRecognitionResumeAfterSynthUtterance();
      release();
    }, watchdogMs);

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