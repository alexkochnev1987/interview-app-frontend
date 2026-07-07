import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SelectableOverlayProps extends HTMLAttributes<HTMLDivElement> {
  marker: ReactNode
  children: ReactNode
  interactive?: boolean
  onToggle?: () => void
}

export function SelectableOverlay({
  marker,
  children,
  className,
  interactive = false,
  onToggle,
  ...props
}: SelectableOverlayProps) {
  return (
    <div
      {...props}
      className={cn('group relative', interactive && 'cursor-pointer', className)}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onToggle : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onToggle?.()
              }
            }
          : undefined
      }
    >
      <span
        className="absolute right-4 top-4 z-10 transition-transform duration-200 group-hover:-translate-y-1"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {marker}
      </span>
      {children}
    </div>
  )
}
