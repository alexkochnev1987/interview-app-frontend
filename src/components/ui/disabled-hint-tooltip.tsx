'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const disabledHintTriggerVariants = cva('', {
  variants: {
    width: {
      auto: 'inline-flex',
      full: 'inline-flex w-full',
    },
  },
  defaultVariants: {
    width: 'auto',
  },
})

interface DisabledHintTooltipProps
  extends VariantProps<typeof disabledHintTriggerVariants> {
  hint: string
  /** When false the children render as-is, with no tooltip wrapper. */
  active: boolean
  children: React.ReactNode
}

// A disabled button emits no pointer events, so the wrapping span is the tooltip trigger.
export function DisabledHintTooltip({
  hint,
  active,
  width,
  children,
}: DisabledHintTooltipProps) {
  if (!active) {
    return <>{children}</>
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn(disabledHintTriggerVariants({ width }))}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}
