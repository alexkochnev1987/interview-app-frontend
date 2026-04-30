import { Text } from '@/components/ui/text';
import { TakePanel } from '@/components/take/take-panel';
import { Stack } from '@/components/ui/layout';
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
      <Stack gap={2}>
        <Text as="span" variant="eyebrowLabel">
          Live transcript
        </Text>
        {!isSupported ? (
          <Text variant="bodyMutedSm">
            Live transcript is unavailable in this browser. Recording continues as usual.
          </Text>
        ) : (
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
        )}
        {stage === 'transition' ? (
          <Text variant="captionMutedXs">Updating transcript for the next question...</Text>
        ) : null}
        {warning ? (
          <Text variant="captionWarningXs">{warning}</Text>
        ) : null}
      </Stack>
    </TakePanel>
  );
}
