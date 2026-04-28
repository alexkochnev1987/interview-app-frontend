import type { RefObject } from 'react';

import { SurfaceCard } from '@/components/app/surface-card';
import { TakeRecordingActions } from '@/components/take/recording/take-recording-actions';
import { TakeRecordingGuidance } from '@/components/take/recording/take-recording-guidance';
import { TakeRecordingHeader } from '@/components/take/recording/take-recording-header';
import { TakeRecordingPreview } from '@/components/take/recording/take-recording-preview';
import { TakeRecordingStatus } from '@/components/take/recording/take-recording-status';
import { LiveTranscriptPanel } from '@/components/take/live-transcript-panel';
import { CardContent } from '@/components/ui/card';
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
  isBrowserTranscriptSupported: boolean;
  finalTranscript: string;
  interimTranscript: string;
  browserTranscriptWarning?: string;
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
  isBrowserTranscriptSupported,
  finalTranscript,
  interimTranscript,
  browserTranscriptWarning,
  videoRef,
  formatTime,
  onRerecord,
  onSubmit,
}: TakeRecordingScreenProps) {
  return (
    <main className="container space-y-8 py-10 md:py-12">
      <section className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.84fr_1.16fr]">
        <SurfaceCard tone="glassSoft">
          <CardContent className="space-y-6 px-8 py-8">
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
          <CardContent className="space-y-6 px-8 py-8">
            <div className="space-y-3">
              <TakeRecordingStatus stage={stage} timeLeft={timeLeft} formatTime={formatTime} />

              <h2 className="text-2xl font-semibold leading-9 tracking-[-0.03em] text-foreground">
                {interview.currentQuestion?.text}
              </h2>
            </div>

            <TakeRecordingPreview
              isRecording={stage === 'recording'}
              timeLeft={timeLeft}
              formatTime={formatTime}
              videoRef={videoRef}
            />

            <LiveTranscriptPanel
              isSupported={isBrowserTranscriptSupported}
              finalTranscript={finalTranscript}
              interimTranscript={interimTranscript}
              warning={browserTranscriptWarning}
              stage={stage}
            />

            <TakeRecordingGuidance stage={stage} transitionLabel={transitionLabel} />
            <TakeRecordingActions
              stage={stage}
              uploading={uploading}
              transitionLabel={transitionLabel}
              onRerecord={onRerecord}
              onSubmit={onSubmit}
            />
          </CardContent>
        </SurfaceCard>
      </section>
    </main>
  );
}
