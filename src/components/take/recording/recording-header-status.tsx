import { StatusPill } from '@/components/ui/status-pill';
import { Inline } from '@/components/ui/layout';
import type { TakeStage } from '@/components/take/types';
import {
  resolveTakeScreenShareStatus,
  resolveTakeSessionStatus,
} from '@/features/take/recording-header-status';
import type { VersionPersistKind } from '@/features/take/session-machine';

interface TakeRecordingHeaderStatusProps {
  screenSurface: string;
  stage: TakeStage;
  recording: boolean;
  recordingStartBusy: boolean;
  versionPersistKind: VersionPersistKind | null;
}

export function TakeRecordingHeaderStatus({
  screenSurface,
  stage,
  recording,
  recordingStartBusy,
  versionPersistKind,
}: TakeRecordingHeaderStatusProps) {
  const screen = resolveTakeScreenShareStatus(screenSurface);
  const session = resolveTakeSessionStatus({
    stage,
    recording,
    recordingStartBusy,
    versionPersistKind,
  });

  return (
    <Inline wrap="nowrap" align="center" gap={2}>
      <StatusPill tone={screen.tone} size="header">
        {screen.label}
      </StatusPill>
      <StatusPill tone={session.tone} size="header">
        {session.label}
      </StatusPill>
    </Inline>
  );
}
