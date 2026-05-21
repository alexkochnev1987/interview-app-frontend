import type { RefObject } from 'react';

import { PageMainViewport } from '@/components/layout/page-shell';
import {
  TakeRecordingHeroColumn,
  TakeRecordingSidebarColumn,
} from './recording-columns';
import { TakeRecordingHeader } from './recording-header';
import type { InterviewDataView, TakeStage } from '@/components/take/types';
import type { InterviewerPresence } from '@/features/take/use-take-question-tts';
import type { VersionPersistKind } from '@/features/take/session-machine';
import { Grid, Stack } from '@/components/ui/layout';
import { submitAnswerActionLabel } from '@/features/take';

interface TakeRecordingScreenProps {
  interview: InterviewDataView;
  currentVersionNumber: number;
  stage: TakeStage;
  recording: boolean;
  progressValue: number;
  setupError: string;
  capturePipelineReady: boolean;
  submitError: string;
  timeLeft: number;
  versionPersistKind: VersionPersistKind | null;
  uploading: boolean;
  isBrowserTranscriptSupported: boolean;
  finalTranscript: string;
  interimTranscript: string;
  browserTranscriptWarning?: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  screenVideoRef: RefObject<HTMLVideoElement | null>;
  interviewerPresence: InterviewerPresence;
  formatTime: (seconds: number) => string;
  recordingStartBusy: boolean;
  onReconnect: () => void;
  onRerecord: () => void;
  onSubmit: () => void;
}

export function TakeRecordingScreen({
  interview,
  currentVersionNumber,
  stage,
  recording,
  progressValue,
  setupError,
  capturePipelineReady,
  submitError,
  timeLeft,
  uploading,
  isBrowserTranscriptSupported,
  finalTranscript,
  interimTranscript,
  browserTranscriptWarning,
  videoRef,
  screenVideoRef,
  interviewerPresence,
  formatTime,
  recordingStartBusy,
  onReconnect,
  onRerecord,
  onSubmit,
}: TakeRecordingScreenProps) {
  const submitAnswerLabel = submitAnswerActionLabel(
    interview.currentQuestionIndex,
    interview.totalQuestions,
  );

  return (
    <PageMainViewport>
      <Stack gap={4} width="full" grow="fill" height="full">
        <TakeRecordingHeader
          interview={interview}
          currentVersionNumber={currentVersionNumber}
          setupError={setupError}
          stage={stage}
        />

        <Grid as="section" columns="aside-24" gap={4} grow="fill" align="stretch">
          <TakeRecordingHeroColumn
            stage={stage}
            timeLeft={timeLeft}
            formatTime={formatTime}
            videoRef={videoRef}
            screenVideoRef={screenVideoRef}
            interviewerPresence={interviewerPresence}
          />

          <TakeRecordingSidebarColumn
            interview={interview}
            stage={stage}
            recording={recording}
            progressValue={progressValue}
            submitError={submitError}
            recordingStartBusy={recordingStartBusy}
            isBrowserTranscriptSupported={isBrowserTranscriptSupported}
            finalTranscript={finalTranscript}
            interimTranscript={interimTranscript}
            browserTranscriptWarning={browserTranscriptWarning}
            interviewerPresence={interviewerPresence}
            uploading={uploading}
            setupError={setupError}
            capturePipelineReady={capturePipelineReady}
            submitAnswerLabel={submitAnswerLabel}
            onReconnect={onReconnect}
            onRerecord={onRerecord}
            onSubmit={onSubmit}
          />
        </Grid>
      </Stack>
    </PageMainViewport>
  );
}
