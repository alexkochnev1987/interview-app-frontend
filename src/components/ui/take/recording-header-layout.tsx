'use client';

import { Children, type ReactNode } from 'react';

import { Clock, Layers, Loader2 } from 'lucide-react';

import { Inline, Stack } from '@/components/ui/layout';
import { BodyText, Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export function RecordingHeaderTitleCluster({ children }: { children: ReactNode }) {
  return (
    <Inline gap={2} align="start" width="full" className="min-h-0 min-w-0 lg:items-center">
      {children}
    </Inline>
  );
}

export function RecordingHeaderCluster({ children }: { children: ReactNode }) {
  return (
    <Inline gap={2} align="center" wrap="nowrap" className="min-w-0">
      {children}
    </Inline>
  );
}

export function RecordingHeaderRow({ children }: { children: ReactNode }) {
  const [left, center, right] = Children.toArray(children);

  return (
    <Stack
      gap={3}
      width="full"
      className={cn('min-h-0 [scrollbar-width:thin]', 'lg:flex-row lg:items-center')}
    >
      <Stack width="full" grow="fill" className="min-h-0 min-w-0 lg:min-h-0">
        {left}
      </Stack>

      <Stack
        gap={2}
        width="full"
        className={cn(
          'min-w-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 lg:contents',
        )}
      >
        <Inline
          align="center"
          wrap="nowrap"
          className="min-w-0 shrink-0 lg:min-h-0 lg:min-w-0 lg:flex-1 lg:justify-center"
        >
          {center}
        </Inline>
        <Inline
          align="center"
          wrap="wrap"
          gap={2}
          width="full"
          className="min-w-0 lg:min-h-0 lg:min-w-0 lg:flex-1 lg:justify-end"
        >
          {right}
        </Inline>
      </Stack>
    </Stack>
  );
}

export function RecordingHeaderShell({ children }: { children: ReactNode }) {
  return (
    <Stack
      as="header"
      justify="center"
      width="full"
      className={cn(
        'relative min-h-12 shrink-0 overflow-hidden rounded-xl bg-white px-4 py-2',
        'dark:bg-background',
      )}
    >
      <div className="relative z-[1] w-full min-w-0">{children}</div>
    </Stack>
  );
}

interface RecordingHeaderInlineMetricsProps {
  recordingLimitLabel: string;
  answerVersionNumber: number;
  previousVersionsKept: number;
  versionActivity?: 'idle' | 'saving';
}

export function RecordingHeaderInlineMetrics({
  recordingLimitLabel,
  answerVersionNumber,
  previousVersionsKept,
  versionActivity = 'idle',
}: RecordingHeaderInlineMetricsProps) {
  return (
    <Inline
      gap={3}
      wrap="nowrap"
      align="center"
      className="max-w-full shrink-0 text-muted-foreground"
    >
      <Inline gap={1} wrap="nowrap" align="center" className="min-w-0 shrink-0 whitespace-nowrap">
        <Clock className="size-3 shrink-0 opacity-80" aria-hidden />
        <Text as="span" variant="headerMetricEyebrow">
          Limit
        </Text>
        <BodyText as="span" size="xs" weight="semibold" tone="foreground">
          {recordingLimitLabel}
        </BodyText>
      </Inline>

      <Inline gap={2} wrap="nowrap" align="center" className="min-w-0 shrink-0 whitespace-nowrap">
        <Layers className="size-3 shrink-0 opacity-80" aria-hidden />
        <BodyText
          as="span"
          size="xs"
          weight="semibold"
          tone="foreground"
          className="tabular-nums"
        >
          v{answerVersionNumber}
        </BodyText>
        <Text as="span" variant="headerMetricMeta">
          · {previousVersionsKept} kept
        </Text>
        {versionActivity === 'saving' ? (
          <Inline gap={1} wrap="nowrap" align="center">
            <Loader2 className="size-3 shrink-0 animate-spin opacity-80" aria-hidden />
            <Text as="span" variant="headerMetricMetaMedium">
              Saving…
            </Text>
          </Inline>
        ) : null}
      </Inline>
    </Inline>
  );
}
