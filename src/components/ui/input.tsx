import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 border border-hairline-strong bg-surface-low-soft text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        md: "h-11 px-4",
        lg: "h-12 px-4",
      },
      shape: {
        rounded: "rounded-2xl",
        pill: "rounded-full",
      },
      iconAffix: {
        none: "",
        leading: "pl-11",
        trailing: "pr-11",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "rounded",
      iconAffix: "none",
    },
  },
)

function Input({
  className,
  type,
  size,
  shape,
  iconAffix,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size, shape, iconAffix }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
