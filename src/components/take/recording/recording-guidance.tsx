import type { TakeStage } from '@/components/take/types';
import { Panel } from '@/components/ui/panel';
import { Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import type { ExhaustedHint } from '@/features/take/session-machine';
import type { InterviewerPresence } from '@/features/take/use-take-question-tts';
import { useTranslations } from 'next-intl';

interface TakeRecordingGuidanceProps {
  stage: TakeStage;
  recording: boolean;
  recordingStartBusy: boolean;
  interviewerPresence: InterviewerPresence;
  exhaustedHint: ExhaustedHint | null;
}

export function TakeRecordingGuidance({
  stage,
  recording,
  recordingStartBusy,
  interviewerPresence,
  exhaustedHint,
}: TakeRecordingGuidanceProps) {
  const tTake = useTranslations('takeFlow');

  let guidance = tTake('guidanceInterview');
  if (!recording && exhaustedHint === 'submit') {
    guidance = tTake('reviewSubmitBanner');
  } else if (!recording && exhaustedHint === 'no-media') {
    guidance = tTake('attemptsExhaustedNoMedia');
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

  const isReviewBanner = !recording && exhaustedHint === 'submit';

  return (
    <Panel>
      <Stack gap={3}>
        <Text as="span" variant="eyebrowLabel">
          {tTake('recordingGuidanceTitle')}
        </Text>
        <Text variant={isReviewBanner ? 'bodySm' : 'bodyMutedSm'}>{guidance}</Text>
      </Stack>
    </Panel>
  );
}
