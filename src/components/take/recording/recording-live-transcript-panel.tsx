import { Stack } from '@/components/ui/layout';
import { Panel } from '@/components/ui/panel';
import { Text } from '@/components/ui/text';
import type { TakeStage } from '@/components/take/types';
import { useTranslations } from 'next-intl';

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
  const tTake = useTranslations('takeFlow');
  return (
    <Panel minHeight="transcript">
      <Stack gap={2} grow="fill" height="full">
        <Text as="span" variant="eyebrowLabel">
          {tTake('liveTranscriptTitle')}
        </Text>
        <Stack gap={2} grow="fill" overflow="y">
          {!isSupported ? (
            <Text variant="bodyMutedSm">
              {tTake('liveTranscriptUnavailable')}
            </Text>
          ) : (
            <Text variant="bodySm">
              {finalTranscript || interimTranscript ? (
                <>
                  {finalTranscript}
                  {interimTranscript ? (
                    <Text as="span" variant="transcriptDraft">
                      {interimTranscript} {tTake('liveTranscriptDraftSuffix')}
                    </Text>
                  ) : null}
                </>
              ) : (
                tTake('liveTranscriptPlaceholder')
              )}
            </Text>
          )}
          {warning ? <Text variant="captionWarningXs">{warning}</Text> : null}
        </Stack>
      </Stack>
    </Panel>
  );
}
