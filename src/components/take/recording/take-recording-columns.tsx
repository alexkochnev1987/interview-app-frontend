import type { RefObject } from 'react';

import { SurfaceCard } from '@/components/ui/surface-card';
import { CardContent } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Progress } from '@/components/ui/progress';
import { StatusPill } from '@/components/ui/status-pill';
import { Text } from '@/components/ui/text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Inline, Stack } from '@/components/ui/layout';
import { TakePanel } from '@/components/take/take-panel';
import { LiveTranscriptPanel } from '@/components/take/live-transcript-panel';
import { TakeRecordingActions } from '@/components/take/recording/take-recording-actions';
import { TakeRecordingGuidance } from '@/components/take/recording/take-recording-guidance';
import { TakeRecordingPreview } from '@/components/take/recording/take-recording-preview';
import type { InterviewDataView, TakeStage } from '@/components/take/types';
import type { InterviewerPresence } from '@/features/take/use-take-question-tts';
import { TAKE_MESSAGES, submitAnswerActionLabel } from '@/features/take';

interface TakeRecordingHeroColumnProps {
  stage: TakeStage;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  videoRef: RefObject<HTMLVideoElement | null>;
  screenVideoRef: RefObject<HTMLVideoElement | null>;
  micOn: boolean;
  interviewerPresence: InterviewerPresence;
}

export function TakeRecordingHeroColumn({
  stage,
  timeLeft,
  formatTime,
  videoRef,
  screenVideoRef,
  micOn,
  interviewerPresence,
}: TakeRecordingHeroColumnProps) {
  return (
    <SurfaceCard tone="glassFloat" height="full">
      <CardContent layout="fill-column" spacing="lg">
        <Stack grow="fill" width="full" align="stretch">
          <TakeRecordingPreview
            stage={stage}
            timeLeft={timeLeft}
            formatTime={formatTime}
            videoRef={videoRef}
            screenVideoRef={screenVideoRef}
            micOn={micOn}
            interviewerPresence={interviewerPresence}
          />
        </Stack>
      </CardContent>
    </SurfaceCard>
  );
}

interface TakeRecordingSidebarColumnProps {
  interview: InterviewDataView;
  stage: TakeStage;
  recording: boolean;
  progressValue: number;
  setupError: string;
  submitError: string;
  uploading: boolean;
  recordingStartBusy: boolean;
  isBrowserTranscriptSupported: boolean;
  finalTranscript: string;
  interimTranscript: string;
  browserTranscriptWarning?: string;
  onReconnect: () => void;
  onRerecord: () => void;
  onSubmit: () => void;
  interviewerPresence: InterviewerPresence;
}

export function TakeRecordingSidebarColumn({
  interview,
  stage,
  recording,
  progressValue,
  setupError,
  submitError,
  uploading,
  recordingStartBusy,
  isBrowserTranscriptSupported,
  finalTranscript,
  interimTranscript,
  browserTranscriptWarning,
  onReconnect,
  onRerecord,
  onSubmit,
  interviewerPresence,
}: TakeRecordingSidebarColumnProps) {
  const submitAnswerLabel = submitAnswerActionLabel(
    interview.currentQuestionIndex,
    interview.totalQuestions,
  );

  return (
    <SurfaceCard tone="glassSoft" height="full">
      <CardContent layout="fill-column" spacing="lg">
        <Stack grow="fill" justify="between" width="full" gap={5}>
          <Stack gap={5}>
            <Heading variant="questionTitle">{interview.currentQuestion?.text}</Heading>

            <TakePanel tone="surfaceStrong" radius="lg" padding="lg">
              <Stack gap={3}>
                <Inline align="center" justify="between" gap={3}>
                  <Text as="span" variant="labelSm">
                    Question {interview.currentQuestionIndex + 1} of {interview.totalQuestions}
                  </Text>
                  <StatusPill tone="neutral">{progressValue}%</StatusPill>
                </Inline>
                <Progress value={progressValue} density="thick" />
              </Stack>
            </TakePanel>

            <LiveTranscriptPanel
              isSupported={isBrowserTranscriptSupported}
              finalTranscript={finalTranscript}
              interimTranscript={interimTranscript}
              warning={browserTranscriptWarning}
              stage={stage}
            />

            <TakeRecordingGuidance
              stage={stage}
              recording={recording}
              recordingStartBusy={recordingStartBusy}
              interviewerPresence={interviewerPresence}
            />

            {submitError ? (
              <Alert variant="destructive">
                <AlertTitle>{TAKE_MESSAGES.submitFailedTitle}</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}
          </Stack>

          <TakeRecordingActions
            stage={stage}
            uploading={uploading}
            setupError={setupError}
            recording={recording}
            onReconnect={onReconnect}
            onRerecord={onRerecord}
            onSubmit={onSubmit}
            submitAnswerLabel={submitAnswerLabel}
          />
        </Stack>
      </CardContent>
    </SurfaceCard>
  );
}
