import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

const pageFrameVariants = cva("", {
  variants: {
    spacing: {
      page: "py-10 md:py-12",
      compact: "py-12",
    },
    stretch: {
      none: "",
      viewport: "min-h-[100dvh] flex flex-col box-border",
    },
  },
  defaultVariants: {
    spacing: "page",
    stretch: "none",
  },
})

type PageFrameProps = Omit<ComponentProps<"div">, "className"> &
  VariantProps<typeof pageFrameVariants> & {
    as?: "div" | "main" | "section"
  }

function PageFrame({ as, spacing, stretch, ...props }: PageFrameProps) {
  const Comp = as ?? "div"
  return <Comp {...props} className={pageFrameVariants({ spacing, stretch })} />
}

export { PageFrame }

