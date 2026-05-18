import type { RefObject } from 'react';

import { SurfaceCard } from '@/components/ui/surface-card';
import { CardContent } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Progress } from '@/components/ui/progress';
import { StatusPill } from '@/components/ui/status-pill';
import { Text } from '@/components/ui/text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Inline, Stack } from '@/components/ui/layout';
import { Panel } from '@/components/ui/panel';
import { RecordingStageHero } from '@/components/ui/take';
import { LiveTranscriptPanel } from './recording-live-transcript-panel';
import { TakeRecordingActions } from './recording-actions';
import { TakeRecordingGuidance } from './recording-guidance';
import type { InterviewDataView, TakeStage } from '@/components/take/types';
import type { InterviewerPresence } from '@/features/take/use-take-question-tts';
import { TAKE_MESSAGES } from '@/features/take';

interface TakeRecordingHeroColumnProps {
  stage: TakeStage;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  videoRef: RefObject<HTMLVideoElement | null>;
  screenVideoRef: RefObject<HTMLVideoElement | null>;
  interviewerPresence: InterviewerPresence;
}

export function TakeRecordingHeroColumn({
  stage,
  timeLeft,
  formatTime,
  videoRef,
  screenVideoRef,
  interviewerPresence,
}: TakeRecordingHeroColumnProps) {
  return (
    <SurfaceCard
      tone="recordingHero"
      height="full"
      size="flush"
      grow="fill"
      flexChild="contain"
    >
      <CardContent inset="none" layout="fill-column" spacing="none">
        <RecordingStageHero
          showTimer={stage === 'recording' || stage === 'transition'}
          timeLeft={timeLeft}
          formatTime={formatTime}
          cameraVideoRef={videoRef}
          screenVideoRef={screenVideoRef}
          interviewerPresence={interviewerPresence}
        />
      </CardContent>
    </SurfaceCard>
  );
}

interface TakeRecordingSidebarColumnProps {
  interview: InterviewDataView;
  stage: TakeStage;
  recording: boolean;
  progressValue: number;
  submitError: string;
  recordingStartBusy: boolean;
  isBrowserTranscriptSupported: boolean;
  finalTranscript: string;
  interimTranscript: string;
  browserTranscriptWarning?: string;
  interviewerPresence: InterviewerPresence;
  uploading: boolean;
  setupError: string;
  capturePipelineReady: boolean;
  submitAnswerLabel: string;
  onReconnect: () => void;
  onRerecord: () => void;
  onSubmit: () => void;
}

export function TakeRecordingSidebarColumn({
  interview,
  stage,
  recording,
  progressValue,
  submitError,
  recordingStartBusy,
  isBrowserTranscriptSupported,
  finalTranscript,
  interimTranscript,
  browserTranscriptWarning,
  interviewerPresence,
  uploading,
  setupError,
  capturePipelineReady,
  submitAnswerLabel,
  onReconnect,
  onRerecord,
  onSubmit,
}: TakeRecordingSidebarColumnProps) {
  return (
    <SurfaceCard tone="glassSoft" height="full">
      <CardContent layout="fill-column" spacing="md">
        <Stack grow="fill" justify="start" width="full" gap={4}>
          <Stack gap={4}>
            <Heading variant="questionTitle">{interview.currentQuestion?.text}</Heading>

            <Panel tone="surfaceStrong" radius="lg" padding="md">
              <Stack gap={2}>
                <Inline align="center" justify="between" gap={3}>
                  <Text as="span" variant="labelSm">
                    Question {interview.currentQuestionIndex + 1} of {interview.totalQuestions}
                  </Text>
                  <StatusPill tone="neutral">{progressValue}%</StatusPill>
                </Inline>
                <Progress value={progressValue} density="thick" />
              </Stack>
            </Panel>

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

            <TakeRecordingActions
              stage={stage}
              uploading={uploading}
              setupError={setupError}
              capturePipelineReady={capturePipelineReady}
              recording={recording}
              recordingStartBusy={recordingStartBusy}
              interviewerPresence={interviewerPresence}
              onReconnect={onReconnect}
              onRerecord={onRerecord}
              onSubmit={onSubmit}
              submitAnswerLabel={submitAnswerLabel}
            />

            {submitError ? (
              <Alert variant="destructive">
                <AlertTitle>{TAKE_MESSAGES.submitFailedTitle}</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </SurfaceCard>
  );
}
