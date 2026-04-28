import type { TakeStage } from '@/components/take/types';

interface TakeRecordingGuidanceProps {
  stage: TakeStage;
  transitionLabel: string;
}

export function TakeRecordingGuidance({ stage, transitionLabel }: TakeRecordingGuidanceProps) {
  return (
    <div className="rounded-[1.25rem] bg-[hsl(var(--surface-low)/0.85)] p-4 ring-1 ring-border/45">
      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Guidance
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {stage === 'transition'
          ? transitionLabel || 'Saving the current answer version.'
          : 'Recording starts automatically for each question. Use Submit when the answer is ready, or Re-record to create a new version for the same question.'}
      </p>
    </div>
  );
}
