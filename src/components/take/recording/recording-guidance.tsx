import type { TakeStage } from '@/components/take/types';
import { Panel } from '@/components/ui/panel';
import { Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { takeMessage } from '@/features/take';
import type { InterviewerPresence } from '@/features/take/use-take-question-tts';

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
  return (
    <Panel>
      <Stack gap={3}>
        <Text as="span" variant="eyebrowLabel">
          {takeMessage('recordingGuidanceTitle')}
        </Text>
        <Text variant="bodyMutedSm">
          {stage === 'transition'
            ? takeMessage('guidanceInterview')
            : stage === 'interview' && !recording
              ? recordingStartBusy
                ? takeMessage('recordingStartingBusy')
                : interviewerPresence === 'speaking'
                  ? takeMessage('guidanceInterviewerSpeaking')
                  : takeMessage('guidanceBeforeRecording')
              : takeMessage('guidanceInterview')}
        </Text>
      </Stack>
    </Panel>
  );
}
