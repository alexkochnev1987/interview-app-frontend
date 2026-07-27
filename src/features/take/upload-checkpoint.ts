export interface TakeUploadCheckpoint {
  questionIndex: number;
  versionNumber: number;
  cameraMediaKey: string;
  screenMediaKey: string;
  recordingSessionId: string;
  startedAt?: string;
  cameraUploadId?: string;
  screenUploadId?: string;
  multipartCompleted?: boolean;
  hasMedia?: boolean;
}

function storageKey(interviewId: string): string {
  return `take:uploadCheckpoint:${interviewId}`;
}

function parseCheckpoint(raw: string | null): TakeUploadCheckpoint | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as TakeUploadCheckpoint;
    if (
      typeof parsed.questionIndex !== 'number' ||
      typeof parsed.versionNumber !== 'number' ||
      typeof parsed.cameraMediaKey !== 'string' ||
      typeof parsed.screenMediaKey !== 'string' ||
      typeof parsed.recordingSessionId !== 'string'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveTakeUploadCheckpoint(
  interviewId: string,
  checkpoint: TakeUploadCheckpoint,
): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(storageKey(interviewId), JSON.stringify(checkpoint));
}

export function patchTakeUploadCheckpoint(
  interviewId: string,
  patch: Partial<TakeUploadCheckpoint>,
): TakeUploadCheckpoint | null {
  const current = readTakeUploadCheckpoint(interviewId);
  if (!current) return null;
  const next = { ...current, ...patch };
  saveTakeUploadCheckpoint(interviewId, next);
  return next;
}

export function readTakeUploadCheckpoint(
  interviewId: string,
): TakeUploadCheckpoint | null {
  if (typeof window === 'undefined') return null;
  return parseCheckpoint(window.sessionStorage.getItem(storageKey(interviewId)));
}

export function clearTakeUploadCheckpoint(interviewId: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(storageKey(interviewId));
}

/** Checkpoint that can be submitted after reload for this question. */
export function getSubmitCheckpoint(
  interviewId: string,
  questionIndex: number,
): TakeUploadCheckpoint | null {
  const checkpoint = readTakeUploadCheckpoint(interviewId);
  if (!checkpoint || checkpoint.questionIndex !== questionIndex) return null;
  if (!checkpoint.hasMedia && !checkpoint.multipartCompleted) return null;
  return checkpoint;
}
