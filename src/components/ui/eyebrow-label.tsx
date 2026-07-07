import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const eyebrowLabelVariants = cva('uppercase', {
  variants: {
    size: {
      xs: 'text-[0.6rem] tracking-eyebrow',
      sm: 'text-[0.68rem] tracking-eyebrow',
      md: 'text-[0.72rem] tracking-eyebrow-wide',
      lg: 'text-[0.72rem] tracking-eyebrow-widest',
    },
    tone: {
      muted: 'text-muted-foreground',
      primary: 'text-[hsl(var(--primary))]',
      info: 'text-sky-700',
      neutral: 'text-slate-600',
      warning: 'text-amber-700',
      success: 'text-emerald-700',
    },
    weight: {
      normal: 'font-normal',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    size: 'sm',
    tone: 'muted',
    weight: 'semibold',
  },
})

interface EyebrowLabelProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof eyebrowLabelVariants> {}

export function EyebrowLabel({
  className,
  size,
  tone,
  weight,
  ...props
}: EyebrowLabelProps) {
  return (
    <div
      className={cn(eyebrowLabelVariants({ size, tone, weight }), className)}
      {...props}
    />
  )
}
