import type { TakeStage } from '@/components/take/types';
import { Panel } from '@/components/ui/panel';
import { Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import type { InterviewerPresence } from '@/features/take/use-take-question-tts';
import { useTranslations } from 'next-intl';

interface TakeRecordingGuidanceProps {
  stage: TakeStage;
  recording: boolean;
  recordingStartBusy: boolean;
  interviewerPresence: InterviewerPresence;
}

export function TakeRecordingGuidance({
  stage,
  recording,
  recordingStartBusy,
  interviewerPresence,
}: TakeRecordingGuidanceProps) {
  const tTake = useTranslations('takeFlow');
  return (
    <Panel>
      <Stack gap={3}>
        <Text as="span" variant="eyebrowLabel">
          {tTake('recordingGuidanceTitle')}
        </Text>
        <Text variant="bodyMutedSm">
          {stage === 'transition'
            ? tTake('guidanceInterview')
            : stage === 'interview' && !recording
              ? recordingStartBusy
                ? tTake('recordingStartingBusy')
                : interviewerPresence === 'speaking'
                  ? tTake('guidanceInterviewerSpeaking')
                  : tTake('guidanceBeforeRecording')
              : tTake('guidanceInterview')}
        </Text>
      </Stack>
    </Panel>
  );
}
