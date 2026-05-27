import type { StatusTone } from '@/components/ui/status-pill';
import type { TakeStage } from '@/components/take/types';

import { takeMessage } from './messages';
import type { VersionPersistKind } from './session-machine';

export type TakeHeaderStatusDisplay = {
  label: string;
  tone: StatusTone;
};

export function resolveTakeScreenShareStatus(
  screenSurface: string,
): TakeHeaderStatusDisplay {
  if (screenSurface === 'monitor') {
    return { label: takeMessage('screenShareFull'), tone: 'completed' };
  }
  return { label: takeMessage('screenSharePending'), tone: 'pending' };
}

export function resolveTakeSessionStatus(params: {
  stage: TakeStage;
  recording: boolean;
  recordingStartBusy: boolean;
  versionPersistKind: VersionPersistKind | null;
}): TakeHeaderStatusDisplay {
  const { stage, recording, recordingStartBusy, versionPersistKind } = params;

  if (stage === 'transition') {
    const submitting = versionPersistKind === 'submit';
    return {
      label: submitting ? takeMessage('recordingSubmitInProgress') : takeMessage('recordingState'),
      tone: submitting ? 'in_progress' : 'processing',
    };
  }

  if (recordingStartBusy) {
    return { label: takeMessage('recordingStartingBusy'), tone: 'in_progress' };
  }

  if (stage === 'recording' && recording) {
    return { label: takeMessage('recordingState'), tone: 'processing' };
  }

  if (stage === 'interview' && !recording) {
    return { label: takeMessage('sessionReadyLabel'), tone: 'neutral' };
  }

  return { label: takeMessage('recordingPrepLabel'), tone: 'neutral' };
}
