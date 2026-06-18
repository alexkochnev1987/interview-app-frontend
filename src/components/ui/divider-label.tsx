import type { ReactNode } from 'react'

import { Separator } from '@/components/ui/separator'

interface DividerLabelProps {
  children: ReactNode
}

export function DividerLabel({ children }: DividerLabelProps) {
  return (
    <div className="relative">
      <Separator />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs font-medium uppercase tracking-eyebrow-wide text-muted-foreground">
        {children}
      </span>
    </div>
  )
}
