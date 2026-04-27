import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  BrowserSpeechRecognitionConstructor,
  BrowserSpeechRecognitionInstance,
  BrowserWindowWithSpeechRecognition,
} from './browser-speech-types';

const PROVIDER = 'browser-web-speech' as const;
const DEFAULT_LANGUAGE = 'en-US';
const MAX_AUTO_RESTARTS = 3;
const DEFAULT_STOP_TIMEOUT_MS = 700;

type StopOptions = {
  finalize?: boolean;
  timeoutMs?: number;
};

export type BrowserTranscriptSnapshot = {
  text: string;
  language: string;
  provider: typeof PROVIDER;
  generatedAt: string;
  isFinal: boolean;
};

function getRecognitionConstructor(): BrowserSpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const typedWindow = window as BrowserWindowWithSpeechRecognition;
  return typedWindow.SpeechRecognition ?? typedWindow.webkitSpeechRecognition;
}

function getDefaultLanguage(): string {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  return navigator.language || DEFAULT_LANGUAGE;
}

export function useBrowserTranscript() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [warning, setWarning] = useState<string | undefined>(undefined);

  const recognitionRef = useRef<BrowserSpeechRecognitionInstance | null>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStopResolveRef = useRef<((snapshot: BrowserTranscriptSnapshot) => void) | null>(null);
  const languageRef = useRef(getDefaultLanguage());
  const interimTranscriptRef = useRef('');
  const finalTranscriptRef = useRef('');
  const isSessionActiveRef = useRef(false);
  const restartAttemptsRef = useRef(0);

  useEffect(() => {
    setIsSupported(Boolean(getRecognitionConstructor()));
    languageRef.current = getDefaultLanguage();
  }, []);

  const clearStopTimeout = useCallback(() => {
    if (!stopTimeoutRef.current) {
      return;
    }

    clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = null;
  }, []);

  const appendFinalText = useCallback((base: string, chunk: string) => {
    const trimmedChunk = chunk.trim();
    if (!trimmedChunk) {
      return base;
    }

    if (!base) {
      return trimmedChunk;
    }

    return `${base} ${trimmedChunk}`;
  }, []);

  const setInterimTranscriptValue = useCallback((value: string) => {
    interimTranscriptRef.current = value;
    setInterimTranscript(value);
  }, []);

  const setFinalTranscriptValue = useCallback((value: string) => {
    finalTranscriptRef.current = value;
    setFinalTranscript(value);
  }, []);

  const buildSnapshot = useCallback((): BrowserTranscriptSnapshot => {
    const interim = interimTranscriptRef.current;
    const final = finalTranscriptRef.current;
    const text = [final, interim].filter(Boolean).join(' ').trim();

    return {
      text,
      language: languageRef.current,
      provider: PROVIDER,
      generatedAt: new Date().toISOString(),
      isFinal: !interim.trim(),
    };
  }, []);

  const ensureRecognition = useCallback(() => {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }

    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      return null;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageRef.current;

    recognition.onstart = () => {
      setIsListening(true);
      restartAttemptsRef.current = 0;
      setWarning(undefined);
    };

    recognition.onend = () => {
      setIsListening(false);
      const pendingStopResolve = pendingStopResolveRef.current;
      if (pendingStopResolve) {
        pendingStopResolveRef.current = null;
        clearStopTimeout();
        pendingStopResolve(buildSnapshot());
      }

      if (!isSessionActiveRef.current) {
        return;
      }

      if (restartAttemptsRef.current >= MAX_AUTO_RESTARTS) {
        setWarning('Speech recognition stopped unexpectedly after multiple retries');
        isSessionActiveRef.current = false;
        return;
      }

      restartAttemptsRef.current += 1;
      try {
        recognition.start();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to restart speech recognition';
        setWarning(message);
      }
    };

    recognition.onresult = (event) => {
      if (!isSessionActiveRef.current) {
        return;
      }

      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalChunk = appendFinalText(finalChunk, transcript);
        } else {
          interim = appendFinalText(interim, transcript);
        }
      }

      if (finalChunk) {
        const nextFinalTranscript = appendFinalText(finalTranscriptRef.current, finalChunk);
        setFinalTranscriptValue(nextFinalTranscript);
      }
      setInterimTranscriptValue(interim);
    };

    recognition.onerror = (event) => {
      setWarning(event.message || event.error || 'Speech recognition error');
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [
    appendFinalText,
    buildSnapshot,
    clearStopTimeout,
    setFinalTranscriptValue,
    setInterimTranscriptValue,
  ]);

  const start = useCallback(() => {
    setWarning(undefined);
    restartAttemptsRef.current = 0;
    isSessionActiveRef.current = true;
    setInterimTranscriptValue('');
    setFinalTranscriptValue('');

    const recognition = ensureRecognition();
    if (!recognition) {
      setIsSupported(false);
      setIsListening(false);
      isSessionActiveRef.current = false;
      setWarning('Web Speech API is not supported in this browser');
      return;
    }

    languageRef.current = getDefaultLanguage();
    recognition.lang = languageRef.current;

    try {
      recognition.start();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start speech recognition';
      setWarning(message);
    }
  }, [ensureRecognition, setFinalTranscriptValue, setInterimTranscriptValue]);

  const stop = useCallback(
    async (options?: StopOptions): Promise<BrowserTranscriptSnapshot> => {
      const recognition = recognitionRef.current;
      isSessionActiveRef.current = false;
      restartAttemptsRef.current = 0;

      const finalize = Boolean(options?.finalize);
      const timeoutMs = Math.max(0, options?.timeoutMs ?? DEFAULT_STOP_TIMEOUT_MS);

      const finalizeTranscript = () => {
        if (!finalize) {
          return;
        }

        const nextFinalTranscript = appendFinalText(
          finalTranscriptRef.current,
          interimTranscriptRef.current,
        );
        setFinalTranscriptValue(nextFinalTranscript);
        setInterimTranscriptValue('');
      };

      // Ensure a previous pending stop cannot remain unresolved.
      if (pendingStopResolveRef.current) {
        const pendingStopResolve = pendingStopResolveRef.current;
        pendingStopResolveRef.current = null;
        pendingStopResolve(buildSnapshot());
      }
      clearStopTimeout();
      finalizeTranscript();

      if (!recognition) {
        return buildSnapshot();
      }

      return new Promise<BrowserTranscriptSnapshot>((resolve) => {
        pendingStopResolveRef.current = resolve;
        if (timeoutMs > 0) {
          stopTimeoutRef.current = setTimeout(() => {
            const pendingStopResolve = pendingStopResolveRef.current;
            if (!pendingStopResolve) {
              return;
            }

            pendingStopResolveRef.current = null;
            pendingStopResolve(buildSnapshot());
          }, timeoutMs);
        }

        try {
          recognition.stop();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to stop speech recognition';
          setWarning(message);
          setIsListening(false);
          const pendingStopResolve = pendingStopResolveRef.current;
          if (!pendingStopResolve) {
            return;
          }

          pendingStopResolveRef.current = null;
          clearStopTimeout();
          pendingStopResolve(buildSnapshot());
        }
      });
    },
    [
      appendFinalText,
      buildSnapshot,
      clearStopTimeout,
      setFinalTranscriptValue,
      setInterimTranscriptValue,
    ],
  );

  const reset = useCallback(() => {
    clearStopTimeout();
    isSessionActiveRef.current = false;
    restartAttemptsRef.current = 0;
    const recognition = recognitionRef.current;

    if (recognition) {
      try {
        recognition.abort?.();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to abort speech recognition';
        setWarning(message);
      }
    }

    setIsListening(false);
    setInterimTranscriptValue('');
    setFinalTranscriptValue('');
    setWarning(undefined);
  }, [clearStopTimeout, setFinalTranscriptValue, setInterimTranscriptValue]);

  const getSnapshot = useCallback((): BrowserTranscriptSnapshot => {
    return buildSnapshot();
  }, [buildSnapshot]);

  useEffect(() => {
    return () => {
      clearStopTimeout();
      isSessionActiveRef.current = false;
      restartAttemptsRef.current = 0;
      const recognition = recognitionRef.current;
      if (!recognition) {
        return;
      }

      try {
        recognition.abort?.();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to abort speech recognition';
        setWarning(message);
      }
    };
  }, [clearStopTimeout]);

  return useMemo(
    () => ({
      isSupported,
      isListening,
      interimTranscript,
      finalTranscript,
      warning,
      start,
      stop,
      reset,
      getSnapshot,
    }),
    [
      isSupported,
      isListening,
      interimTranscript,
      finalTranscript,
      warning,
      start,
      stop,
      reset,
      getSnapshot,
    ],
  );
}
