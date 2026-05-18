import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusPillVariants = cva(
  "rounded-full border-0 shadow-none",
  {
    variants: {
      size: {
        default: "px-3 py-1 text-[0.68rem] font-semibold",
        compact: "px-2.5 py-1 text-[0.66rem] font-bold",
      },
      tone: {
        neutral:
          "bg-[hsl(var(--surface-low))] text-[hsl(var(--muted-foreground))] ring-1 ring-[hsl(var(--border)/0.55)]",
        neutral_meta:
          "bg-[hsl(var(--surface-low))] text-[hsl(var(--muted-foreground))] ring-1 ring-[hsl(var(--border)/0.55)] normal-case tracking-[0.08em]",
        primary:
          "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary)/0.3)]",
        pending: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
        in_progress: "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
        processing: "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
        completed: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
        failed: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
        easy: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
        medium: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
        hard: "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
      },
      casing: {
        eyebrow: "uppercase tracking-eyebrow",
        chip: "normal-case tracking-chip",
      },
    },
    defaultVariants: {
      size: "default",
      tone: "neutral",
      casing: "eyebrow",
    },
  },
)

export type StatusTone = NonNullable<VariantProps<typeof statusPillVariants>["tone"]>

interface StatusPillProps
  extends Omit<ComponentProps<"span">, "color">,
    VariantProps<typeof statusPillVariants> {}

export function StatusPill({
  size,
  tone,
  casing,
  className,
  children,
  ...props
}: StatusPillProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(statusPillVariants({ size, tone, casing }), className)}
      {...props}
    >
      {children}
    </Badge>
  )
}
