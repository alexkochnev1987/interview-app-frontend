import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex field-sizing-content w-full rounded-3xl border border-hairline-strong bg-surface-low-soft px-4 py-3 leading-7 transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        xs: "min-h-[72px] text-base",
        sm: "min-h-[120px] text-base",
        md: "min-h-[150px] text-base",
        lg: "min-h-[180px] text-base",
        xl: "min-h-[220px] text-base",
      },
      tone: {
        prose: "",
        code: "font-mono text-sm",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "prose",
    },
  },
)

function Textarea({
  className,
  size,
  tone,
  ...props
}: React.ComponentProps<"textarea"> &
  VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ size, tone }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
