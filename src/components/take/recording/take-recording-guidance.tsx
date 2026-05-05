import type { TakeStage } from '@/components/take/types';
import { TakePanel } from '@/components/take/take-panel';
import { Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';

interface TakeRecordingGuidanceProps {
  stage: TakeStage;
  transitionLabel: string;
}

export function TakeRecordingGuidance({ stage, transitionLabel }: TakeRecordingGuidanceProps) {
  return (
    <TakePanel>
      <Stack gap={3}>
        <Text as="span" variant="eyebrowLabel">
          Guidance
        </Text>
        <Text variant="bodyMutedSm">
          {stage === 'transition'
            ? transitionLabel || 'Saving the current answer version.'
            : 'Recording starts automatically for each question. Use Submit when the answer is ready, or Re-record to create a new version for the same question.'}
        </Text>
      </Stack>
    </TakePanel>
  );
}
