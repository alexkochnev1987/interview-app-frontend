import type { PermissionStatus } from '@/components/take/types';

interface TakePermissionStatusListProps {
  cameraStatus: PermissionStatus;
  screenStatus: PermissionStatus;
  screenSurface: string;
  permissionLabel: (status: PermissionStatus) => string;
  permissionClasses: (status: PermissionStatus) => string;
}

export function TakePermissionStatusList({
  cameraStatus,
  screenStatus,
  screenSurface,
  permissionLabel,
  permissionClasses,
}: TakePermissionStatusListProps) {
  return (
    <div className="space-y-3 rounded-[1.5rem] bg-white/85 p-5 ring-1 ring-border/45">
      <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-[hsl(var(--surface-low)/0.8)] px-4 py-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-foreground">Camera and microphone</div>
          <p className="text-xs leading-5 text-muted-foreground">
            Required before recording can begin.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ring-1 ${permissionClasses(cameraStatus)}`}
        >
          {permissionLabel(cameraStatus)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-[hsl(var(--surface-low)/0.8)] px-4 py-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-foreground">Entire screen share</div>
          <p className="text-xs leading-5 text-muted-foreground">
            {screenSurface === 'monitor'
              ? 'Entire screen is confirmed and ready.'
              : 'In the share picker, choose Entire screen / Screen.'}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ring-1 ${permissionClasses(screenStatus)}`}
        >
          {permissionLabel(screenStatus)}
        </span>
      </div>
    </div>
  );
}
