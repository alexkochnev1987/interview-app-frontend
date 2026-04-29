import type { TakeStage } from '@/components/take/types';
import { TakePanel } from '@/components/take/take-panel';
import { Text } from '@/components/ui/text';

interface TakeRecordingGuidanceProps {
  stage: TakeStage;
  transitionLabel: string;
}

export function TakeRecordingGuidance({ stage, transitionLabel }: TakeRecordingGuidanceProps) {
  return (
    <TakePanel>
      <Text as="span" variant="eyebrowLabel">
        Guidance
      </Text>
      <div className="mt-3">
        <Text variant="bodyMutedSm">
          {stage === 'transition'
            ? transitionLabel || 'Saving the current answer version.'
            : 'Recording starts automatically for each question. Use Submit when the answer is ready, or Re-record to create a new version for the same question.'}
        </Text>
      </div>
    </TakePanel>
  );
}
