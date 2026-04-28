import type { PermissionStatus } from '@/components/take/types';

export interface TakeBehaviorSignals {
  tabHiddenCount: number;
  windowBlurCount: number;
  pasteCount: number;
  keydownCount: number;
  resizeCount: number;
}

export function createEmptyBehaviorSignals(): TakeBehaviorSignals {
  return {
    tabHiddenCount: 0,
    windowBlurCount: 0,
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

export function permissionClasses(status: PermissionStatus) {
  switch (status) {
    case 'pending':
      return 'bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending-fg)] ring-[var(--color-status-pending-ring)]/80';
    case 'granted':
      return 'bg-[var(--color-status-completed-bg)] text-[var(--color-status-completed-fg)] ring-[var(--color-status-completed-ring)]/80';
    case 'denied':
      return 'bg-destructive/10 text-destructive ring-destructive/30';
    default:
      return 'bg-[hsl(var(--surface-high)/0.9)] text-muted-foreground ring-border/50';
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
