import { useCallback, useEffect, useState } from 'react';

import { syncCandidateSession } from '@/lib/api';

import { takeMessage } from './messages';

interface UseTakeCandidateSessionParams {
  interviewId: string;
  candidateToken: string;
  sessionReady?: boolean;
}

export function useTakeCandidateSession({
  interviewId,
  candidateToken,
  sessionReady: sessionReadyInitial = !candidateToken,
}: UseTakeCandidateSessionParams) {
  const [candidateSessionReady, setCandidateSessionReady] = useState(
    sessionReadyInitial,
  );
  const [sessionSyncError, setSessionSyncError] = useState<string | null>(null);
  const [syncAttempt, setSyncAttempt] = useState(0);

  const retrySessionSync = useCallback(() => {
    setSessionSyncError(null);
    setSyncAttempt((attempt) => attempt + 1);
  }, []);

  useEffect(() => {
    if (!sessionReadyInitial || typeof window === 'undefined') {
      return;
    }

    const path = `/take/${interviewId}`;
    if (window.location.pathname !== path) {
      return;
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has('token')) {
      return;
    }

    url.searchParams.delete('token');
    const next = url.search ? `${path}${url.search}` : path;
    window.history.replaceState(null, '', next);
  }, [interviewId, sessionReadyInitial]);

  useEffect(() => {
    if (!candidateToken || sessionReadyInitial) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        await syncCandidateSession(interviewId, candidateToken);
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
          err instanceof Error ? err.message : takeMessage('sessionSyncFailed');
        setSessionSyncError(description);
        setCandidateSessionReady(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [interviewId, candidateToken, sessionReadyInitial, syncAttempt]);

  return {
    candidateSessionReady,
    sessionSyncError,
    retrySessionSync,
  };
}
