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

  const loadInterview = useCallback(
    async (
      mode: TakeInterviewLoadMode = 'initial',
      tokenOverride?: string,
      localeOverride?: Locale,
    ) => {
      try {
        const effectiveToken = tokenOverride ?? candidateTokenRef.current;
        const effectiveContentLocale = localeOverride ?? contentLocaleRef.current;
        const data = await getTakeInterview(id, effectiveToken, effectiveContentLocale);
        onDataRef.current(data, mode, tokenOverride);
      } catch (err) {
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
      onCleanupRef.current();
    };
  }, [id, skipInitialLoad]);

  return { loadInterview };
}
