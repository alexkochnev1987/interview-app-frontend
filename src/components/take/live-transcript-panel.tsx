import { BodyMutedSm, EyebrowLabel } from '@/components/layout/content-presets';
import type { TakeStage } from '@/components/take/types';

interface LiveTranscriptPanelProps {
  isSupported: boolean;
  finalTranscript: string;
  interimTranscript: string;
  warning?: string;
  stage: TakeStage;
}

export function LiveTranscriptPanel({
  isSupported,
  finalTranscript,
  interimTranscript,
  warning,
  stage,
}: LiveTranscriptPanelProps) {
  return (
    <div className="min-h-[130px] rounded-[1.25rem] bg-[hsl(var(--surface-low)/0.85)] p-4 ring-1 ring-border/45">
      <EyebrowLabel>Live transcript</EyebrowLabel>
      {!isSupported ? (
        <div className="mt-2">
          <BodyMutedSm>Live transcript is unavailable in this browser. Recording continues as usual.</BodyMutedSm>
        </div>
      ) : (
        <p className="mt-2 text-sm leading-6 text-foreground">
          {finalTranscript || interimTranscript ? (
            <>
              {finalTranscript}
              {interimTranscript ? (
                <span className="ml-1 italic text-muted-foreground">{interimTranscript} (draft)</span>
              ) : null}
            </>
          ) : (
            'Transcript will appear while you speak...'
          )}
        </p>
      )}
      {stage === 'transition' ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Updating transcript for the next question...
        </p>
      ) : null}
      {warning ? (
        <p className="mt-2 text-xs leading-5 text-[var(--color-status-pending-fg)]">{warning}</p>
      ) : null}
    </div>
  );
}
