'use client';

import type { ReactNode, RefObject } from 'react';
import { Mic, MicOff, Sparkles, UserRound } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { Panel } from '@/components/ui/panel';

import { BodyText } from '@/components/ui/text';
import { Inline, Stack } from '@/components/ui/layout';
import { cn } from '@/lib/utils';

const previewWellTone = 'bg-[hsl(var(--surface-low))]';

const recordingPreviewFrameLayout = cva('', {
  variants: {
    layout: {
      aspectVideo: 'aspect-video min-h-0 overflow-hidden',
      grow: 'min-h-0 min-w-0 flex-1 overflow-hidden shadow-none',
      growLobby:
        'h-full min-h-0 min-w-0 max-h-[min(56vh,42rem)] flex-1 overflow-hidden rounded-xl border border-hairline-strong bg-[hsl(var(--surface-low)/0.92)] shadow-none isolate',
    },
  },
  defaultVariants: {
    layout: 'aspectVideo',
  },
});

type RecordingPreviewFrameProps = {
  children: ReactNode;
} & VariantProps<typeof recordingPreviewFrameLayout>;

export function RecordingPrepRoomFloatingControls({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-5 sm:pb-6">
      <div className="pointer-events-auto flex w-full max-w-full justify-center">{children}</div>
    </div>
  );
}

export function RecordingPreviewFrame({ children, layout }: RecordingPreviewFrameProps) {
  const layoutCls = recordingPreviewFrameLayout({ layout });

  if (layout === 'growLobby') {
    return <div className={cn('relative w-full', layoutCls)}>{children}</div>;
  }

  return (
    <Panel
      tone="surface"
      radius="md"
      padding="none"
      className={cn('relative isolate w-full', layoutCls)}
    >
      {children}
    </Panel>
  );
}

interface RecordingVideoProps {
  videoRef: RefObject<HTMLVideoElement | null>;
}

export function RecordingScreenVideo({ videoRef }: RecordingVideoProps) {
  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={cn(
        'absolute inset-0 z-0 block h-full w-full object-cover',
        previewWellTone,
      )}
    />
  );
}

function RecordingPreviewFillVideo({
  videoRef,
  objectFit,
}: RecordingVideoProps & { objectFit: 'cover' | 'contain' }) {
  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={cn(
        'absolute inset-0 z-0 block h-full w-full',
        previewWellTone,
        objectFit === 'cover' ? 'object-cover' : 'object-contain',
      )}
    />
  );
}


function RecordingHiddenCaptureVideo({ videoRef }: RecordingVideoProps) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-0 h-px w-px overflow-hidden opacity-0"
      aria-hidden
    >
      <video ref={videoRef} autoPlay muted playsInline className="block h-px w-px" />
    </div>
  );
}

function AiInterviewerLabelBadge() {
  return (
    <Inline
      align="center"
      gap={2}
      wrap="nowrap"
      className={cn(
        'rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--primary-fixed)/0.88)]',
        'px-3.5 py-2 text-[0.6875rem] font-semibold uppercase leading-none tracking-eyebrow-wide text-[hsl(var(--primary))]',
        'shadow-soft ring-1 ring-[hsl(var(--primary)/0.12)]',
      )}
    >
      <Sparkles className="size-[15px] shrink-0" strokeWidth={2.35} aria-hidden />
      <span>AI interviewer</span>
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
  presence: 'speaking' | 'listening';
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
          'block size-full rounded-full border-[1.5px] border-solid border-[hsl(var(--primary)/0.15)] shadow-none origin-center',
          isSpeaking
            ? '[will-change:opacity,transform] animate-ai-orb-ring-speaking'
            : 'opacity-[0.22] [transform:scale(1)]',
        )}
        style={isSpeaking ? { animationDelay: `${animationDelayS}s` } : undefined}
      />
    </span>
  );
}

function AiInterviewerAvatarPlaceholder({
  presence,
}: {
  presence: 'speaking' | 'listening';
}) {
  return (
    <div
      className="pointer-events-none relative mx-auto flex aspect-square w-[min(16rem,min(72vw,260px))] max-w-[min(90vw,16rem)] shrink-0 items-center justify-center"
      aria-hidden
    >
      <AiInterviewerOrbRing presence={presence} sizeClassName="h-[128%] w-[128%]" animationDelayS={0} />
      <AiInterviewerOrbRing presence={presence} sizeClassName="h-[112%] w-[112%]" animationDelayS={0.5} />
      <AiInterviewerOrbRing presence={presence} sizeClassName="h-[98%] w-[98%]" animationDelayS={1} />

      <div
        className={cn(
          'relative z-10 flex aspect-square size-[clamp(8.75rem,min(40vmin,52%),11.5rem)] max-w-[88%]',
          'items-center justify-center rounded-full bg-[hsl(var(--surface-low))]',
          'shadow-[inset_0_0_0_2px_hsl(var(--primary)/0.24)]',
        )}
      >
        <UserRound
          className="size-[48%] text-[hsl(var(--primary))]"
          strokeWidth={1.65}
          aria-hidden
        />
      </div>
    </div>
  );
}

interface RecordingAiInterviewerSessionLayoutProps {
  cameraVideoRef: RefObject<HTMLVideoElement | null>;
  screenVideoRef: RefObject<HTMLVideoElement | null>;
  timerOverlay?: ReactNode;
  micOn: boolean;
  interviewerPresence: 'speaking' | 'listening';
}

export function RecordingAiInterviewerSessionLayout({
  cameraVideoRef,
  screenVideoRef,
  timerOverlay,
  micOn,
  interviewerPresence,
}: RecordingAiInterviewerSessionLayoutProps) {
  return (
    <Panel
      tone="surface"
      radius="md"
      padding="none"
      className="relative flex h-full min-h-[min(52vh,26rem)] w-full flex-1 overflow-hidden bg-gradient-to-br from-[hsl(var(--primary)/0.08)] via-[hsl(var(--surface-low))] to-[hsl(var(--primary)/0.06)] md:min-h-[min(360px,48vh)] xl:min-h-0"
    >
      <RecordingHiddenCaptureVideo videoRef={screenVideoRef} />

      <div className="pointer-events-none absolute inset-0 z-[1] grid place-items-center p-8 sm:p-12 md:p-14">
        <AiInterviewerAvatarPlaceholder presence={interviewerPresence} />
      </div>

      <Inline
        align="center"
        gap={3}
        wrap="wrap"
        className="pointer-events-none absolute left-5 top-5 z-10 md:left-6 md:top-6"
      >
        <AiInterviewerLabelBadge />
        {timerOverlay}
      </Inline>

      <Panel
        padding="none"
        radius="md"
        className="pointer-events-none absolute bottom-5 right-5 z-[5] h-[140px] w-[220px] overflow-hidden rounded-[1rem] border-2 border-background/95 bg-slate-950 shadow-float ring-[1px] ring-border/55 sm:h-[140px] sm:w-[220px]"
        role="region"
        aria-label="Your camera"
      >
        <RecordingPreviewFillVideo videoRef={cameraVideoRef} objectFit="cover" />
        <Inline
          align="center"
          justify="center"
          wrap="nowrap"
          gap={1}
          className={cn(
            'pointer-events-none absolute bottom-1.5 right-1.5 z-10 rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold shadow-sm ring-1 ring-black/25',
            micOn
              ? 'bg-[hsl(var(--primary-fixed)/0.95)] text-[hsl(var(--primary))]'
              : 'bg-destructive/90 text-destructive-foreground',
          )}
          aria-hidden
        >
          {micOn ? <Mic className="size-3 shrink-0" /> : <MicOff className="size-3 shrink-0" />}
        </Inline>
      </Panel>
    </Panel>
  );
}

interface RecordingTimerBadgeProps {
  timeLabel: string;
}

export function RecordingTimerBadge({ timeLabel }: RecordingTimerBadgeProps) {
  return (
    <Inline
      align="center"
      gap={2}
      wrap="nowrap"
      className="rounded-full bg-foreground/80 px-3 py-1 text-sm font-semibold text-background shadow-md ring-1 ring-black/15"
    >
      <span aria-hidden className={cn('text-destructive', 'animate-[blink_1s_steps(1,end)_infinite]')}>
        ●
      </span>
      {timeLabel}
    </Inline>
  );
}

interface RecordingPreviewPlaceholderProps {
  title: string;
  description?: string;
}

export function RecordingPreviewPlaceholder({
  title,
  description,
}: RecordingPreviewPlaceholderProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 z-10', previewWellTone)}>
      <Stack align="center" justify="center" gap={2} height="full" className="px-6 text-center">
        <BodyText as="span" size="sm-tight" tone="foreground" weight="semibold">
          {title}
        </BodyText>
        {description ? (
          <BodyText as="span" size="xs" tone="muted" width="sm">
            {description}
          </BodyText>
        ) : null}
      </Stack>
    </div>
  );
}
