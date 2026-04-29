import type { TakeStage } from '@/components/take/types';
import { BodyMutedSm, EyebrowLabel } from '@/components/layout/content-presets';
import { TakePanel } from '@/components/take/take-panel';

interface TakeRecordingGuidanceProps {
  stage: TakeStage;
  transitionLabel: string;
}

export function TakeRecordingGuidance({ stage, transitionLabel }: TakeRecordingGuidanceProps) {
  return (
    <TakePanel>
      <EyebrowLabel>Guidance</EyebrowLabel>
      <div className="mt-3">
        <BodyMutedSm>
          {stage === 'transition'
            ? transitionLabel || 'Saving the current answer version.'
            : 'Recording starts automatically for each question. Use Submit when the answer is ready, or Re-record to create a new version for the same question.'}
        </BodyMutedSm>
      </div>
    </TakePanel>
  );
}
