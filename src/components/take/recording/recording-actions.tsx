import { ArrowRight, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/layout';
import type { TakeStage } from '@/components/take/types';
import type { InterviewerPresence } from '@/features/take/use-take-question-tts';

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
  const tTake = useTranslations('takeFlow');
  const versionActionsEnabled =
    recording &&
    !uploading &&
    stage !== 'transition' &&
    !recordingStartBusy &&
    interviewerPresence === 'listening';

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

      <Button
        type="button"
        variant="outline"
        size="xl"
        width="full"
        onClick={onRerecord}
        disabled={!versionActionsEnabled}
      >
        <RotateCcw size={18} strokeWidth={2} aria-hidden />
        {tTake('rerecordAsNewVersion')}
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
