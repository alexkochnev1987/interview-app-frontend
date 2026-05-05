import type { PermissionStatus } from '@/components/take/types';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import { TakePanel } from '@/components/take/take-panel';
import { Inline, Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';

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
    <TakePanel tone="surface" radius="lg">
      <Inline align="center" justify="between" gap={3}>
        <Stack gap={1}>
          <Text as="span" variant="labelSmStrong">
            {title}
          </Text>
          <Text variant="captionMutedXs">{description}</Text>
        </Stack>
        <StatusPill tone={permissionTone(status)}>
          {permissionLabel(status)}
        </StatusPill>
      </Inline>
    </TakePanel>
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
      <Stack gap={3}>
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
      </Stack>
    </TakePanel>
  );
}
