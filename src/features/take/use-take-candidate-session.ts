import { useCallback, useEffect, useState } from 'react';

import { getTakeInterview } from '@/lib/api';

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
  const [sessionSyncError, setSessionSyncError] = useState<string | null>(null);
  const [syncAttempt, setSyncAttempt] = useState(0);

  const confirmSessionReady = useCallback(() => {
    setSessionSyncError(null);
    setCandidateSessionReady(true);
  }, []);

  const retrySessionSync = useCallback(() => {
    setSessionSyncError(null);
    setSyncAttempt((attempt) => attempt + 1);
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
        setSessionSyncError(null);
        setCandidateSessionReady(true);
        window.history.replaceState(null, '', `/take/${interviewId}`);
      } catch (err) {
        if (cancelled) {
          return;
        }
        const description =
          err instanceof Error ? err.message : TAKE_MESSAGES.sessionSyncFailed;
        setSessionSyncError(description);
        setCandidateSessionReady(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [interviewId, candidateToken, syncAttempt]);

  return {
    candidateSessionReady,
    confirmSessionReady,
    sessionSyncError,
    retrySessionSync,
  };
}
