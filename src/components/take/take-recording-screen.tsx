import { CircleDot, Video } from 'lucide-react';
import type { RefObject } from 'react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { MetricPanel } from '@/components/app/metric-panel';
import { StatusPill } from '@/components/app/status-pill';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { InterviewDataView, TakeStage } from '@/components/take/types';

interface TakeRecordingScreenProps {
  interview: InterviewDataView;
  stage: TakeStage;
  progressValue: number;
  screenSurface: string;
  setupError: string;
  currentVersionNumber: number;
  retakeCount: number;
  timeLeft: number;
  transitionLabel: string;
  uploading: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  formatTime: (seconds: number) => string;
  onRerecord: () => void;
  onSubmit: () => void;
}

export function TakeRecordingScreen({
  interview,
  stage,
  progressValue,
  screenSurface,
  setupError,
  currentVersionNumber,
  retakeCount,
  timeLeft,
  transitionLabel,
  uploading,
  videoRef,
  formatTime,
  onRerecord,
  onSubmit,
}: TakeRecordingScreenProps) {
  return (
    <main className="container space-y-8 py-10 md:py-12">
      <section className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.84fr_1.16fr]">
        <Card className="border-white/65 bg-white/88 shadow-soft">
          <CardContent className="space-y-6 px-8 py-8">
            <div className="space-y-3">
              <EyebrowBadge icon={<Video className="size-3.5" />}>Live session</EyebrowBadge>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-4xl">
                {interview.position}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Answer clearly and keep your camera plus entire-screen share active while recording.
              </p>
            </div>

            <div className="space-y-3 rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.9)] p-5 ring-1 ring-border/45">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-foreground">
                  Question {interview.currentQuestionIndex + 1} of {interview.totalQuestions}
                </div>
                <StatusPill tone="neutral">{progressValue}%</StatusPill>
              </div>
              <Progress value={progressValue} className="h-2.5 rounded-full bg-white" />
            </div>

            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                <StatusPill tone="completed">Camera + mic active</StatusPill>
                <StatusPill tone="completed">
                  {screenSurface === 'monitor' ? 'Entire screen shared' : 'Screen share pending'}
                </StatusPill>
              </div>
              {setupError ? (
                <Alert variant="destructive" className="border-rose-200/70 bg-rose-50/85">
                  <AlertTitle>Capture interrupted</AlertTitle>
                  <AlertDescription>{setupError}</AlertDescription>
                </Alert>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <MetricPanel tone="elevated" label="Recording limit" value="4:00" />
              <MetricPanel
                tone="elevated"
                label="Answer version"
                value={`v${currentVersionNumber}`}
                valueClassName="mt-3 text-sm leading-6 text-foreground"
                description={`Previous versions kept: ${retakeCount}`}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/65 bg-white/88 shadow-float">
          <CardContent className="space-y-6 px-8 py-8">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill
                  tone={
                    stage === 'recording'
                      ? 'processing'
                      : stage === 'transition'
                        ? 'neutral'
                        : 'neutral'
                  }
                >
                  {stage === 'recording'
                    ? 'Recording'
                    : stage === 'transition'
                      ? 'Saving version'
                      : 'Awaiting response'}
                </StatusPill>
                {stage === 'recording' ? (
                  <StatusPill tone="failed">
                    <CircleDot className="size-3" />
                    {formatTime(timeLeft)}
                  </StatusPill>
                ) : null}
              </div>

              <h2 className="text-2xl font-semibold leading-9 tracking-[-0.03em] text-foreground">
                {interview.currentQuestion?.text}
              </h2>
            </div>

            <div className="video-container ring-1 ring-border/45">
              <video ref={videoRef} autoPlay muted playsInline className="video-preview" />

              {stage === 'recording' ? (
                <div className="timer">
                  <span className="rec-dot">●</span> {formatTime(timeLeft)}
                </div>
              ) : null}
            </div>

            <div className="rounded-[1.25rem] bg-[hsl(var(--surface-low)/0.85)] p-4 ring-1 ring-border/45">
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Guidance
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {stage === 'transition'
                  ? transitionLabel || 'Saving the current answer version.'
                  : 'Recording starts automatically for each question. Use Submit when the answer is ready, or Re-record to create a new version for the same question.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {stage === 'interview' ? (
                <StatusPill tone="neutral">Preparing recording...</StatusPill>
              ) : null}

              {stage === 'recording' ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onRerecord}
                    disabled={uploading}
                    className="rounded-full bg-white/80"
                  >
                    Re-record as new version
                  </Button>
                  <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={uploading}
                    className="rounded-full bg-primary-gradient px-5 shadow-soft hover:brightness-105"
                  >
                    Submit & Next
                  </Button>
                </>
              ) : null}

              {stage === 'transition' ? (
                <StatusPill tone="processing">
                  {transitionLabel || 'Saving current version'}
                </StatusPill>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
