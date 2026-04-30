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
        gradient:
          'bg-primary-gradient text-primary-foreground shadow-soft',
      },
      size: {
        sm: 'size-10 rounded-2xl',
        md: 'size-12 rounded-2xl',
        lg: 'size-14 rounded-xl-4',
        xl: 'size-16 rounded-xl-4',
      },
      shape: {
        default: '',
        circle: 'rounded-full',
      },
      textSize: {
        default: '',
        sm: 'text-sm font-semibold',
        md: 'text-base font-semibold',
        lg: 'text-lg font-semibold',
      },
      align: {
        default: '',
        center: 'mx-auto',
      },
    },
    defaultVariants: {
      tone: 'primary',
      size: 'sm',
      shape: 'default',
      textSize: 'default',
      align: 'default',
    },
  },
)

interface IconBadgeProps extends VariantProps<typeof iconBadgeVariants> {
  children: ReactNode
  className?: string
}

export function IconBadge({
  children,
  className,
  tone,
  size,
  shape,
  textSize,
  align,
}: IconBadgeProps) {
  return (
    <span className={cn(iconBadgeVariants({ tone, size, shape, textSize, align }), className)}>
      {children}
    </span>
  )
}
