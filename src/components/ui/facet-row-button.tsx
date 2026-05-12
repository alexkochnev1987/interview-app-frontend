import type { ComponentProps, ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const facetRowButtonVariants = cva(
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
  {
    variants: {
      state: {
        default: "text-foreground hover:bg-muted",
        selected: "bg-primary/10 font-medium text-primary",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
)

type FacetRowButtonProps = Omit<ComponentProps<"button">, "type"> &
  VariantProps<typeof facetRowButtonVariants> & {
    label: string
    trailing?: ReactNode
  }

export function FacetRowButton({
  className,
  state,
  label,
  trailing,
  ...props
}: FacetRowButtonProps) {
  const isSelected = state === "selected"
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={cn(facetRowButtonVariants({ state }), className)}
      {...props}
    >
      <span className="flex-1 truncate">{label}</span>
      {trailing != null ? (
        <span
          className={cn(
            "tabular-nums text-xs",
            isSelected ? "text-primary" : "text-muted-foreground",
          )}
        >
          {trailing}
        </span>
      ) : null}
    </button>
  )
}
