'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function RecordingSessionHeaderCluster({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-2">{children}</div>;
}

export function RecordingSessionHeaderRow({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full items-center justify-between gap-2 overflow-x-auto overflow-y-hidden',
        '[scrollbar-width:thin]',
      )}
    >
      {children}
    </div>
  );
}

export function RecordingSessionHeaderShell({ children }: { children: ReactNode }) {
  return (
    <header
      className={cn(
        'relative flex h-12 min-h-12 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-border/40 bg-gradient-to-r from-slate-100/95 via-background to-slate-50/90 px-3 shadow-sm ring-1 ring-border/20',
        'dark:from-slate-950 dark:via-background dark:to-slate-900/95',
      )}
    >
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[40%] bg-gradient-to-l from-[hsl(var(--primary)/0.05)] to-transparent dark:from-[hsl(var(--primary)/0.085)]"
        aria-hidden
      />
      <div className="relative z-[1] flex h-full min-h-0 w-full items-center">{children}</div>
    </header>
  );
}
