import type { PermissionStatus } from '@/components/take/types';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import { Panel } from '@/components/ui/panel';
import { Inline, Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { takeMessage } from '@/features/take';

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
    <Panel tone="surface" radius="lg">
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
    </Panel>
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
    <Stack gap={4} width="full">
      <PermissionRow
        title={takeMessage('permissionCameraMicTitle')}
        description={takeMessage('permissionCameraMicDescription')}
        status={cameraStatus}
        permissionLabel={permissionLabel}
        permissionTone={permissionTone}
      />
      <PermissionRow
        title={takeMessage('permissionScreenTitle')}
        description={
          screenSurface === 'monitor'
            ? takeMessage('permissionScreenReady')
            : takeMessage('chooseEntireScreen')
        }
        status={screenStatus}
        permissionLabel={permissionLabel}
        permissionTone={permissionTone}
      />
    </Stack>
  );
}
