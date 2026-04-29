import { BodyMutedSm, CaptionMutedXs, CaptionWarningXs, EyebrowLabel } from '@/components/layout/content-presets';
import { TakePanel } from '@/components/take/take-panel';
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
    <TakePanel className="min-h-[130px]">
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
        <div className="mt-2">
          <CaptionMutedXs>Updating transcript for the next question...</CaptionMutedXs>
        </div>
      ) : null}
      {warning ? (
        <div className="mt-2">
          <CaptionWarningXs>{warning}</CaptionWarningXs>
        </div>
      ) : null}
    </TakePanel>
  );
}
