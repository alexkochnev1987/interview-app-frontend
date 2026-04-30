import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

const stackVariants = cva("flex flex-col", {
  variants: {
    gap: {
      0: "gap-0",
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5",
      6: "gap-6",
      8: "gap-8",
      "8-md-10": "gap-8 md:gap-10",
      "6-md-8": "gap-6 md:gap-8",
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
  },
  defaultVariants: {
    gap: 4,
    align: "stretch",
    justify: "start",
  },
})

type StackProps = Omit<React.ComponentPropsWithoutRef<"div">, "className"> &
  VariantProps<typeof stackVariants> & {
    as?: "div" | "section"
  }

function Stack({ as, gap, align, justify, ...props }: StackProps) {
  const Comp = as ?? "div"
  return <Comp {...props} className={stackVariants({ gap, align, justify })} />
}

export { Stack }
