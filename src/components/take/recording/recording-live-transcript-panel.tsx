import { Stack } from '@/components/ui/layout';
import { Panel } from '@/components/ui/panel';
import { Text } from '@/components/ui/text';
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
    <Panel minHeight="transcript">
      <Stack gap={2} grow="fill" height="full">
        <Text as="span" variant="eyebrowLabel">
          Live transcript
        </Text>
        <Stack gap={2} grow="fill" overflow="y">
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
          {warning ? <Text variant="captionWarningXs">{warning}</Text> : null}
        </Stack>
      </Stack>
    </Panel>
  );
}
