import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const segmentedGroupVariants = cva(
  'inline-flex flex-row items-center rounded-full border border-border bg-surface-glass-soft p-0.5',
  {
    variants: {
      gap: {
        0: 'gap-0',
        1: 'gap-1',
      },
    },
    defaultVariants: {
      gap: 0,
    },
  },
)

type SegmentedGroupProps = React.ComponentProps<'div'> &
  VariantProps<typeof segmentedGroupVariants> & {
    ariaLabel: string
  }

export function SegmentedGroup({
  className,
  gap,
  ariaLabel,
  ...props
}: SegmentedGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-slot="segmented-group"
      className={cn(segmentedGroupVariants({ gap }), className)}
      {...props}
    />
  )
}
