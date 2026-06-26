import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "group/card flex flex-col overflow-hidden rounded-xl text-sm text-card-foreground has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
  {
    variants: {
      variant: {
        default: "bg-card ring-1 ring-foreground/10",
        surface:
          "border border-hairline-strong bg-surface-glass shadow-soft",
        surfaceFlat:
          "border border-hairline-strong bg-surface-glass shadow-none",
        floating:
          "border border-hairline-strong bg-surface-glass shadow-float",
        recordingHero:
          "border border-hairline-strong bg-white shadow-float",
        metric:
          "relative isolate border border-hairline-strong bg-[linear-gradient(135deg,hsl(var(--card)/0.98),hsl(var(--surface-low)/0.58))] shadow-float after:pointer-events-none after:absolute after:-right-10 after:-top-10 after:size-24 after:rounded-full after:bg-[hsl(var(--primary)/0.08)] after:blur-2xl",
        tinted:
          "border border-hairline-strong bg-surface-low-glass shadow-soft",
        warning:
          "border border-warning-soft-border bg-warning-soft shadow-soft",
        "danger-soft":
          "border border-danger-soft-border bg-danger-soft text-danger-soft-foreground shadow-soft [&_[data-slot=card-title]]:text-danger-soft-foreground [&_[data-slot=card-description]]:text-danger-soft-foreground/80",
        "scheduled-soft":
          "border border-scheduled-soft-foreground bg-scheduled-soft text-scheduled-soft-foreground shadow-soft [&_[data-slot=card-title]]:text-scheduled-soft-foreground [&_[data-slot=card-description]]:text-scheduled-soft-foreground/80 [&_.text-muted-foreground]:text-scheduled-soft-foreground/75",
        ghost: "bg-transparent",
      },
      size: {
        xs: "gap-2 py-2",
        sm: "gap-3 py-3",
        default: "gap-4 py-4",
        md: "gap-5 py-5",
        lg: "gap-6 py-8",
        flush: "gap-0 p-0",
        state: "gap-4 py-16 min-h-[300px]",
      },
      effects: {
        none: "",
        blur: "backdrop-blur-sm",
        "blur-strong": "backdrop-blur-xl",
      },
      interaction: {
        none: "",
        hover:
          "transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-float",
        "hover-glow":
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float",
      },
      state: {
        default: "",
        selected: "ring-2 ring-destructive/70",
        deleted: "opacity-80",
        scheduled: "",
      },
      height: {
        auto: "",
        full: "h-full min-h-0",
      },
      accent: {
        none: "",
        primary: "border-l-[4px] border-l-[hsl(var(--primary))]",
        neutral: "border-l-[4px] border-l-slate-300",
        info: "border-l-[4px] border-l-sky-300",
        warning: "border-l-[4px] border-l-amber-300",
        success: "border-l-[4px] border-l-emerald-300",
      },
      flexChild: {
        default: "",
        contain: "min-w-0",
      },
      grow: {
        none: "",
        fill: "min-h-0 min-w-0 flex-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      effects: "none",
      interaction: "none",
      state: "default",
      height: "auto",
      accent: "none",
      flexChild: "default",
      grow: "none",
    },
  },
)

function Card({
  className,
  variant,
  size,
  effects,
  interaction,
  state,
  height,
  accent,
  flexChild,
  grow,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-size={size ?? "default"}
      data-variant={variant ?? "default"}
      className={cn(
        cardVariants({
          variant,
          size,
          effects,
          interaction,
          state,
          height,
          accent,
          flexChild,
          grow,
        }),
        className
      )}
      {...props}
    />
  )
}

const cardHeaderSpacingVariants = cva("", {
  variants: {
    spacing: {
      none: "gap-0",
      xs: "gap-2",
      sm: "gap-3",
      md: "gap-4",
      lg: "gap-5",
      xl: "gap-6",
      "2xl": "gap-8",
    },
  },
  defaultVariants: {
    spacing: "none",
  },
})

const cardHeaderInsetVariants = cva("", {
  variants: {
    inset: {
      card:
        "px-4 group-data-[size=xs]/card:px-6 group-data-[size=sm]/card:px-3 group-data-[size=md]/card:px-5 group-data-[size=lg]/card:px-8 group-data-[size=state]/card:px-8",
      none: "px-0",
    },
  },
  defaultVariants: {
    inset: "card",
  },
})

const cardContentVariants = cva("", {
  variants: {
    spacing: {
      none: "",
      xs: "space-y-2",
      sm: "space-y-3",
      md: "space-y-4",
      lg: "space-y-5",
      xl: "space-y-6",
      "2xl": "space-y-8",
    },
    layout: {
      default: "",
      "fill-column":
        "flex min-h-0 min-w-0 flex-1 flex-col self-stretch",
      "row-end": "flex flex-wrap justify-end",
      "split-row": "flex flex-col sm:flex-row sm:items-center sm:justify-between",
      "stack-center": "flex flex-1 flex-col items-center justify-center text-center",
    },
  },
  compoundVariants: [
    { layout: "fill-column", spacing: "none", className: "gap-0" },
    { layout: "fill-column", spacing: "xs", className: "space-y-0 gap-2" },
    { layout: "fill-column", spacing: "sm", className: "space-y-0 gap-3" },
    { layout: "fill-column", spacing: "md", className: "space-y-0 gap-4" },
    { layout: "fill-column", spacing: "lg", className: "space-y-0 gap-5" },
    { layout: "fill-column", spacing: "xl", className: "space-y-0 gap-6" },
    { layout: "fill-column", spacing: "2xl", className: "space-y-0 gap-8" },
    { layout: "row-end", spacing: "sm", className: "space-y-0 gap-3" },
    { layout: "row-end", spacing: "md", className: "space-y-0 gap-4" },
    { layout: "split-row", spacing: "md", className: "space-y-0 gap-4" },
    { layout: "split-row", spacing: "sm", className: "space-y-0 gap-3" },
    { layout: "stack-center", spacing: "md", className: "space-y-0 gap-4" },
    { layout: "stack-center", spacing: "lg", className: "space-y-0 gap-5" },
    { layout: "stack-center", spacing: "xl", className: "space-y-0 gap-6" },
  ],
  defaultVariants: {
    spacing: "none",
    layout: "default",
  },
})

function CardHeader({
  className,
  spacing,
  inset,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardHeaderSpacingVariants> &
  VariantProps<typeof cardHeaderInsetVariants>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        cardHeaderInsetVariants({ inset }),
        cardHeaderSpacingVariants({ spacing }),
        className
      )}
      {...props}
    />
  )
}

const cardTitleVariants = cva(
  "font-heading font-medium group-data-[size=sm]/card:text-sm",
  {
    variants: {
      size: {
        default: "text-base leading-snug",
        list: "text-lg tracking-display leading-snug",
        "list-clamp": "text-lg tracking-display leading-7 line-clamp-3",
        md: "text-xl tracking-display leading-snug",
        lg: "text-2xl tracking-display leading-snug",
        xl: "text-3xl font-semibold tracking-display-tight leading-snug",
        metric: "text-4xl font-semibold tracking-display-tight leading-none",
      },
      width: {
        auto: "",
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
      },
    },
    defaultVariants: {
      size: "default",
      width: "auto",
    },
  },
)

function CardTitle({
  className,
  size,
  width,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardTitleVariants>) {
  return (
    <div
      data-slot="card-title"
      className={cn(cardTitleVariants({ size, width }), className)}
      {...props}
    />
  )
}

const cardDescriptionVariants = cva("text-sm leading-6 text-muted-foreground", {
  variants: {
    width: {
      auto: "",
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-2xl",
    },
  },
  defaultVariants: {
    width: "auto",
  },
})

function CardDescription({
  className,
  width,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardDescriptionVariants>) {
  return (
    <div
      data-slot="card-description"
      className={cn(cardDescriptionVariants({ width }), className)}
      {...props}
    />
  )
}

const cardContentInsetVariants = cva("", {
  variants: {
    inset: {
      card: "px-4 group-data-[size=xs]/card:px-6 group-data-[size=sm]/card:px-3 group-data-[size=md]/card:px-5 group-data-[size=lg]/card:px-8 group-data-[size=state]/card:px-8",
      none: "!px-0",
    },
  },
  defaultVariants: {
    inset: "card",
  },
})

function CardContent({
  className,
  spacing,
  layout,
  inset,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardContentVariants> &
  VariantProps<typeof cardContentInsetVariants>) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        cardContentInsetVariants({ inset }),
        cardContentVariants({ spacing, layout }),
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
}
