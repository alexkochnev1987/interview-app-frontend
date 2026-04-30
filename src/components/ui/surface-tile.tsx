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
    minHeight: {
      none: '',
      transcript: 'min-h-[130px]',
    },
    visibility: {
      always: '',
      'sm-only': 'hidden sm:block',
    },
    textAlign: {
      start: '',
      end: 'text-right',
    },
  },
  defaultVariants: {
    tone: 'soft',
    padding: 'md',
    rounded: '2xl',
    minHeight: 'none',
    visibility: 'always',
    textAlign: 'start',
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
  minHeight,
  visibility,
  textAlign,
  ...props
}: SurfaceTileProps) {
  return (
    <div
      className={cn(
        surfaceTileVariants({
          tone,
          padding,
          rounded,
          minHeight,
          visibility,
          textAlign,
        }),
        className,
      )}
      {...props}
    />
  )
}
