import { useCallback, useEffect, useRef } from 'react';

import { getTakeInterview, type TakeInterviewData } from '@/lib/api';

interface UseTakeInterviewLoaderParams {
  id: string;
  candidateToken: string;
  skipInitialLoad?: boolean;
  onData: (data: TakeInterviewData, mode: 'initial' | 'resume', tokenOverride?: string) => void;
  onError: (message: string) => void;
  onCleanup: () => void;
}

export function useTakeInterviewLoader({
  id,
  candidateToken,
  skipInitialLoad,
  onData,
  onError,
  onCleanup,
}: UseTakeInterviewLoaderParams) {
  const candidateTokenRef = useRef(candidateToken);
  const onDataRef = useRef(onData);
  const onErrorRef = useRef(onError);
  const onCleanupRef = useRef(onCleanup);

  useEffect(() => {
    if (candidateToken) {
      candidateTokenRef.current = candidateToken;
    }
    onDataRef.current = onData;
    onErrorRef.current = onError;
    onCleanupRef.current = onCleanup;
  }, [candidateToken, onData, onError, onCleanup]);

  const loadInterview = useCallback(
    async (mode: 'initial' | 'resume' = 'initial', tokenOverride?: string) => {
      try {
        const effectiveToken = tokenOverride ?? candidateTokenRef.current;
        const data = await getTakeInterview(id, effectiveToken);
        onDataRef.current(data, mode, tokenOverride);
      } catch (err) {
        onErrorRef.current(err instanceof Error ? err.message : 'Failed to load interview');
      }
    },
    [id],
  );

  useEffect(() => {
    if (!skipInitialLoad) {
      void loadInterview('initial', candidateTokenRef.current)
    }

    return () => {
      onCleanupRef.current()
    }
  }, [loadInterview, skipInitialLoad])

  return { loadInterview };
}
