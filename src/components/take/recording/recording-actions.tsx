import { ArrowRight, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/layout';
import type { TakeStage } from '@/components/take/types';
import type { InterviewerPresence } from '@/features/take/use-take-question-tts';
import { TAKE_MESSAGES } from '@/features/take';

interface TakeRecordingActionsProps {
  stage: TakeStage;
  uploading: boolean;
  setupError: string;
  capturePipelineReady: boolean;
  recording: boolean;
  recordingStartBusy: boolean;
  interviewerPresence: InterviewerPresence;
  onReconnect: () => void;
  onRerecord: () => void;
  onSubmit: () => void;
  submitAnswerLabel: string;
}

export function TakeRecordingActions({
  stage,
  uploading,
  setupError,
  capturePipelineReady,
  recording,
  recordingStartBusy,
  interviewerPresence,
  onReconnect,
  onRerecord,
  onSubmit,
  submitAnswerLabel,
}: TakeRecordingActionsProps) {
  const versionActionsEnabled =
    recording &&
    !uploading &&
    stage !== 'transition' &&
    !recordingStartBusy &&
    interviewerPresence === 'listening';

  return (
    <Stack align="stretch" gap={3} width="full">
      {stage === 'interview' && (!capturePipelineReady || setupError) ? (
        <Button
          type="button"
          variant="outline"
          size="xl"
          width="full"
          onClick={onReconnect}
          disabled={uploading}
        >
          {TAKE_MESSAGES.reconnectCameraAndScreen}
        </Button>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="xl"
        width="full"
        onClick={onRerecord}
        disabled={!versionActionsEnabled}
      >
        <RotateCcw size={18} strokeWidth={2} aria-hidden />
        {TAKE_MESSAGES.rerecordAsNewVersion}
      </Button>
      <Button
        type="button"
        variant="gradient"
        size="xl"
        width="full"
        onClick={onSubmit}
        disabled={!versionActionsEnabled}
      >
        {submitAnswerLabel}
        <ArrowRight size={18} strokeWidth={2} aria-hidden />
      </Button>
    </Stack>
  );
}
