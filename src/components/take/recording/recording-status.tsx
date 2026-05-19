import { StatusPill } from '@/components/ui/status-pill';
import { Inline } from '@/components/ui/layout';
import type { TakeStage } from '@/components/take/types';
import type { VersionPersistKind } from '@/features/take/session-machine';
import { TAKE_MESSAGES } from '@/features/take';

interface TakeRecordingStatusProps {
  stage: TakeStage;
  recording: boolean;
  recordingStartBusy: boolean;
  versionPersistKind: VersionPersistKind | null;
  density?: 'default' | 'compact';
}

export function TakeRecordingStatus({
  stage,
  recording,
  recordingStartBusy,
  versionPersistKind,
  density = 'default',
}: TakeRecordingStatusProps) {
  let sessionLabel: string = TAKE_MESSAGES.recordingPrepLabel;
  if (stage === 'transition') {
    sessionLabel = versionPersistKind === 'submit' ? 'Submitting…' : 'Recording';
  } else if (recordingStartBusy) sessionLabel = TAKE_MESSAGES.recordingStartingBusy;
  else if (stage === 'recording' && recording) sessionLabel = 'Recording';
  else if (stage === 'interview' && !recording) sessionLabel = TAKE_MESSAGES.sessionReadyLabel;

  const gap = density === 'compact' ? 2 : 3;
  const pillSize = density === 'compact' ? 'compact' : 'default';

  const activeRecording =
    (recording && stage === 'recording') ||
    (stage === 'transition' && versionPersistKind !== 'submit');

  return (
    <Inline wrap="wrap" align="center" gap={gap}>
      <StatusPill tone={activeRecording ? 'processing' : 'neutral'} size={pillSize}>
        {sessionLabel}
      </StatusPill>
    </Inline>
  );
}
