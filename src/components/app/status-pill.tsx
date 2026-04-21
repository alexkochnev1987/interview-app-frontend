import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusTone =
  | "neutral"
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
  pending:
    "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  in_progress:
    "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
  processing:
    "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
  completed:
    "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  failed:
    "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
  easy: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  medium: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  hard: "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
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
