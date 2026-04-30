import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

const inlineVariants = cva("flex flex-row", {
  variants: {
    gap: {
      0: "gap-0",
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      6: "gap-6",
    },
    align: {
      stretch: "items-stretch",
      start: "items-start",
      center: "items-center",
      end: "items-end",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    wrap: {
      false: "flex-nowrap",
      true: "flex-wrap",
    },
  },
  defaultVariants: {
    gap: 0,
    align: "stretch",
    justify: "start",
    wrap: false,
  },
})

type InlineProps = Omit<React.ComponentPropsWithoutRef<"div">, "className"> &
  VariantProps<typeof inlineVariants> & {
    as?: "div" | "span"
  }

function Inline({ as, gap, align, justify, wrap, ...props }: InlineProps) {
  const Comp = as ?? "div"
  return <Comp {...props} className={inlineVariants({ gap, align, justify, wrap })} />
}

export { Inline }
