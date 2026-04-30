import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface HoverCueProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

export function HoverCue({ className, children, ...props }: HoverCueProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium text-foreground transition-transform group-hover:translate-x-0.5',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
