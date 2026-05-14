import type { RefObject } from 'react';

import { PageMain } from '@/components/layout/page-shell';
import {
  TakeRecordingHeroColumn,
  TakeRecordingSidebarColumn,
} from '@/components/take/recording/take-recording-columns';
import { TakeRecordingSessionHeader } from '@/components/take/recording/take-recording-session-header';
import type { InterviewDataView, TakeStage } from '@/components/take/types';
import type { InterviewerPresence } from '@/features/take/use-take-question-tts';
import type { VersionPersistKind } from '@/features/take/session-machine';
import { Grid, Stack } from '@/components/ui/layout';

interface TakeRecordingScreenProps {
  interview: InterviewDataView;
  currentVersionNumber: number;
  stage: TakeStage;
  recording: boolean;
  progressValue: number;
  screenSurface: string;
  setupError: string;
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
  micOn: boolean;
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
  screenSurface,
  setupError,
  submitError,
  timeLeft,
  versionPersistKind,
  uploading,
  isBrowserTranscriptSupported,
  finalTranscript,
  interimTranscript,
  browserTranscriptWarning,
  videoRef,
  screenVideoRef,
  micOn,
  interviewerPresence,
  formatTime,
  recordingStartBusy,
  onReconnect,
  onRerecord,
  onSubmit,
}: TakeRecordingScreenProps) {
  return (
    <PageMain>
      <Stack gap={6} width="full">
        <TakeRecordingSessionHeader
          interview={interview}
          currentVersionNumber={currentVersionNumber}
          screenSurface={screenSurface}
          setupError={setupError}
          stage={stage}
          recording={recording}
          recordingStartBusy={recordingStartBusy}
          versionPersistKind={versionPersistKind}
        />

        <Grid as="section" columns="aside-22" gap={6}>
          <TakeRecordingHeroColumn
            stage={stage}
            timeLeft={timeLeft}
            formatTime={formatTime}
            videoRef={videoRef}
            screenVideoRef={screenVideoRef}
            micOn={micOn}
            interviewerPresence={interviewerPresence}
          />

          <TakeRecordingSidebarColumn
            interview={interview}
            stage={stage}
            recording={recording}
            progressValue={progressValue}
            submitError={submitError}
            uploading={uploading}
            recordingStartBusy={recordingStartBusy}
            isBrowserTranscriptSupported={isBrowserTranscriptSupported}
            finalTranscript={finalTranscript}
            interimTranscript={interimTranscript}
            browserTranscriptWarning={browserTranscriptWarning}
            setupError={setupError}
            onReconnect={onReconnect}
            onRerecord={onRerecord}
            onSubmit={onSubmit}
            interviewerPresence={interviewerPresence}
          />
        </Grid>
      </Stack>
    </PageMain>
  );
}
