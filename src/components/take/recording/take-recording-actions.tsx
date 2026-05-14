import { Button } from '@/components/ui/button';
import { Inline } from '@/components/ui/layout';
import type { TakeStage } from '@/components/take/types';
import { TAKE_MESSAGES } from '@/features/take';

interface TakeRecordingActionsProps {
  stage: TakeStage;
  uploading: boolean;
  setupError: string;
  recording: boolean;
  onReconnect: () => void;
  onRerecord: () => void;
  onSubmit: () => void;
  submitAnswerLabel: string;
}

export function TakeRecordingActions({
  stage,
  uploading,
  setupError,
  recording,
  onReconnect,
  onRerecord,
  onSubmit,
  submitAnswerLabel,
}: TakeRecordingActionsProps) {
  const versionActionsDisabled = uploading || !recording;

  return (
    <Inline wrap="wrap" gap={3}>
      {stage === 'interview' && setupError ? (
        <Button type="button" variant="outline" onClick={onReconnect} disabled={uploading}>
          {TAKE_MESSAGES.reconnectCameraAndScreen}
        </Button>
      ) : null}

      {recording && stage !== 'transition' ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onRerecord}
            disabled={versionActionsDisabled}
          >
            {TAKE_MESSAGES.rerecordAsNewVersion}
          </Button>
          <Button
            type="button"
            variant="gradient"
            onClick={onSubmit}
            disabled={versionActionsDisabled}
          >
            {submitAnswerLabel}
          </Button>
        </>
      ) : null}
    </Inline>
  );
}
