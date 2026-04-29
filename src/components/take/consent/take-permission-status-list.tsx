import type { PermissionStatus } from '@/components/take/types';
import { SURFACE_LOW_SOFT_BG } from '@/components/app/style-tokens';
import { StatusPill, type StatusTone } from '@/components/app/status-pill';
import { CaptionMutedXs, LabelSmStrong } from '@/components/layout/content-presets';
import { TakePanel } from '@/components/take/take-panel';

const PERMISSION_ROW_SURFACE = `rounded-[1rem] ${SURFACE_LOW_SOFT_BG}`;
const PERMISSION_ROW_LAYOUT = 'flex items-center justify-between gap-3 px-4 py-3';

interface TakePermissionStatusListProps {
  cameraStatus: PermissionStatus;
  screenStatus: PermissionStatus;
  screenSurface: string;
  permissionLabel: (status: PermissionStatus) => string;
  permissionTone: (status: PermissionStatus) => StatusTone;
}

interface PermissionRowProps {
  title: string;
  description: string;
  status: PermissionStatus;
  permissionLabel: (status: PermissionStatus) => string;
  permissionTone: (status: PermissionStatus) => StatusTone;
}

function PermissionRow({
  title,
  description,
  status,
  permissionLabel,
  permissionTone,
}: PermissionRowProps) {
  return (
    <div className={`${PERMISSION_ROW_LAYOUT} ${PERMISSION_ROW_SURFACE}`}>
      <div className="space-y-1">
        <LabelSmStrong>{title}</LabelSmStrong>
        <CaptionMutedXs>{description}</CaptionMutedXs>
      </div>
      <StatusPill tone={permissionTone(status)}>
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
  permissionTone,
}: TakePermissionStatusListProps) {
  return (
    <TakePanel tone="white" radius="lg" padding="lg">
      <div className="space-y-3">
        <PermissionRow
          title="Camera and microphone"
          description="Required before recording can begin."
          status={cameraStatus}
          permissionLabel={permissionLabel}
          permissionTone={permissionTone}
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
          permissionTone={permissionTone}
        />
      </div>
    </TakePanel>
  );
}
