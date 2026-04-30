import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

const containerVariants = cva("", {
  variants: {
    width: {
      container: "container",
      "4xl": "max-w-4xl",
      "5xl": "max-w-5xl",
      "6xl": "max-w-6xl",
    },
    centered: {
      false: "",
      true: "mx-auto",
    },
  },
  defaultVariants: {
    width: "container",
    centered: false,
  },
})

type ContainerProps = Omit<React.ComponentPropsWithoutRef<"div">, "className"> &
  VariantProps<typeof containerVariants> & {
    as?: "div" | "main" | "section"
  }

function Container({ as, width, centered, ...props }: ContainerProps) {
  const Comp = as ?? "div"
  return <Comp className={containerVariants({ width, centered })} {...props} />
}

export { Container }
