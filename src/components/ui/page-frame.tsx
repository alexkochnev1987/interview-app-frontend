import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

const pageFrameVariants = cva("", {
  variants: {
    spacing: {
      page: "py-10 md:py-12",
      compact: "py-12",
      login: "py-10 lg:py-14",
    },
  },
  defaultVariants: {
    spacing: "page",
  },
})

type PageFrameProps = Omit<ComponentProps<"div">, "className"> &
  VariantProps<typeof pageFrameVariants> & {
    as?: "div" | "main" | "section"
  }

function PageFrame({ as, spacing, ...props }: PageFrameProps) {
  const Comp = as ?? "div"
  return <Comp {...props} className={pageFrameVariants({ spacing })} />
}

export { PageFrame }

