import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import {
  SURFACE_LOW_STRONG_BG,
  SURFACE_SHADOW_FLOAT,
  SURFACE_SHADOW_SOFT,
  SURFACE_WHITE_MUTED_BORDER,
  SURFACE_WHITE_SOFT_BG,
  SURFACE_WHITE_SOFT_BORDER,
} from "@/components/app/style-tokens"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
  {
    variants: {
      tone: {
        default: "",
        surfaceGlassSoft: `${SURFACE_WHITE_SOFT_BORDER} ${SURFACE_WHITE_SOFT_BG} text-card-foreground ${SURFACE_SHADOW_SOFT}`,
        surfaceGlassFloat: `${SURFACE_WHITE_SOFT_BORDER} ${SURFACE_WHITE_SOFT_BG} text-card-foreground ${SURFACE_SHADOW_FLOAT}`,
        surfaceMutedSoft: `${SURFACE_WHITE_MUTED_BORDER} ${SURFACE_LOW_STRONG_BG} text-card-foreground ${SURFACE_SHADOW_SOFT}`,
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

const cardHeaderVariants = cva(
  "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
  {
    variants: {
      layout: {
        default: "",
        form: "space-y-3 px-8 pt-8",
      },
    },
    defaultVariants: {
      layout: "default",
    },
  }
)

const cardTitleVariants = cva("font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", {
  variants: {
    size: {
      default: "",
      section: "text-2xl tracking-[-0.03em]",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const cardContentVariants = cva("px-4 group-data-[size=sm]/card:px-3", {
  variants: {
    layout: {
      default: "",
      spacious: "space-y-6 px-8 py-8",
      hero: "flex h-full flex-col gap-6 px-8 py-8",
      form: "px-8 pb-8",
      compact: "space-y-3 px-5 py-5",
      takeComplete: "space-y-6 px-8 py-10 text-center",
      stateLoading: "py-16 text-center text-sm text-muted-foreground",
      stateEmpty: "flex flex-col items-center gap-4 py-16 text-center",
    },
  },
  defaultVariants: {
    layout: "default",
  },
})

function Card({
  className,
  size = "default",
  tone = "default",
  ...props
}: React.ComponentProps<"div"> &
  { size?: "default" | "sm" } &
  VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-tone={tone}
      className={cn(
        cardVariants({ tone }),
        className
      )}
      {...props}
    />
  )
}

function CardHeader({
  className,
  layout = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardHeaderVariants>) {
  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderVariants({ layout }), className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardTitleVariants>) {
  return (
    <div
      data-slot="card-title"
      className={cn(cardTitleVariants({ size }), className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({
  className,
  layout = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardContentVariants>) {
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ layout }), className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
