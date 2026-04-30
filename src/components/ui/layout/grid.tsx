import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

const gridVariants = cva("grid", {
  variants: {
    gap: {
      0: "gap-0",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      6: "gap-6",
      8: "gap-8",
    },
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-2",
      "2-md": "grid-cols-1 md:grid-cols-2",
      "2-md-4-xl": "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
      consent: "grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]",
      recording: "grid-cols-1 xl:grid-cols-[0.84fr_1.16fr]",
      login: "grid-cols-1 lg:grid-cols-[1.1fr_420px]",
    },
    align: {
      stretch: "items-stretch",
      start: "items-start",
      center: "items-center",
      end: "items-end",
    },
    height: {
      auto: "",
      interview: "min-h-[calc(100vh-6rem)]",
    },
  },
  defaultVariants: {
    gap: 0,
    columns: 1,
    align: "stretch",
    height: "auto",
  },
})

type GridProps = Omit<React.ComponentPropsWithoutRef<"div">, "className"> &
  VariantProps<typeof gridVariants> & {
    as?: "div" | "section"
  }

function Grid({ as, gap, columns, align, height, ...props }: GridProps) {
  const Comp = as ?? "div"
  return <Comp className={gridVariants({ gap, columns, align, height })} {...props} />
}

export { Grid }
