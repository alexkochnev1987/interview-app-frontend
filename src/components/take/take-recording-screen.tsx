import type { RefObject } from 'react';

import { SurfaceCard } from '@/components/ui/surface-card';
import { PageMain } from '@/components/layout/page-shell';
import { TakeRecordingActions } from '@/components/take/recording/take-recording-actions';
import { TakeRecordingGuidance } from '@/components/take/recording/take-recording-guidance';
import { TakeRecordingHeader } from '@/components/take/recording/take-recording-header';
import { TakeRecordingPreview } from '@/components/take/recording/take-recording-preview';
import { TakeRecordingStatus } from '@/components/take/recording/take-recording-status';
import { LiveTranscriptPanel } from '@/components/take/live-transcript-panel';
import type { InterviewDataView, TakeStage } from '@/components/take/types';
import { CardContent } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Container, Grid, Stack } from '@/components/ui/layout';
import { TAKE_MESSAGES } from '@/features/take';

interface TakeRecordingScreenProps {
  interview: InterviewDataView;
  stage: TakeStage;
  progressValue: number;
  screenSurface: string;
  setupError: string;
  submitError: string;
  currentVersionNumber: number;
  retakeCount: number;
  timeLeft: number;
  transitionLabel: string;
  uploading: boolean;
  isBrowserTranscriptSupported: boolean;
  finalTranscript: string;
  interimTranscript: string;
  browserTranscriptWarning?: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  screenVideoRef: RefObject<HTMLVideoElement | null>;
  formatTime: (seconds: number) => string;
  onReconnect: () => void;
  onRerecord: () => void;
  onSubmit: () => void;
}

export function TakeRecordingScreen({
  interview,
  stage,
  progressValue,
  screenSurface,
  setupError,
  submitError,
  currentVersionNumber,
  retakeCount,
  timeLeft,
  transitionLabel,
  uploading,
  isBrowserTranscriptSupported,
  finalTranscript,
  interimTranscript,
  browserTranscriptWarning,
  videoRef,
  screenVideoRef,
  formatTime,
  onReconnect,
  onRerecord,
  onSubmit,
}: TakeRecordingScreenProps) {
  return (
    <PageMain>
      <Container width="wide" align="center">
        <Grid as="section" columns="split-12-8" gap={6}>
          <SurfaceCard tone="glassSoft">
            <CardContent layout="fill-column" spacing="lg">
              <TakeRecordingHeader
                interview={interview}
                progressValue={progressValue}
                screenSurface={screenSurface}
                setupError={setupError}
                currentVersionNumber={currentVersionNumber}
                retakeCount={retakeCount}
              />
            </CardContent>
          </SurfaceCard>

          <SurfaceCard tone="glassFloat">
            <CardContent layout="fill-column" spacing="lg">
              <Stack gap={3}>
                <TakeRecordingStatus stage={stage} timeLeft={timeLeft} formatTime={formatTime} />

                <Heading variant="questionTitle">{interview.currentQuestion?.text}</Heading>
              </Stack>

              <TakeRecordingPreview
                isRecording={stage === 'recording'}
                timeLeft={timeLeft}
                formatTime={formatTime}
                videoRef={videoRef}
                screenVideoRef={screenVideoRef}
              />

              <LiveTranscriptPanel
                isSupported={isBrowserTranscriptSupported}
                finalTranscript={finalTranscript}
                interimTranscript={interimTranscript}
                warning={browserTranscriptWarning}
                stage={stage}
              />

              <TakeRecordingGuidance stage={stage} transitionLabel={transitionLabel} />
              {submitError ? (
                <Alert variant="destructive">
                  <AlertTitle>{TAKE_MESSAGES.submitFailedTitle}</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              ) : null}
              <TakeRecordingActions
                stage={stage}
                uploading={uploading}
                transitionLabel={transitionLabel}
                setupError={setupError}
                onReconnect={onReconnect}
                onRerecord={onRerecord}
                onSubmit={onSubmit}
              />
            </CardContent>
          </SurfaceCard>
        </Grid>
      </Container>
    </PageMain>
  );
}
