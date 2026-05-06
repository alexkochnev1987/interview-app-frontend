import { StatusPill } from '@/components/ui/status-pill';
import { Button } from '@/components/ui/button';
import { Inline } from '@/components/ui/layout';
import type { TakeStage } from '@/components/take/types';
import { TAKE_MESSAGES } from '@/features/take';

interface TakeRecordingActionsProps {
  stage: TakeStage;
  uploading: boolean;
  transitionLabel: string;
  setupError: string;
  onReconnect: () => void;
  onRerecord: () => void;
  onSubmit: () => void;
}

export function TakeRecordingActions({
  stage,
  uploading,
  transitionLabel,
  setupError,
  onReconnect,
  onRerecord,
  onSubmit,
}: TakeRecordingActionsProps) {
  return (
    <Inline wrap="wrap" gap={3}>
      {stage === 'interview' ? <StatusPill tone="neutral">{TAKE_MESSAGES.preparingRecording}</StatusPill> : null}
      {stage === 'interview' && setupError ? (
        <Button type="button" variant="outline" onClick={onReconnect} disabled={uploading}>
          {TAKE_MESSAGES.reconnectCameraAndScreen}
        </Button>
      ) : null}

      {stage === 'recording' ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onRerecord}
            disabled={uploading}
          >
            {TAKE_MESSAGES.rerecordAsNewVersion}
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={uploading}
            variant="gradient"
          >
            {TAKE_MESSAGES.submitAndNext}
          </Button>
        </>
      ) : null}

      {stage === 'transition' ? (
        <StatusPill tone="processing">{transitionLabel || TAKE_MESSAGES.savingCurrentVersion}</StatusPill>
      ) : null}
    </Inline>
  );
}
