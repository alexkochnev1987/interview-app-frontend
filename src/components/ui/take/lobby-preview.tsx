'use client';

import type { ReactNode } from 'react';
import { cva } from 'class-variance-authority';

import { BodyText } from '@/components/ui/text';
import {
  CameraPreviewVideo,
  cameraPreviewSurfaceClass,
  type CameraPreviewVideoRefProps,
} from './camera-preview';
import { Inline, Stack } from '@/components/ui/layout';
import { cn } from '@/lib/utils';

const lobbyPreviewFrameLayout = cva(
  'h-full min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl bg-[hsl(var(--surface-low)/0.92)] shadow-none ring-1 ring-border/45 isolate',
);

export function LobbyPrepFloatingControls({ children }: { children: ReactNode }) {
  return (
    <Inline
      justify="center"
      width="full"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-3 pb-5 sm:pb-6"
    >
      <Inline justify="center" width="full" className="pointer-events-auto max-w-full">
        {children}
      </Inline>
    </Inline>
  );
}

export function LobbyPreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className={cn('relative isolate w-full', lobbyPreviewFrameLayout())}>{children}</div>
  );
}

export function LobbyScreenVideo({ videoRef }: CameraPreviewVideoRefProps) {
  return <CameraPreviewVideo videoRef={videoRef} objectFit="cover" />;
}

export function LobbyPreviewPlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Stack
      gap={0}
      width="full"
      height="full"
      className={cn('pointer-events-none absolute inset-0 z-10 min-h-0', cameraPreviewSurfaceClass)}
    >
      <Stack
        align="center"
        justify="center"
        gap={2}
        grow="fill"
        width="full"
        className="min-h-0 px-6 pb-28 pt-6 text-center sm:pb-32 sm:pt-8"
      >
        <BodyText as="span" size="sm-tight" tone="foreground" weight="semibold">
          {title}
        </BodyText>
        {description ? (
          <BodyText as="span" size="xs" tone="muted" width="sm">
            {description}
          </BodyText>
        ) : null}
      </Stack>
    </Stack>
  );
}
