import { useCallback, useEffect, useState } from 'react';

import { syncCandidateSession } from '@/lib/api';
import type { TakeMessageGetter } from './messages';

interface UseTakeCandidateSessionParams {
  interviewId: string;
  candidateToken: string;
  sessionReady?: boolean;
  takeMessage: TakeMessageGetter;
}

export function useTakeCandidateSession({
  interviewId,
  candidateToken,
  sessionReady: sessionReadyInitial = !candidateToken,
  takeMessage,
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

  const clearTokenFromCurrentUrl = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has('token')) return;
    url.searchParams.delete('token');
    const nextSearch = url.searchParams.toString();
    const next = nextSearch ? `${url.pathname}?${nextSearch}` : url.pathname;
    window.history.replaceState(null, '', next);
  }, []);

  useEffect(() => {
    if (!sessionReadyInitial || typeof window === 'undefined') {
      return;
    }

    if (!window.location.pathname.endsWith(`/take/${interviewId}`)) {
      return;
    }

    clearTokenFromCurrentUrl();
  }, [interviewId, sessionReadyInitial, clearTokenFromCurrentUrl]);

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
        clearTokenFromCurrentUrl();
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
  }, [interviewId, candidateToken, sessionReadyInitial, syncAttempt, clearTokenFromCurrentUrl, takeMessage]);

  return {
    candidateSessionReady,
    sessionSyncError,
    retrySessionSync,
  };
}
