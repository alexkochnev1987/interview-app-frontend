'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Progress as ProgressPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const progressVariants = cva('relative flex w-full items-center overflow-x-hidden rounded-full', {
  variants: {
    density: {
      thin: 'h-1 bg-muted',
      thick: 'h-2.5 bg-card',
    },
  },
  defaultVariants: {
    density: 'thin',
  },
})

interface ProgressProps
  extends ComponentProps<typeof ProgressPrimitive.Root>, VariantProps<typeof progressVariants> {}

function Progress({ className, value, density, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(progressVariants({ density }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 bg-primary transition-transform duration-300"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
