import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusPillVariants = cva('rounded-full border-0 shadow-none', {
  variants: {
    size: {
      default: 'px-3 py-1 text-[0.68rem] font-semibold',
      compact: 'px-2.5 py-1 text-[0.66rem] font-bold',
      header: 'px-2 py-0.5 text-[0.66rem] font-bold',
    },
    tone: {
      neutral: 'bg-pill-slate-bg text-pill-slate ring-1 ring-pill-slate-border',
      neutral_meta:
        'bg-pill-slate-bg text-pill-slate ring-1 ring-pill-slate-border normal-case tracking-chip',
      primary: 'bg-primary/15 text-primary ring-1 ring-primary/30',
      pending: 'bg-pill-amber-bg text-pill-amber ring-1 ring-pill-amber-border',
      in_progress: 'bg-pill-sky-bg text-pill-sky ring-1 ring-pill-sky-border',
      processing: 'bg-pill-orange-bg text-pill-orange ring-1 ring-pill-orange-border',
      completed: 'bg-pill-emerald-bg text-pill-emerald ring-1 ring-pill-emerald-border',
      failed: 'bg-pill-rose-bg text-pill-rose ring-1 ring-pill-rose-border',
      canceled: 'bg-pill-slate-bg text-pill-slate ring-1 ring-pill-slate-border',
      scheduled:
        'bg-scheduled-soft text-scheduled-soft-foreground ring-1 ring-scheduled-soft-foreground',
      easy: 'bg-pill-emerald-bg text-pill-emerald ring-1 ring-pill-emerald-border',
      medium: 'bg-pill-amber-bg text-pill-amber ring-1 ring-pill-amber-border',
      hard: 'bg-pill-violet-bg text-pill-violet ring-1 ring-pill-violet-border',
    },
    casing: {
      eyebrow: 'uppercase tracking-eyebrow',
      chip: 'normal-case tracking-chip',
    },
  },
  defaultVariants: {
    size: 'default',
    tone: 'neutral',
    casing: 'eyebrow',
  },
})

export type StatusTone = NonNullable<VariantProps<typeof statusPillVariants>['tone']>

interface StatusPillProps
  extends Omit<ComponentProps<'span'>, 'color'>, VariantProps<typeof statusPillVariants> {}

export function StatusPill({ size, tone, casing, className, children, ...props }: StatusPillProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(statusPillVariants({ size, tone, casing }), className)}
      {...props}
    >
      {children}
    </Badge>
  )
}
