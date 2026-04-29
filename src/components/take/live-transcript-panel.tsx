import { Text } from '@/components/ui/text';
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
    <TakePanel minHeight="transcript">
      <div>
        <Text as="span" variant="eyebrowLabel">
          Live transcript
        </Text>
        {!isSupported ? (
          <div className="mt-2">
            <Text variant="bodyMutedSm">
              Live transcript is unavailable in this browser. Recording continues as usual.
            </Text>
          </div>
        ) : (
          <div className="mt-2">
            <Text variant="bodySm">
              {finalTranscript || interimTranscript ? (
                <>
                  {finalTranscript}
                  {interimTranscript ? (
                    <Text as="span" variant="transcriptDraft">
                      {interimTranscript} (draft)
                    </Text>
                  ) : null}
                </>
              ) : (
                'Transcript will appear while you speak...'
              )}
            </Text>
          </div>
        )}
        {stage === 'transition' ? (
          <div className="mt-2">
            <Text variant="captionMutedXs">Updating transcript for the next question...</Text>
          </div>
        ) : null}
        {warning ? (
          <div className="mt-2">
            <Text variant="captionWarningXs">{warning}</Text>
          </div>
        ) : null}
      </div>
    </TakePanel>
  );
}
