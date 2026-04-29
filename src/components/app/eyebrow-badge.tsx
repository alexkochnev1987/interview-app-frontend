import type { HTMLAttributes, ReactNode } from 'react'

import {
  RING_BORDER_LIGHT,
  RING_BORDER_SUBTLE,
  SURFACE_LOW_STRONG_BG,
  SURFACE_PRIMARY_SOFT_BG,
  SURFACE_PRIMARY_SOFT_TEXT,
} from '@/components/app/style-tokens'
import { cn } from '@/lib/utils'

type EyebrowTone = 'default' | 'muted' | 'primary'
type EyebrowSize = 'default' | 'sm'

const toneClasses: Record<EyebrowTone, string> = {
  default: `${SURFACE_LOW_STRONG_BG} text-muted-foreground ${RING_BORDER_SUBTLE}`,
  muted: `bg-white/70 text-muted-foreground ${RING_BORDER_LIGHT}`,
  primary: `${SURFACE_PRIMARY_SOFT_BG} ${SURFACE_PRIMARY_SOFT_TEXT}`,
}

const sizeClasses: Record<EyebrowSize, string> = {
  default: 'px-3 py-1 text-[0.72rem] tracking-[0.24em]',
  sm: 'px-3 py-1 text-[0.68rem] tracking-[0.18em]',
}

interface EyebrowBadgeProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  size?: EyebrowSize
  tone?: EyebrowTone
}

export function EyebrowBadge({
  children,
  className,
  icon,
  size = 'default',
  tone = 'default',
  ...props
}: EyebrowBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex w-fit items-center gap-2 rounded-full font-semibold uppercase',
        toneClasses[tone],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </div>
  )
}
