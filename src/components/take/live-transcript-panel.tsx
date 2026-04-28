type TakeStage = 'loading' | 'consent' | 'interview' | 'recording' | 'transition' | 'complete';

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
      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Live transcript
      </div>
      {!isSupported ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Live transcript is unavailable in this browser. Recording continues as usual.
        </p>
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
      {warning ? <p className="mt-2 text-xs leading-5 text-amber-700">{warning}</p> : null}
    </div>
  );
}
