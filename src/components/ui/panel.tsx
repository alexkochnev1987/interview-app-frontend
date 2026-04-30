import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const panelVariants = cva("ring-1 ring-border/45", {
  variants: {
    tone: {
      surface: "bg-[hsl(var(--surface-low)/0.85)]",
      surfaceStrong: "bg-[hsl(var(--surface-low)/0.9)]",
      white: "bg-white/85",
    },
    radius: {
      md: "rounded-[1.25rem]",
      lg: "rounded-[1.5rem]",
    },
    padding: {
      md: "p-4",
      lg: "p-5",
    },
    minHeight: {
      none: "",
      transcript: "min-h-[130px]",
    },
  },
  defaultVariants: {
    tone: "surface",
    radius: "md",
    padding: "md",
    minHeight: "none",
  },
})

type PanelProps = Omit<ComponentProps<"div">, "className"> & VariantProps<typeof panelVariants>

function Panel({ tone, radius, padding, minHeight, ...props }: PanelProps) {
  return <div className={cn(panelVariants({ tone, radius, padding, minHeight }))} {...props} />
}

export { Panel }
