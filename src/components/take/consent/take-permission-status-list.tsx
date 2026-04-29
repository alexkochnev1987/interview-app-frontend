import type { PermissionStatus } from '@/components/take/types';
import { StatusPill } from '@/components/app/status-pill';
import { CaptionMutedXs, LabelSmStrong } from '@/components/layout/content-presets';
import { TakePanel } from '@/components/take/take-panel';

interface TakePermissionStatusListProps {
  cameraStatus: PermissionStatus;
  screenStatus: PermissionStatus;
  screenSurface: string;
  permissionLabel: (status: PermissionStatus) => string;
  permissionClasses: (status: PermissionStatus) => string;
}

interface PermissionRowProps {
  title: string;
  description: string;
  status: PermissionStatus;
  permissionLabel: (status: PermissionStatus) => string;
  permissionClasses: (status: PermissionStatus) => string;
}

function PermissionRow({
  title,
  description,
  status,
  permissionLabel,
  permissionClasses,
}: PermissionRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1rem] bg-[hsl(var(--surface-low)/0.8)] px-4 py-3">
      <div className="space-y-1">
        <LabelSmStrong>{title}</LabelSmStrong>
        <CaptionMutedXs>{description}</CaptionMutedXs>
      </div>
      <StatusPill tone="neutral" className={permissionClasses(status)}>
        {permissionLabel(status)}
      </StatusPill>
    </div>
  );
}

export function TakePermissionStatusList({
  cameraStatus,
  screenStatus,
  screenSurface,
  permissionLabel,
  permissionClasses,
}: TakePermissionStatusListProps) {
  return (
    <TakePanel tone="white" radius="lg" padding="lg" className="space-y-3">
      <PermissionRow
        title="Camera and microphone"
        description="Required before recording can begin."
        status={cameraStatus}
        permissionLabel={permissionLabel}
        permissionClasses={permissionClasses}
      />
      <PermissionRow
        title="Entire screen share"
        description={
          screenSurface === 'monitor'
            ? 'Entire screen is confirmed and ready.'
            : 'In the share picker, choose Entire screen / Screen.'
        }
        status={screenStatus}
        permissionLabel={permissionLabel}
        permissionClasses={permissionClasses}
      />
    </TakePanel>
  );
}
