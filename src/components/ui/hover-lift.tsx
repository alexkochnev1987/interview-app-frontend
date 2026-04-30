import type { ComponentProps } from "react"

function HoverLift({ children }: ComponentProps<"div">) {
  return <div className="transition-transform duration-200 hover:-translate-y-0.5">{children}</div>
}

export { HoverLift }
