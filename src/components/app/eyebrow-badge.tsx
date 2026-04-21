import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type EyebrowTone = 'default' | 'muted' | 'primary'
type EyebrowSize = 'default' | 'sm'

const toneClasses: Record<EyebrowTone, string> = {
  default:
    'bg-[hsl(var(--surface-low)/0.9)] text-muted-foreground ring-1 ring-border/50',
  muted: 'bg-white/70 text-muted-foreground ring-1 ring-border/40',
  primary: 'bg-[hsl(var(--primary-fixed)/0.8)] text-[hsl(var(--primary))]',
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
