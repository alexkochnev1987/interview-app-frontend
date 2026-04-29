import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type EyebrowTone = 'default' | 'muted' | 'primary'
type EyebrowSize = 'default' | 'sm'
type EyebrowCasing = 'uppercase' | 'normal'

const toneClasses: Record<EyebrowTone, string> = {
  default:
    'bg-surface-low-glass text-muted-foreground ring-1 ring-hairline',
  muted: 'bg-surface-glass-soft text-muted-foreground ring-1 ring-hairline',
  primary: 'bg-[hsl(var(--primary-fixed)/0.8)] text-[hsl(var(--primary))]',
}

const sizeClasses: Record<EyebrowSize, string> = {
  default: 'px-3 py-1 text-[0.72rem]',
  sm: 'px-3 py-1 text-[0.68rem]',
}

const casingClasses: Record<EyebrowCasing, string> = {
  uppercase: 'font-semibold uppercase',
  normal: 'font-medium',
}

const trackingClasses: Record<`${EyebrowSize}-${EyebrowCasing}`, string> = {
  'default-uppercase': 'tracking-[0.24em]',
  'sm-uppercase': 'tracking-[0.18em]',
  'default-normal': 'leading-5',
  'sm-normal': 'leading-5',
}

interface EyebrowBadgeProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  size?: EyebrowSize
  tone?: EyebrowTone
  casing?: EyebrowCasing
}

export function EyebrowBadge({
  children,
  className,
  icon,
  size = 'default',
  tone = 'default',
  casing = 'uppercase',
  ...props
}: EyebrowBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex w-fit items-center gap-2 rounded-full',
        toneClasses[tone],
        sizeClasses[size],
        casingClasses[casing],
        trackingClasses[`${size}-${casing}`],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </div>
  )
}
