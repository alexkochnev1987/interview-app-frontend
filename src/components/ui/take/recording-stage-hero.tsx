'use client'

import { Sparkles, UserRound } from 'lucide-react'
import type { ReactNode, RefObject } from 'react'

import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Panel } from '@/components/ui/panel'
import { BodyText, Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import { CameraPreviewVideo, type CameraPreviewVideoRefProps } from './camera-preview'
import { MicActivityBadge } from './mic-activity-badge'

type RecordingAiPresence = 'speaking' | 'listening'

function RecordingHiddenCaptureVideo({ videoRef }: CameraPreviewVideoRefProps) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-0 h-px w-px overflow-hidden opacity-0"
      aria-hidden
    >
      <video ref={videoRef} autoPlay muted playsInline className="block h-px w-px" />
    </div>
  )
}

const RECORDING_TOOLBAR_PILL_ROW = 'inline-flex h-7 shrink-0 items-center lg:h-8'

function AiInterviewerLabelBadge() {
  return (
    <Inline
      align="center"
      gap={1}
      wrap="nowrap"
      className={cn(
        RECORDING_TOOLBAR_PILL_ROW,
        'rounded-full border border-primary-container/20 bg-primary-container/30',
        'px-2.5 py-0 text-primary',
        'shadow-soft ring-1 ring-primary-container/10',
      )}
    >
      <Sparkles className="size-2.5 shrink-0 text-primary-container" strokeWidth={2} aria-hidden />
      <Text as="span" variant="toolbarEyebrow">
        AI interviewer
      </Text>
    </Inline>
  )
}

function AiInterviewerOrbRing({
  sizePercent,
  animationDelayS,
  presence,
}: {
  sizePercent: number
  animationDelayS: number
  presence: RecordingAiPresence
}) {
  const isAnimating = presence === 'speaking' || presence === 'listening'

  return (
    <span
      className="pointer-events-none absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2"
      style={{ width: `${sizePercent}%`, height: `${sizePercent}%` }}
      aria-hidden
    >
      <span
        className={cn(
          'block size-full rounded-full border-solid border-primary-container/40 border-2 shadow-none origin-center',
          isAnimating
            ? 'will-change-transform animate-ai-orb-ring-speaking'
            : 'opacity-50 scale-100',
        )}
        style={isAnimating ? { animationDelay: `${animationDelayS}s` } : undefined}
      />
    </span>
  )
}

function AiInterviewerAvatarPlaceholder({ presence }: { presence: RecordingAiPresence }) {
  return (
    <Inline
      justify="center"
      align="center"
      className="pointer-events-none relative mx-auto aspect-square shrink-0"
      style={{
        width: 'clamp(9.5rem, 48vw, 16rem)',
        maxWidth: '90vw',
      }}
      aria-hidden
    >
      <AiInterviewerOrbRing presence={presence} sizePercent={120} animationDelayS={0} />
      <AiInterviewerOrbRing presence={presence} sizePercent={100} animationDelayS={0.45} />

      <Inline
        align="center"
        justify="center"
        wrap="nowrap"
        className="relative z-10 aspect-square max-w-[88%] rounded-full ring-2 ring-primary-container/30"
        style={{
          width: 'clamp(5rem, 24vmin, 11.5rem)',
          height: 'clamp(5rem, 24vmin, 11.5rem)',
          boxShadow: 'inset 0 0 0 2px var(--color-primary-container)',
        }}
      >
        <UserRound
          className="text-primary"
          style={{ width: '45%', height: '45%' }}
          strokeWidth={1.65}
          aria-hidden
        />
      </Inline>
    </Inline>
  )
}

interface RecordingAiInterviewerSessionLayoutProps {
  cameraVideoRef: RefObject<HTMLVideoElement | null>
  screenVideoRef: RefObject<HTMLVideoElement | null>
  timerOverlay?: ReactNode
  interviewerPresence: RecordingAiPresence
  cameraStream?: MediaStream | null
}

function RecordingAiInterviewerSessionLayout({
  cameraVideoRef,
  screenVideoRef,
  timerOverlay,
  interviewerPresence,
  cameraStream = null,
}: RecordingAiInterviewerSessionLayoutProps) {
  return (
    <Stack
      gap={0}
      width="full"
      height="full"
      grow="fill"
      align="stretch"
      className={cn('relative overflow-hidden bg-card', 'min-h-0 lg:min-h-[min(360px,48vh)]')}
    >
      <RecordingHiddenCaptureVideo videoRef={screenVideoRef} />

      <Inline justify="center" align="center" className="pointer-events-none absolute inset-0 z-1">
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

      <MicActivityBadge stream={cameraStream} muted={false} placement="hero-bottom-left" />

      <Panel
        as="section"
        padding="none"
        radius="md"
        className={cn(
          'pointer-events-none absolute z-5 overflow-hidden rounded-2xl border border-background/95 bg-slate-950 shadow-none ring-[1px] ring-border/55',
          'bottom-3 right-3 h-26 w-39',
          'sm:bottom-4 sm:right-4 sm:h-29.5 sm:w-44',
          'lg:h-34 lg:w-52',
          'xl:h-35.5 xl:w-56',
        )}
        aria-label="Your camera"
      >
        <CameraPreviewVideo videoRef={cameraVideoRef} objectFit="cover" />
      </Panel>
    </Stack>
  )
}

interface RecordingTimerBadgeProps {
  timeLabel: string
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
        className="leading-none text-destructive animate-pulse"
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
  )
}

interface RecordingStageHeroProps {
  showTimer: boolean
  timeLeft: number
  formatTime: (seconds: number) => string
  cameraVideoRef: RefObject<HTMLVideoElement | null>
  screenVideoRef: RefObject<HTMLVideoElement | null>
  interviewerPresence: RecordingAiPresence
  cameraStream?: MediaStream | null
}

export function RecordingStageHero({
  showTimer,
  timeLeft,
  formatTime,
  cameraVideoRef,
  screenVideoRef,
  interviewerPresence,
  cameraStream = null,
}: RecordingStageHeroProps) {
  const timerOverlay = showTimer ? <RecordingTimerBadge timeLabel={formatTime(timeLeft)} /> : null

  return (
    <div
      className={cn('relative isolate w-full min-h-0 min-w-0 flex-1 overflow-hidden shadow-none')}
    >
      <RecordingAiInterviewerSessionLayout
        cameraVideoRef={cameraVideoRef}
        screenVideoRef={screenVideoRef}
        interviewerPresence={interviewerPresence}
        timerOverlay={timerOverlay}
        cameraStream={cameraStream}
      />
    </div>
  )
}
