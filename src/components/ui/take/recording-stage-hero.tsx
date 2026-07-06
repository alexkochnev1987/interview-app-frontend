'use client';

import type { ReactNode, RefObject } from 'react';
import { Sparkles, UserRound } from 'lucide-react';

import { Panel } from '@/components/ui/panel';
import { CameraPreviewVideo, type CameraPreviewVideoRefProps } from './camera-preview';
import { BodyText, Text } from '@/components/ui/text';
import { Inline, Stack } from '@/components/ui/layout';
import { cn } from '@/lib/utils';

type RecordingAiPresence = 'speaking' | 'listening';

function RecordingHiddenCaptureVideo({ videoRef }: CameraPreviewVideoRefProps) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-0 h-px w-px overflow-hidden opacity-0"
      aria-hidden
    >
      <video ref={videoRef} autoPlay muted playsInline className="block h-px w-px" />
    </div>
  );
}

const RECORDING_TOOLBAR_PILL_ROW =
  'inline-flex h-7 shrink-0 items-center lg:h-8';

function AiInterviewerLabelBadge() {
  return (
    <Inline
      align="center"
      gap={1}
      wrap="nowrap"
      className={cn(
        RECORDING_TOOLBAR_PILL_ROW,
        'rounded-full border border-[hsl(var(--primary-container)/0.18)] bg-[hsl(var(--primary-container)/0.1)]',
        'px-2.5 py-0 text-[hsl(var(--primary-container))]',
        'shadow-soft ring-1 ring-[hsl(var(--primary-container)/0.06)]',
      )}
    >
      <Sparkles
        className="size-2.5 shrink-0 text-[hsl(var(--primary-container))]"
        strokeWidth={2}
        aria-hidden
      />
      <Text as="span" variant="toolbarEyebrow">
        AI interviewer
      </Text>
    </Inline>
  );
}

function AiInterviewerOrbRing({
  sizeClassName,
  animationDelayS,
  presence,
}: {
  sizeClassName: string;
  animationDelayS: number;
  presence: RecordingAiPresence;
}) {
  const isSpeaking = presence === 'speaking';

  return (
    <span
      className={cn(
        'pointer-events-none absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2',
        sizeClassName,
      )}
      aria-hidden
    >
      <span
        className={cn(
          'block size-full rounded-full border-solid border-[hsl(var(--primary-container)/0.42)] shadow-none origin-center',
          'border-[1.5px] lg:border-[2px]',
          isSpeaking
            ? '[will-change:opacity,transform] animate-ai-orb-ring-speaking'
            : 'opacity-[0.48] [transform:scale(1)]',
        )}
        style={isSpeaking ? { animationDelay: `${animationDelayS}s` } : undefined}
      />
    </span>
  );
}

function AiInterviewerAvatarPlaceholder({ presence }: { presence: RecordingAiPresence }) {
  return (
    <Inline
      justify="center"
      align="center"
      className={cn(
        'pointer-events-none relative mx-auto aspect-square shrink-0',
        'w-[min(9.5rem,min(48vw,168px))] max-w-[min(82vw,9.5rem)]',
        'lg:w-[min(16rem,min(72vw,260px))] lg:max-w-[min(90vw,16rem)]',
      )}
      aria-hidden
    >
      <AiInterviewerOrbRing
        presence={presence}
        sizeClassName="max-lg:h-[108%] max-lg:w-[108%] lg:h-[126%] lg:w-[126%]"
        animationDelayS={0}
      />
      <AiInterviewerOrbRing
        presence={presence}
        sizeClassName="max-lg:h-[92%] max-lg:w-[92%] lg:h-[104%] lg:w-[104%]"
        animationDelayS={0.45}
      />

      <Inline
        align="center"
        justify="center"
        wrap="nowrap"
        className={cn(
          'relative z-10 aspect-square max-w-[88%]',
          'size-[clamp(5rem,min(24vmin,34%),7rem)] lg:size-[clamp(8.75rem,min(40vmin,52%),11.5rem)]',
          'rounded-full',
          'shadow-[inset_0_0_0_2px_hsl(var(--primary-container)/0.32)]',
        )}
      >
        <UserRound
          className="size-[40%] lg:size-[48%] text-[hsl(var(--primary))]"
          strokeWidth={1.65}
          aria-hidden
        />
      </Inline>
    </Inline>
  );
}

interface RecordingAiInterviewerSessionLayoutProps {
  cameraVideoRef: RefObject<HTMLVideoElement | null>;
  screenVideoRef: RefObject<HTMLVideoElement | null>;
  timerOverlay?: ReactNode;
  interviewerPresence: RecordingAiPresence;
}

function RecordingAiInterviewerSessionLayout({
  cameraVideoRef,
  screenVideoRef,
  timerOverlay,
  interviewerPresence,
}: RecordingAiInterviewerSessionLayoutProps) {
  return (
    <Stack
      gap={0}
      width="full"
      height="full"
      grow="fill"
      align="stretch"
      className={cn(
        'relative overflow-hidden bg-white',
        'min-h-0 lg:min-h-[min(360px,48vh)]',
      )}
    >
      <RecordingHiddenCaptureVideo videoRef={screenVideoRef} />

      <Inline justify="center" align="center" className="pointer-events-none absolute inset-0 z-[1]">
        <AiInterviewerAvatarPlaceholder presence={interviewerPresence} />
      </Inline>

      <Inline
        align="center"
        gap={3}
        wrap="wrap"
        className="pointer-events-none absolute left-5 top-5 z-10 md:left-4 md:top-4"
      >
        <AiInterviewerLabelBadge />
        {timerOverlay}
      </Inline>

      <Panel
        padding="none"
        radius="md"
        className={cn(
          'pointer-events-none absolute z-[5] overflow-hidden rounded-[1rem] border border-background/95 bg-slate-950 shadow-none ring-[1px] ring-border/55',
          'bottom-3 right-3 h-[104px] w-[156px]',
          'sm:bottom-4 sm:right-4 sm:h-[118px] sm:w-[176px]',
          'lg:h-[136px] lg:w-[208px]',
          'xl:h-[142px] xl:w-[224px]',
        )}
        role="region"
        aria-label="Your camera"
      >
        <CameraPreviewVideo videoRef={cameraVideoRef} objectFit="cover" />
      </Panel>
    </Stack>
  );
}

interface RecordingTimerBadgeProps {
  timeLabel: string;
}

function RecordingTimerBadge({ timeLabel }: RecordingTimerBadgeProps) {
  return (
    <Inline
      align="center"
      gap={2}
      wrap="nowrap"
      className={cn(
        RECORDING_TOOLBAR_PILL_ROW,
        'rounded-full bg-foreground/80 px-3.5 py-0 font-semibold text-background shadow-md ring-1 ring-black/15 sm:px-4',
      )}
    >
      <BodyText
        as="span"
        aria-hidden
        size="xs"
        weight="semibold"
        className={cn('leading-none text-destructive', 'animate-[blink_1s_steps(1,end)_infinite]')}
      >
        ●
      </BodyText>
      <BodyText
        as="span"
        tone="inherit"
        size="xs"
        weight="semibold"
        className="tabular-nums leading-none tracking-tight"
      >
        {timeLabel}
      </BodyText>
    </Inline>
  );
}

interface RecordingStageHeroProps {
  showTimer: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  cameraVideoRef: RefObject<HTMLVideoElement | null>;
  screenVideoRef: RefObject<HTMLVideoElement | null>;
  interviewerPresence: RecordingAiPresence;
}

export function RecordingStageHero({
  showTimer,
  timeLeft,
  formatTime,
  cameraVideoRef,
  screenVideoRef,
  interviewerPresence,
}: RecordingStageHeroProps) {
  const timerOverlay = showTimer ? (
    <RecordingTimerBadge timeLabel={formatTime(timeLeft)} />
  ) : null;

  return (
    <div
      className={cn(
        'relative isolate w-full min-h-0 min-w-0 flex-1 overflow-hidden shadow-none',
      )}
    >
      <RecordingAiInterviewerSessionLayout
        cameraVideoRef={cameraVideoRef}
        screenVideoRef={screenVideoRef}
        interviewerPresence={interviewerPresence}
        timerOverlay={timerOverlay}
      />
    </div>
  );
}
