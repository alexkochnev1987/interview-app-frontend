import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import {
  RING_BORDER_SOFT,
  SURFACE_LOW_BG,
  SURFACE_LOW_STRONG_BG,
  SURFACE_WHITE_PANEL_BG,
} from "@/components/ui/style-tokens"
import { cn } from "@/lib/utils"

const panelVariants = cva(RING_BORDER_SOFT, {
  variants: {
    tone: {
      surface: SURFACE_LOW_BG,
      surfaceStrong: SURFACE_LOW_STRONG_BG,
      white: SURFACE_WHITE_PANEL_BG,
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
