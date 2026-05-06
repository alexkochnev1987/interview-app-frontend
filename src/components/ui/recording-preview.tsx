'use client';

import type { ReactNode, RefObject } from 'react';
import { cn } from '@/lib/utils';

interface RecordingPreviewFrameProps {
  children: ReactNode;
}

export function RecordingPreviewFrame({ children }: RecordingPreviewFrameProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-high ring-1 ring-border/45">
      {children}
    </div>
  );
}

interface RecordingVideoProps {
  videoRef: RefObject<HTMLVideoElement | null>;
}

export function RecordingScreenVideo({ videoRef }: RecordingVideoProps) {
  return <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 block h-full w-full object-cover" />;
}

export function RecordingCameraVideo({ videoRef }: RecordingVideoProps) {
  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="absolute bottom-4 right-4 block aspect-video h-auto w-[min(24%,11rem)] rounded-xl border border-border/70 bg-surface-highest object-cover shadow-lg"
    />
  );
}

interface RecordingTimerBadgeProps {
  timeLabel: string;
}

export function RecordingTimerBadge({ timeLabel }: RecordingTimerBadgeProps) {
  return (
    <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-foreground/80 px-3 py-1 text-sm font-semibold text-background">
      <span aria-hidden className={cn('text-destructive', 'animate-[blink_1s_steps(1,end)_infinite]')}>
        ●
      </span>
      {timeLabel}
    </div>
  );
}
