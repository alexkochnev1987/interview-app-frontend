import type { PermissionStatus } from '@/components/take/types';
import type { StatusTone } from '@/components/ui/status-pill';
import type { TakeMessageGetter } from './messages';

export const TAKE_RECORDING_LIMIT_SECONDS = 240;

const MEDIA_RECORDER_CANDIDATE_TYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4',
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
] as const;

export function pickSupportedMediaRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
    return undefined;
  }

  for (const type of MEDIA_RECORDER_CANDIDATE_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return undefined;
}

export function buildMediaRecorderOptions(
  videoBitsPerSecond = 1_500_000,
): MediaRecorderOptions {
  const mimeType = pickSupportedMediaRecorderMimeType();

  if (mimeType) {
    return { mimeType, videoBitsPerSecond };
  }

  return { videoBitsPerSecond };
}

export interface TakeBehaviorSignals {
  tabHiddenCount: number;
  windowBlurCount: number;
  copyCount: number;
  pasteCount: number;
  keydownCount: number;
  resizeCount: number;
}

export function createEmptyBehaviorSignals(): TakeBehaviorSignals {
  return {
    tabHiddenCount: 0,
    windowBlurCount: 0,
    copyCount: 0,
    pasteCount: 0,
    keydownCount: 0,
    resizeCount: 0,
  };
}

export function permissionLabel(status: PermissionStatus, takeMessage: TakeMessageGetter) {
  switch (status) {
    case 'pending':
      return takeMessage('permissionPending');
    case 'granted':
      return takeMessage('permissionReady');
    case 'denied':
      return takeMessage('permissionBlocked');
    default:
      return takeMessage('permissionIdle');
  }
}

export function permissionTone(status: PermissionStatus): StatusTone {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'granted':
      return 'completed';
    case 'denied':
      return 'failed';
    default:
      return 'neutral_meta';
  }
}

export function getPermissionErrorMessage(
  error: unknown,
  requiresEntireScreen = false,
  takeMessage: TakeMessageGetter,
) {
  if (requiresEntireScreen) {
    return takeMessage('chooseEntireScreen');
  }

  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return takeMessage('permissionNotAllowed');
    }
    if (error.name === 'NotFoundError') {
      return takeMessage('permissionNotFound');
    }
    if (error.name === 'AbortError') {
      return takeMessage('permissionAborted');
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return takeMessage('permissionGeneric');
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export function formatRecordingLimitLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (remainder === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${remainder} sec`;
}
