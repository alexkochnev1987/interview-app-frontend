import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const textListVariants = cva("", {
  variants: {
    gap: {
      2: "space-y-2",
    },
    marker: {
      disc: "list-disc pl-5",
    },
  },
  defaultVariants: {
    gap: 2,
    marker: "disc",
  },
})

type TextListProps = ComponentProps<"ul"> & VariantProps<typeof textListVariants>

function TextList({ className, gap, marker, ...props }: TextListProps) {
  return <ul className={cn(textListVariants({ gap, marker }), className)} {...props} />
}

function TextListItem(props: ComponentProps<"li">) {
  return <li {...props} />
}

export { TextList, TextListItem }
