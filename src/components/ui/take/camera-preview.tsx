'use client';

import type { RefObject } from 'react';

import { cn } from '@/lib/utils';

export const cameraPreviewSurfaceClass = 'bg-[hsl(var(--surface-low))]';

export interface CameraPreviewVideoRefProps {
  videoRef: RefObject<HTMLVideoElement | null>;
}

export function CameraPreviewVideo({
  videoRef,
  objectFit,
}: CameraPreviewVideoRefProps & { objectFit: 'cover' | 'contain' }) {
  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={cn(
        'absolute inset-0 z-0 block h-full w-full',
        cameraPreviewSurfaceClass,
        objectFit === 'cover' ? 'object-cover' : 'object-contain',
      )}
    />
  );
}
