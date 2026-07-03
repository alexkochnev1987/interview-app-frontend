import { useCallback, useEffect, useRef } from 'react';

import { getTakeInterview, type TakeInterviewData } from '@/lib/api';
import type { Locale } from '@/i18n/locales';
import type { TakeMessageGetter } from './messages';

export type TakeInterviewLoadMode = 'initial' | 'resume' | 'locale';

interface UseTakeInterviewLoaderParams {
  id: string;
  candidateToken: string;
  skipInitialLoad?: boolean;
  contentLocale?: Locale;
  onData: (data: TakeInterviewData, mode: TakeInterviewLoadMode, tokenOverride?: string) => void;
  onError: (message: string) => void;
  onCleanup: () => void;
  takeMessage: TakeMessageGetter;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function useTakeInterviewLoader({
  id,
  candidateToken,
  skipInitialLoad,
  contentLocale,
  onData,
  onError,
  onCleanup,
  takeMessage,
}: UseTakeInterviewLoaderParams) {
  const candidateTokenRef = useRef(candidateToken);
  const contentLocaleRef = useRef(contentLocale);
  const onDataRef = useRef(onData);
  const onErrorRef = useRef(onError);
  const onCleanupRef = useRef(onCleanup);
  const takeMessageRef = useRef(takeMessage);
  const loadGenerationRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadInterview = useCallback(
    async (
      mode: TakeInterviewLoadMode = 'initial',
      tokenOverride?: string,
      localeOverride?: Locale,
    ) => {
      const effectiveToken = tokenOverride ?? candidateTokenRef.current;
      const effectiveContentLocale = localeOverride ?? contentLocaleRef.current;
      const generation = ++loadGenerationRef.current;

      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const data = await getTakeInterview(
          id,
          effectiveToken,
          effectiveContentLocale,
          { signal: abortController.signal },
        );

        if (generation !== loadGenerationRef.current) {
          return;
        }

        const latestLocale = localeOverride ?? contentLocaleRef.current;
        if (effectiveContentLocale !== latestLocale) {
          return;
        }

        onDataRef.current(data, mode, tokenOverride);
      } catch (err) {
        if (abortController.signal.aborted || isAbortError(err)) {
          return;
        }
        if (generation !== loadGenerationRef.current) {
          return;
        }
        onErrorRef.current(
          err instanceof Error ? err.message : takeMessageRef.current('takeLoadFailed'),
        );
      }
    },
    [id],
  );

  const loadInterviewRef = useRef(loadInterview);

  useEffect(() => {
    if (candidateToken) {
      candidateTokenRef.current = candidateToken;
    }
    contentLocaleRef.current = contentLocale;
    onDataRef.current = onData;
    onErrorRef.current = onError;
    onCleanupRef.current = onCleanup;
    takeMessageRef.current = takeMessage;
    loadInterviewRef.current = loadInterview;
  }, [candidateToken, contentLocale, onData, onError, onCleanup, takeMessage, loadInterview]);

  useEffect(() => {
    if (!skipInitialLoad) {
      void loadInterviewRef.current('initial', candidateTokenRef.current);
    }

    return () => {
      abortControllerRef.current?.abort();
      onCleanupRef.current();
    };
  }, [id, skipInitialLoad]);

  return { loadInterview };
}
