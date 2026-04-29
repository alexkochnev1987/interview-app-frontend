import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const iconBadgeVariants = cva(
  'flex shrink-0 items-center justify-center',
  {
    variants: {
      tone: {
        primary:
          'bg-[hsl(var(--primary-fixed)/0.85)] text-[hsl(var(--primary))]',
        surface:
          'bg-surface-low-glass text-[hsl(var(--primary))] ring-1 ring-hairline',
        danger:
          'bg-danger-soft text-destructive ring-1 ring-danger-soft-border',
      },
      size: {
        sm: 'size-10 rounded-2xl',
        md: 'size-12 rounded-2xl',
        lg: 'size-14 rounded-xl-4',
      },
    },
    defaultVariants: {
      tone: 'primary',
      size: 'sm',
    },
  },
)

interface IconBadgeProps extends VariantProps<typeof iconBadgeVariants> {
  children: ReactNode
  className?: string
}

export function IconBadge({ children, className, tone, size }: IconBadgeProps) {
  return (
    <span className={cn(iconBadgeVariants({ tone, size }), className)}>
      {children}
    </span>
  )
}
