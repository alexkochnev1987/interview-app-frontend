import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface RecordingBadgeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function RecordingBadge({
  className,
  children,
  ...props
}: RecordingBadgeProps) {
  return (
    <div
      className={cn(
        'absolute right-3 top-3 flex items-center gap-1 rounded-full bg-scrim/70 px-3 py-1 text-sm font-semibold text-card',
        className,
      )}
      {...props}
    >
      <span className="animate-[blink_1s_infinite] text-destructive">●</span>
      {children}
    </div>
  )
}
