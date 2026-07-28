const RECORDING_SESSION_STORAGE_KEY = 'take:recordingSessionId';

function createRecordingSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `take-session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function writeRecordingSessionId(sessionId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.setItem(RECORDING_SESSION_STORAGE_KEY, sessionId);
}

/** Stable per-tab id for locking answer recording to one browser tab. */
export function getOrCreateRecordingSessionId(): string {
  if (typeof window === 'undefined') {
    return createRecordingSessionId();
  }

  const existing = window.sessionStorage.getItem(RECORDING_SESSION_STORAGE_KEY)?.trim();
  if (existing) {
    return existing;
  }

  const next = createRecordingSessionId();
  writeRecordingSessionId(next);
  return next;
}

/**
 * Prefer a server-locked / in-memory session id when present so reload/reconnect
 * does not mint a conflicting id for the same answer lock.
 */
export function resolveRecordingSessionId(preferred?: string | null): string {
  const locked = preferred?.trim();
  if (locked) {
    writeRecordingSessionId(locked);
    return locked;
  }
  return getOrCreateRecordingSessionId();
}
