import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusTone =
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

const toneClasses: Record<StatusTone, string> = {
  neutral:
    "bg-[hsl(var(--surface-low))] text-[hsl(var(--muted-foreground))] ring-1 ring-[hsl(var(--border)/0.55)]",
  neutral_meta:
    "bg-[hsl(var(--surface-low))] text-[hsl(var(--muted-foreground))] normal-case tracking-[0.08em] ring-1 ring-[hsl(var(--border)/0.55)]",
  pending:
    "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending-fg)] ring-1 ring-[var(--color-status-pending-ring)]",
  in_progress:
    "bg-[var(--color-status-in-progress-bg)] text-[var(--color-status-in-progress-fg)] ring-1 ring-[var(--color-status-in-progress-ring)]",
  processing:
    "bg-[var(--color-status-processing-bg)] text-[var(--color-status-processing-fg)] ring-1 ring-[var(--color-status-processing-ring)]",
  completed:
    "bg-[var(--color-status-completed-bg)] text-[var(--color-status-completed-fg)] ring-1 ring-[var(--color-status-completed-ring)]",
  failed:
    "bg-destructive/10 text-destructive ring-1 ring-destructive/30",
  easy: "bg-[var(--color-status-completed-bg)] text-[var(--color-status-completed-fg)] ring-1 ring-[var(--color-status-completed-ring)]",
  medium: "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending-fg)] ring-1 ring-[var(--color-status-pending-ring)]",
  hard: "bg-[var(--color-status-failed-bg)] text-[var(--color-status-failed-fg)] ring-1 ring-[var(--color-status-failed-ring)]",
}

interface StatusPillProps extends ComponentProps<"span"> {
  tone?: StatusTone
}

export function StatusPill({
  tone = "neutral",
  className,
  children,
  ...props
}: StatusPillProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full border-0 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.16em] uppercase shadow-none",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  )
}
