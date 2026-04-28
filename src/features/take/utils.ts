export type TakePermissionStatus = 'idle' | 'pending' | 'granted' | 'denied';

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

export function permissionLabel(status: TakePermissionStatus) {
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

export function permissionClasses(status: TakePermissionStatus) {
  switch (status) {
    case 'pending':
      return 'bg-blue-100 text-blue-800 ring-blue-200/80';
    case 'granted':
      return 'bg-emerald-100 text-emerald-800 ring-emerald-200/80';
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
