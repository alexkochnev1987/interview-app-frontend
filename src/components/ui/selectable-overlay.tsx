import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SelectableOverlayProps extends HTMLAttributes<HTMLDivElement> {
  marker: ReactNode
  children: ReactNode
}

export function SelectableOverlay({
  marker,
  children,
  className,
  ...props
}: SelectableOverlayProps) {
  return (
    <div className={cn('group relative', className)} {...props}>
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
