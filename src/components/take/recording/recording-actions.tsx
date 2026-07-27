import { ArrowRight, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Inline, Stack } from '@/components/ui/layout';
import { BodyText } from '@/components/ui/text';
import type { TakeStage } from '@/components/take/types';
import type { ExhaustedHint } from '@/features/take/session-machine';
import type { InterviewerPresence } from '@/features/take/use-take-question-tts';

interface TakeRecordingActionsProps {
  stage: TakeStage;
  uploading: boolean;
  setupError: string;
  capturePipelineReady: boolean;
  recording: boolean;
  recordingStartBusy: boolean;
  interviewerPresence: InterviewerPresence;
  retakeDisabled: boolean;
  displayedAttemptNumber: number;
  maxAttempts: number;
  attemptsExhausted: boolean;
  submitAllowed: boolean;
  exhaustedHint: ExhaustedHint | null;
  onReconnect: () => void;
  onRerecord: () => void;
  onSubmit: () => void;
  submitAnswerLabel: string;
}

const EXHAUSTED_HINT_KEY = {
  submit: 'attemptsExhaustedSubmitHint',
  'no-media': 'attemptsExhaustedNoMedia',
  unavailable: 'attemptsExhaustedSubmitUnavailable',
} as const;

export function TakeRecordingActions({
  stage,
  uploading,
  setupError,
  capturePipelineReady,
  recording,
  recordingStartBusy,
  interviewerPresence,
  retakeDisabled,
  displayedAttemptNumber,
  maxAttempts,
  attemptsExhausted,
  submitAllowed,
  exhaustedHint,
  onReconnect,
  onRerecord,
  onSubmit,
  submitAnswerLabel,
}: TakeRecordingActionsProps) {
  const tTake = useTranslations('takeFlow');
  const versionActionsEnabled =
    recording &&
    !uploading &&
    stage !== 'transition' &&
    !recordingStartBusy &&
    interviewerPresence === 'listening';
  const retakeEnabled = versionActionsEnabled && !retakeDisabled;
  const submitEnabled =
    !uploading &&
    stage !== 'transition' &&
    submitAllowed &&
    (versionActionsEnabled || (attemptsExhausted && !recording));

  return (
    <Stack align="stretch" gap={3} width="full">
      {!capturePipelineReady || setupError ? (
        <Button
          type="button"
          variant="outline"
          size="xl"
          width="full"
          onClick={onReconnect}
          disabled={uploading}
        >
          {tTake('reconnectCameraAndScreen')}
        </Button>
      ) : null}

      <Inline align="center" gap={1}>
        <BodyText as="span" size="xs" tone="muted" weight="medium">
          {tTake('attemptsMetricLabel')}
        </BodyText>
        <BodyText as="span" size="xs" tone="foreground" weight="semibold">
          {displayedAttemptNumber}/{maxAttempts}
        </BodyText>
      </Inline>

      {!attemptsExhausted || recording ? (
        <Button
          type="button"
          variant="outline"
          size="xl"
          width="full"
          onClick={onRerecord}
          disabled={!retakeEnabled}
        >
          <RotateCcw size={18} strokeWidth={2} aria-hidden />
          {tTake('rerecordAsNewVersion')}
        </Button>
      ) : null}
      {versionActionsEnabled && retakeDisabled ? (
        <BodyText size="xs" tone="muted">
          {tTake('retakeDisabledAtLimitHint')}
        </BodyText>
      ) : null}
      {exhaustedHint ? (
        <BodyText size="xs" tone="muted">
          {tTake(EXHAUSTED_HINT_KEY[exhaustedHint])}
        </BodyText>
      ) : null}
      <Button
        type="button"
        variant="gradient"
        size="xl"
        width="full"
        onClick={onSubmit}
        disabled={!submitEnabled}
      >
        {submitAnswerLabel}
        <ArrowRight size={18} strokeWidth={2} aria-hidden />
      </Button>
    </Stack>
  );
}
