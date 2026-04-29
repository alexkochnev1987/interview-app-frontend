import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const surfaceTileVariants = cva('ring-1 ring-hairline', {
  variants: {
    tone: {
      soft: 'bg-surface-low-soft',
      elevated: 'bg-surface-low-glass',
      glass: 'bg-surface-glass',
      'primary-soft':
        'bg-[hsl(var(--primary-fixed)/0.55)] ring-[hsl(var(--primary)/0.15)]',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
      'md-tight': 'px-4 py-3',
    },
    rounded: {
      lg: 'rounded-2xl',
      xl: 'rounded-xl-2',
      '2xl': 'rounded-3xl',
      pill: 'rounded-full',
    },
    spacing: {
      none: '',
      sm: 'space-y-3',
      md: 'space-y-4',
      lg: 'space-y-5',
    },
    layout: {
      default: '',
      'row-between': 'flex items-center justify-between gap-3',
      'row-start': 'flex items-start gap-3',
    },
  },
  defaultVariants: {
    tone: 'soft',
    padding: 'md',
    rounded: '2xl',
    spacing: 'none',
    layout: 'default',
  },
})

interface SurfaceTileProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceTileVariants> {}

export function SurfaceTile({
  className,
  tone,
  padding,
  rounded,
  spacing,
  layout,
  ...props
}: SurfaceTileProps) {
  return (
    <div
      className={cn(
        surfaceTileVariants({ tone, padding, rounded, spacing, layout }),
        className,
      )}
      {...props}
    />
  )
}
