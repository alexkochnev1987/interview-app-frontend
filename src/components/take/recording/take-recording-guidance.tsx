import type { TakeStage } from '@/components/take/types';
import { TakePanel } from '@/components/take/take-panel';
import { Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import { TAKE_MESSAGES } from '@/features/take';
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
    <TakePanel>
      <Stack gap={3}>
        <Text as="span" variant="eyebrowLabel">
          Guidance
        </Text>
        <Text variant="bodyMutedSm">
          {stage === 'transition'
            ? TAKE_MESSAGES.guidanceInterview
            : stage === 'interview' && !recording
              ? recordingStartBusy
                ? TAKE_MESSAGES.recordingStartingBusy
                : interviewerPresence === 'speaking'
                  ? TAKE_MESSAGES.guidanceInterviewerSpeaking
                  : TAKE_MESSAGES.guidanceBeforeRecording
              : TAKE_MESSAGES.guidanceInterview}
        </Text>
      </Stack>
    </TakePanel>
  );
}
