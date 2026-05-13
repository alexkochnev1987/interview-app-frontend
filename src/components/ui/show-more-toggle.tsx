import { ChevronDown, ChevronRight } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

type ShowMoreToggleProps = Omit<ComponentProps<"button">, "type"> & {
  expanded: boolean
  children: ReactNode
}

export function ShowMoreToggle({
  className,
  expanded,
  children,
  ...props
}: ShowMoreToggleProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 self-start px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    >
      {expanded ? (
        <ChevronRight className="size-3" />
      ) : (
        <ChevronDown className="size-3" />
      )}
      {children}
    </button>
  )
}
