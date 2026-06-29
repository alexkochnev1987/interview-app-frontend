import type { MutableRefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';

import type { TakeStage } from '@/components/take/types';
import { resolveSpeechSynthesisLocale, type Locale } from '@/i18n/locales';
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

function cancelBrowserSpeechSynth() {
  if (typeof window === 'undefined') return;
  window.speechSynthesis?.cancel();
}

function speakQuestion(
  text: string,
  speechLocale: string,
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

  cancelBrowserSpeechSynth();
  try {
    synth.resume();
  } catch {
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLocale;
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
  const uiLocale = useLocale() as Locale;
  const speechLocale = resolveSpeechSynthesisLocale(uiLocale);
  const [speakingActive, setSpeakingActive] = useState(false);
  const recordingAllowedRef = useRef(true);
  const uiLocaleRef = useRef(uiLocale);
  const localeSwitchPendingRef = useRef(false);
  const questionSnapshotRef = useRef(interview?.currentQuestion);

  const shouldSpeakQuestion = stage === 'interview';

  useEffect(() => {
    if (uiLocaleRef.current !== uiLocale) {
      uiLocaleRef.current = uiLocale;
      localeSwitchPendingRef.current = true;
    }
  }, [uiLocale]);

  useEffect(() => {
    if (interview?.currentQuestion !== questionSnapshotRef.current) {
      questionSnapshotRef.current = interview?.currentQuestion;
      localeSwitchPendingRef.current = false;
    }
  }, [interview?.currentQuestion]);

  useEffect(() => {
    if (!shouldSpeakQuestion) {
      cancelBrowserSpeechSynth();
      speechCapture?.discardOutboundSynthGuards();
      recordingAllowedRef.current = true;
      queueMicrotask(() => setSpeakingActive(false));
      return;
    }

    if (localeSwitchPendingRef.current) {
      cancelBrowserSpeechSynth();
      speechCapture?.discardOutboundSynthGuards();
      recordingAllowedRef.current = false;
      queueMicrotask(() => setSpeakingActive(false));
      return () => {
        cancelBrowserSpeechSynth();
        speechCapture?.discardOutboundSynthGuards();
      };
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
      cancelBrowserSpeechSynth();
      speechCapture?.scheduleRecognitionResumeAfterSynthUtterance();
      release();
    }, watchdogMs);

    speakQuestion(text, speechLocale, release, speechCapture ?? null);

    return () => {
      cancelBrowserSpeechSynth();
      speechCapture?.discardOutboundSynthGuards();
      release();
    };
  }, [
    shouldSpeakQuestion,
    uiLocale,
    speechLocale,
    interview?.id,
    interview?.currentQuestion?.text,
    interview?.currentQuestionIndex,
    interview?.currentAnswerMeta?.versionCount,
    speechCapture,
  ]);

  const presence: InterviewerPresence =
    shouldSpeakQuestion && speakingActive ? 'speaking' : 'listening';

  return [presence, recordingAllowedRef] as const;
}