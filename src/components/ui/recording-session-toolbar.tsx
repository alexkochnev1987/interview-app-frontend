'use client';

import { Clock, Layers, Loader2, Video } from 'lucide-react';

import { cn } from '@/lib/utils';

export function SessionLiveIndicator() {
  return (
    <span
      className={cn(
        'inline-flex h-7 max-h-full shrink-0 items-center gap-1.5 rounded-full border border-border/50 bg-background/75 px-2 py-0 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.12em] text-muted-foreground shadow-sm backdrop-blur-sm',
      )}
    >
      <Video className="size-3 shrink-0 opacity-75" aria-hidden />
      <span className="truncate">Live</span>
    </span>
  );
}

export function RecordingSessionInterviewRole({ roleTitle }: { roleTitle: string }) {
  return (
    <span className="flex min-w-0 items-baseline gap-1.5">
      <span className="shrink-0 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Role
      </span>
      <span className="truncate text-sm font-semibold leading-tight tracking-tight text-foreground sm:text-[0.9375rem]">
        {roleTitle}
      </span>
    </span>
  );
}

interface RecordingSessionInlineMetricsProps {
  recordingLimitLabel: string;
  answerVersionNumber: number;
  previousVersionsKept: number;
  versionActivity?: 'idle' | 'saving';
}

export function RecordingSessionInlineMetrics({
  recordingLimitLabel,
  answerVersionNumber,
  previousVersionsKept,
  versionActivity = 'idle',
}: RecordingSessionInlineMetricsProps) {
  return (
    <span className="inline-flex max-w-full shrink-0 flex-nowrap items-center gap-x-3 text-muted-foreground">
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <Clock className="size-3 shrink-0 opacity-80" aria-hidden />
        <span className="text-[0.58rem] font-semibold uppercase tracking-[0.14em]">Limit</span>
        <span className="text-xs font-semibold text-foreground">{recordingLimitLabel}</span>
      </span>

      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <Layers className="size-3 shrink-0 opacity-80" aria-hidden />
        <span className="tabular-nums text-xs font-semibold text-foreground">v{answerVersionNumber}</span>
        <span className="text-[0.62rem] text-muted-foreground">· {previousVersionsKept} kept</span>
        {versionActivity === 'saving' ? (
          <span className="inline-flex items-center gap-1 text-[0.62rem] font-medium text-muted-foreground">
            <Loader2 className="size-3 shrink-0 animate-spin opacity-80" aria-hidden />
            <span>Saving…</span>
          </span>
        ) : null}
      </span>
    </span>
  );
}
