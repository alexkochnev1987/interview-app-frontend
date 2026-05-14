import type { PermissionStatus } from '@/components/take/types';
import type { StatusTone } from '@/components/ui/status-pill';

export const TAKE_RECORDING_LIMIT_SECONDS = 240;

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

export function permissionLabel(status: PermissionStatus) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'granted':
      return 'Ready';
    case 'denied':
      return 'Blocked';
    default:
      return 'Idle';
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

export function getPermissionErrorMessage(error: unknown, requiresEntireScreen = false) {
  if (requiresEntireScreen) {
    return 'Choose Entire screen / Screen in the share picker. Browser tabs and app windows are not accepted.';
  }

  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return 'Camera, microphone, and screen sharing must be allowed to continue.';
    }
    if (error.name === 'NotFoundError') {
      return 'A camera, microphone, or shareable display source was not found on this device.';
    }
    if (error.name === 'AbortError') {
      return 'Permission setup was interrupted. Please try again.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Camera, microphone, and screen sharing must be enabled before the interview can start.';
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
