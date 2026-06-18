import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

type DividedStackProps = Omit<ComponentProps<"div">, "children"> & {
  children: ReactNode
}

export function DividedStack({ className, children, ...props }: DividedStackProps) {
  return (
    <div className={cn("divide-y divide-border", className)} {...props}>
      {children}
    </div>
  )
}

type DividedStackItemProps = ComponentProps<"div">

export function DividedStackItem({ className, ...props }: DividedStackItemProps) {
  return (
    <div
      className={cn("py-4 first:pt-3 last:pb-0", className)}
      {...props}
    />
  )
}
