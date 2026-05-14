import { Stack } from '@/components/ui/layout';
import { TakePanel } from '@/components/take/take-panel';
import { Text } from '@/components/ui/text';
import { TranscriptScrollArea } from '@/components/ui/transcript-scroll-area';
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
      <Stack gap={2} grow="fill" height="full">
        <Text as="span" variant="eyebrowLabel">
          Live transcript
        </Text>
        <TranscriptScrollArea>
          <Stack gap={2}>
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
            {warning ? (
              <Text variant="captionWarningXs">{warning}</Text>
            ) : null}
          </Stack>
        </TranscriptScrollArea>
      </Stack>
    </TakePanel>
  );
}
