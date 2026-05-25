import type { StatusTone } from '@/components/ui/status-pill';
import type { TakeStage } from '@/components/take/types';

import { TAKE_MESSAGES } from './messages';
import type { VersionPersistKind } from './session-machine';

export type TakeHeaderStatusDisplay = {
  label: string;
  tone: StatusTone;
};

export function resolveTakeScreenShareStatus(
  screenSurface: string,
): TakeHeaderStatusDisplay {
  if (screenSurface === 'monitor') {
    return { label: 'Full screen', tone: 'completed' };
  }
  return { label: 'Screen pending', tone: 'pending' };
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
      label: submitting ? 'Submitting…' : 'Recording',
      tone: submitting ? 'in_progress' : 'processing',
    };
  }

  if (recordingStartBusy) {
    return { label: TAKE_MESSAGES.recordingStartingBusy, tone: 'in_progress' };
  }

  if (stage === 'recording' && recording) {
    return { label: 'Recording', tone: 'processing' };
  }

  if (stage === 'interview' && !recording) {
    return { label: TAKE_MESSAGES.sessionReadyLabel, tone: 'neutral' };
  }

  return { label: TAKE_MESSAGES.recordingPrepLabel, tone: 'neutral' };
}
