"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const progressVariants = cva("relative flex w-full items-center overflow-x-hidden rounded-full", {
  variants: {
    size: {
      default: "h-1",
      md: "h-2.5",
    },
    tone: {
      default: "bg-muted",
      softLight: "bg-white",
    },
  },
  defaultVariants: {
    size: "default",
    tone: "default",
  },
})

function Progress({
  className,
  value,
  size,
  tone,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & VariantProps<typeof progressVariants>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(progressVariants({ size, tone }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
