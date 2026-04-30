import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import {
  STATUS_COMPLETED_SURFACE,
  STATUS_DESTRUCTIVE_SURFACE,
  STATUS_FAILED_SURFACE,
  STATUS_IN_PROGRESS_SURFACE,
  STATUS_NEUTRAL_SURFACE,
  STATUS_NEUTRAL_META_SURFACE,
  STATUS_PENDING_SURFACE,
  STATUS_PILL_BASE,
  STATUS_PROCESSING_SURFACE,
} from "@/components/app/style-tokens"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusTone =
  | "neutral"
  | "neutral_meta"
  | "pending"
  | "in_progress"
  | "processing"
  | "completed"
  | "failed"
  | "easy"
  | "medium"
  | "hard"

const statusPillVariants = cva(STATUS_PILL_BASE, {
  variants: {
    tone: {
      neutral: STATUS_NEUTRAL_SURFACE,
      neutral_meta: STATUS_NEUTRAL_META_SURFACE,
      pending: STATUS_PENDING_SURFACE,
      in_progress: STATUS_IN_PROGRESS_SURFACE,
      processing: STATUS_PROCESSING_SURFACE,
      completed: STATUS_COMPLETED_SURFACE,
      failed: STATUS_DESTRUCTIVE_SURFACE,
      easy: STATUS_COMPLETED_SURFACE,
      medium: STATUS_PENDING_SURFACE,
      hard: STATUS_FAILED_SURFACE,
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
})

interface StatusPillProps extends ComponentProps<"span">, VariantProps<typeof statusPillVariants> {}

export function StatusPill({
  tone,
  className,
  children,
  ...props
}: StatusPillProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(statusPillVariants({ tone }), className)}
      {...props}
    >
      {children}
    </Badge>
  )
}
