import { StatusPill } from '@/components/ui/status-pill';
import { Button } from '@/components/ui/button';
import { Inline } from '@/components/ui/layout';
import type { TakeStage } from '@/components/take/types';

interface TakeRecordingActionsProps {
  stage: TakeStage;
  uploading: boolean;
  transitionLabel: string;
  onRerecord: () => void;
  onSubmit: () => void;
}

export function TakeRecordingActions({
  stage,
  uploading,
  transitionLabel,
  onRerecord,
  onSubmit,
}: TakeRecordingActionsProps) {
  return (
    <Inline wrap="wrap" gap={3}>
      {stage === 'interview' ? <StatusPill tone="neutral">Preparing recording...</StatusPill> : null}

      {stage === 'recording' ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onRerecord}
            disabled={uploading}
          >
            Re-record as new version
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={uploading}
            variant="gradient"
          >
            Submit & Next
          </Button>
        </>
      ) : null}

      {stage === 'transition' ? (
        <StatusPill tone="processing">{transitionLabel || 'Saving current version'}</StatusPill>
      ) : null}
    </Inline>
  );
}
