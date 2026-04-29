import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const eyebrowLabelVariants = cva('font-semibold uppercase', {
  variants: {
    size: {
      sm: 'text-[0.68rem] tracking-[0.16em]',
      md: 'text-[0.72rem] tracking-[0.18em]',
      lg: 'text-[0.72rem] tracking-[0.24em]',
    },
    tone: {
      muted: 'text-muted-foreground',
      primary: 'text-[hsl(var(--primary))]',
    },
  },
  defaultVariants: {
    size: 'sm',
    tone: 'muted',
  },
})

interface EyebrowLabelProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof eyebrowLabelVariants> {}

export function EyebrowLabel({
  className,
  size,
  tone,
  ...props
}: EyebrowLabelProps) {
  return (
    <div
      className={cn(eyebrowLabelVariants({ size, tone }), className)}
      {...props}
    />
  )
}
