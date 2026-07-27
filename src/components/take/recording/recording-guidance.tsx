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
  attemptsExhausted: boolean;
}

export function TakeRecordingGuidance({
  stage,
  recording,
  recordingStartBusy,
  interviewerPresence,
  attemptsExhausted,
}: TakeRecordingGuidanceProps) {
  const tTake = useTranslations('takeFlow');

  let guidance = tTake('guidanceInterview');
  if (attemptsExhausted && !recording) {
    guidance = tTake('attemptsExhaustedGuidance');
  } else if (stage === 'transition') {
    guidance = tTake('guidanceInterview');
  } else if (stage === 'interview' && !recording) {
    if (recordingStartBusy) {
      guidance = tTake('recordingStartingBusy');
    } else if (interviewerPresence === 'speaking') {
      guidance = tTake('guidanceInterviewerSpeaking');
    } else {
      guidance = `${tTake('guidanceBeforeRecording')} ${tTake('attemptBurnsOnRecordStart')}`;
    }
  }

  return (
    <Panel>
      <Stack gap={3}>
        <Text as="span" variant="eyebrowLabel">
          {tTake('recordingGuidanceTitle')}
        </Text>
        <Text variant="bodyMutedSm">{guidance}</Text>
      </Stack>
    </Panel>
  );
}
