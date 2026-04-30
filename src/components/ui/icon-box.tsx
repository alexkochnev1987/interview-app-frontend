import type { ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const iconBoxVariants = cva("flex items-center justify-center", {
  variants: {
    tone: {
      primarySoft: "bg-[hsl(var(--primary-fixed)/0.85)] text-[hsl(var(--primary))]",
    },
    size: {
      sm: "size-12",
      md: "size-16",
    },
    shape: {
      soft: "rounded-[1.4rem]",
      pill: "rounded-full",
    },
    centered: {
      false: "",
      true: "mx-auto",
    },
  },
  defaultVariants: {
    tone: "primarySoft",
    size: "md",
    shape: "soft",
    centered: false,
  },
})

interface IconBoxProps extends VariantProps<typeof iconBoxVariants> {
  children: ReactNode
}

function IconBox({ children, tone, size, shape, centered }: IconBoxProps) {
  return <div className={cn(iconBoxVariants({ tone, size, shape, centered }))}>{children}</div>
}

export { IconBox }
