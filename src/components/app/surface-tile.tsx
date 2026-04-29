import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const surfaceTileVariants = cva('ring-1 ring-hairline', {
  variants: {
    tone: {
      soft: 'bg-surface-low-soft',
      elevated: 'bg-surface-low-glass',
      glass: 'bg-surface-glass',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    },
    rounded: {
      lg: 'rounded-2xl',
      xl: 'rounded-xl-2',
      '2xl': 'rounded-3xl',
    },
  },
  defaultVariants: {
    tone: 'soft',
    padding: 'md',
    rounded: '2xl',
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
  ...props
}: SurfaceTileProps) {
  return (
    <div
      className={cn(surfaceTileVariants({ tone, padding, rounded }), className)}
      {...props}
    />
  )
}
