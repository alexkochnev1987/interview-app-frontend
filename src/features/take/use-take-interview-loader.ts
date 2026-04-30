import { useCallback, useEffect, useRef } from 'react';

import { getTakeInterview, type TakeInterviewData } from '@/lib/api';

interface UseTakeInterviewLoaderParams {
  id: string;
  candidateToken: string;
  onData: (data: TakeInterviewData, mode: 'initial' | 'resume', tokenOverride?: string) => void;
  onError: (message: string) => void;
  onCleanup: () => void;
}

export function useTakeInterviewLoader({
  id,
  candidateToken,
  onData,
  onError,
  onCleanup,
}: UseTakeInterviewLoaderParams) {
  const onDataRef = useRef(onData);
  const onErrorRef = useRef(onError);
  const onCleanupRef = useRef(onCleanup);

  useEffect(() => {
    onDataRef.current = onData;
    onErrorRef.current = onError;
    onCleanupRef.current = onCleanup;
  }, [onData, onError, onCleanup]);

  const loadInterview = useCallback(
    async (mode: 'initial' | 'resume' = 'initial', tokenOverride?: string) => {
      try {
        const effectiveToken = tokenOverride ?? candidateToken;
        const data = await getTakeInterview(id, effectiveToken);
        onDataRef.current(data, mode, tokenOverride);
      } catch (err) {
        onErrorRef.current(err instanceof Error ? err.message : 'Failed to load interview');
      }
    },
    [id, candidateToken],
  );

  useEffect(() => {
    void loadInterview('initial', candidateToken);

    return () => {
      onCleanupRef.current();
    };
  }, [candidateToken, loadInterview]);

  return { loadInterview };
}
