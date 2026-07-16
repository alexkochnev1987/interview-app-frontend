'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type VideoHTMLAttributes,
} from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const videoFrameVariants = cva(
  'relative w-full overflow-hidden bg-black ring-1 ring-hairline',
  {
    variants: {
      aspect: {
        auto: '',
        recording: 'aspect-[16/10] max-h-[400px]',
      },
      density: {
        comfortable: 'my-4 rounded-3xl',
        compact: 'my-0 rounded-2xl',
      },
    },
    defaultVariants: {
      aspect: 'auto',
      density: 'comfortable',
    },
  },
)

export type VideoFrameVariants = VariantProps<typeof videoFrameVariants>

type VideoFrameProps = HTMLAttributes<HTMLDivElement> &
  VideoFrameVariants & {
    children?: ReactNode
  }

export function VideoFrame({
  className,
  aspect,
  density,
  children,
  ...props
}: VideoFrameProps) {
  return (
    <div
      className={cn(videoFrameVariants({ aspect, density }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

const videoSurfaceVariants = cva('block w-full', {
  variants: {
    fit: {
      natural: 'max-h-[400px]',
      fill: 'h-full object-contain',
    },
  },
  defaultVariants: {
    fit: 'natural',
  },
})

type VideoSurfaceProps = VideoHTMLAttributes<HTMLVideoElement> &
  VariantProps<typeof videoSurfaceVariants>

export const VideoSurface = forwardRef<HTMLVideoElement, VideoSurfaceProps>(
  function VideoSurface({ className, fit, ...props }, ref) {
    return (
      <video
        ref={ref}
        className={cn(videoSurfaceVariants({ fit }), className)}
        {...props}
      />
    )
  },
)
