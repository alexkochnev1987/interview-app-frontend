import { StatusPill } from '@/components/app/status-pill';
import { Button } from '@/components/ui/button';
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
    <div className="flex flex-wrap gap-3">
      {stage === 'interview' ? <StatusPill tone="neutral">Preparing recording...</StatusPill> : null}

      {stage === 'recording' ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onRerecord}
            disabled={uploading}
            className="rounded-full bg-white/80"
          >
            Re-record as new version
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={uploading}
            className="rounded-full bg-primary-gradient px-5 shadow-soft hover:brightness-105"
          >
            Submit & Next
          </Button>
        </>
      ) : null}

      {stage === 'transition' ? (
        <StatusPill tone="processing">{transitionLabel || 'Saving current version'}</StatusPill>
      ) : null}
    </div>
  );
}
