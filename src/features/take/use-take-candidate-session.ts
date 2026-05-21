import { useCallback, useEffect, useState } from 'react';

import { getTakeInterview } from '@/lib/api';
import { notifyError } from '@/lib/toast';

import { TAKE_MESSAGES } from './messages';

interface UseTakeCandidateSessionParams {
  interviewId: string;
  candidateToken: string;
}

export function useTakeCandidateSession({
  interviewId,
  candidateToken,
}: UseTakeCandidateSessionParams) {
  const [candidateSessionReady, setCandidateSessionReady] = useState(
    () => !candidateToken,
  );

  const confirmSessionReady = useCallback(() => {
    setCandidateSessionReady(true);
  }, []);

  useEffect(() => {
    if (!candidateToken) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setCandidateSessionReady(false);

      try {
        await getTakeInterview(interviewId, candidateToken);
        if (cancelled) {
          return;
        }
        setCandidateSessionReady(true);
        window.history.replaceState(null, '', `/take/${interviewId}`);
      } catch (err) {
        if (cancelled) {
          return;
        }
        const description =
          err instanceof Error ? err.message : TAKE_MESSAGES.sessionSyncFailed;
        notifyError('Session could not start', {
          id: `take-session-sync-${interviewId}`,
          description,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [interviewId, candidateToken]);

  return { candidateSessionReady, confirmSessionReady };
}
