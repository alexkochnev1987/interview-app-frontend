import { useCallback, useEffect } from 'react';

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
  const loadInterview = useCallback(
    async (mode: 'initial' | 'resume' = 'initial', tokenOverride?: string) => {
      try {
        const data = await getTakeInterview(id, tokenOverride);
        onData(data, mode, tokenOverride);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to load interview');
      }
    },
    [id, onData, onError],
  );

  useEffect(() => {
    void loadInterview('initial', candidateToken);

    return () => {
      onCleanup();
    };
  }, [candidateToken, loadInterview, onCleanup]);

  return { loadInterview };
}
