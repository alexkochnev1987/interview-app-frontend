'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type VideoHTMLAttributes,
} from 'react'

import { cn } from '@/lib/utils'

interface VideoFrameProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export function VideoFrame({ className, children, ...props }: VideoFrameProps) {
  return (
    <div
      className={cn(
        'relative my-4 overflow-hidden rounded-3xl bg-black ring-1 ring-hairline',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const VideoSurface = forwardRef<
  HTMLVideoElement,
  VideoHTMLAttributes<HTMLVideoElement>
>(function VideoSurface({ className, ...props }, ref) {
  return (
    <video
      ref={ref}
      className={cn('block max-h-[400px] w-full', className)}
      {...props}
    />
  )
})
