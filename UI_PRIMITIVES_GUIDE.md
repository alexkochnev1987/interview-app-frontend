# UI Primitives Guide

Practical guidance for building screens without raw Tailwind classes in feature files.

## Short Rule

- If you need `flex`, `grid`, `gap`, `justify-*`, `items-*`, `container`, or width and height for page composition, create or use a **layout primitive**.
- If you need `bg-*`, `border-*`, `shadow-*`, `rounded-*`, `text-*`, `ring-*`, `hover:*`, or `focus:*`, create or use a **UI primitive**.

## Padding And Margin

- `padding` belongs to a **UI primitive** because it defines internal component spacing.
- `margin` is usually a **layout concern** and should be expressed by the parent layout primitive with `gap`, `Stack`, `Inline`, `Grid`, `Container`, or `Section`.
- Do not add ad hoc `mt-*`, `mb-*`, `mx-*`, or `my-*` classes in feature files.
- Prefer parent-driven spacing over child-driven spacing.

Examples:

```tsx
// Good: parent controls spacing
<Stack gap={6}>
  <Header />
  <QuestionList />
</Stack>
```

```tsx
// Bad: child spacing leaks into the feature file
<>
  <Header className="mb-6" />
  <QuestionList />
</>
```

```tsx
// Good: padding is part of the component API
<Panel size="lg">...</Panel>
```

## Where Things Live

- Layout primitives: `src/components/ui/layout/**`
- UI primitives: `src/components/ui/**`
- Feature screens and feature components: `src/app/**`, `src/components/app/**`, `src/components/questions/**`

Feature files must not contain raw Tailwind classes.

## How To Choose

| Need | Create or use |
| --- | --- |
| Vertical composition with spacing | `Stack` |
| Horizontal composition | `Inline` |
| Card grid | `Grid` |
| Width-constrained content area | `Container` |
| Page section | `Section` |
| Visual card, panel, badge, label, callout | UI primitive |
| Repeated `bg + border + rounded + shadow` | UI primitive |
| Repeated `flex/grid + gap + align/justify` | Layout primitive |

## What A Layout Primitive Is

A layout primitive is responsible only for composition.

Allowed props:
- `as`
- `gap`
- `align`
- `justify`
- `wrap`
- `columns`
- `width`
- `height`

Not allowed:
- `tone`
- `background`
- `textColor`
- `shadow`
- `radius`
- `border`
- arbitrary visual props

### Example: `Stack`

File: `src/components/ui/layout/stack.tsx`

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const stackVariants = cva("flex flex-col", {
  variants: {
    gap: {
      0: "gap-0",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      6: "gap-6",
      8: "gap-8",
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

type StackProps = React.ComponentProps<"div"> &
  VariantProps<typeof stackVariants> & {
    as?: keyof React.JSX.IntrinsicElements
  }

function Stack({
  as,
  className,
  gap,
  align,
  justify,
  ...props
}: StackProps) {
  const Comp = as ?? "div"

  return (
    <Comp
      className={cn(stackVariants({ gap, align, justify }), className)}
      {...props}
    />
  )
}

export { Stack }
```

### When This Is Correct

Bad:

```tsx
<div className="flex flex-col gap-6">
  <Header />
  <QuestionList />
</div>
```

Good:

```tsx
<Stack gap={6}>
  <Header />
  <QuestionList />
</Stack>
```

## What A UI Primitive Is

A UI primitive is responsible for appearance.

Allowed:
- `variant`
- `size`
- `tone`
- `state`
- Tailwind classes for color, background, border, shadow, radius, typography, padding, and interactive states

UI primitives should usually be built with `cva`.

### Example: `Panel`

File: `src/components/ui/panel.tsx`

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const panelVariants = cva(
  "rounded-2xl border text-card-foreground",
  {
    variants: {
      tone: {
        default: "border-border bg-card shadow-sm",
        subtle: "border-border/70 bg-muted/40 shadow-none",
        elevated: "border-transparent bg-card shadow-lg",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      tone: "default",
      size: "md",
    },
  }
)

type PanelProps = React.ComponentProps<"div"> &
  VariantProps<typeof panelVariants>

function Panel({ className, tone, size, ...props }: PanelProps) {
  return (
    <div
      className={cn(panelVariants({ tone, size }), className)}
      {...props}
    />
  )
}

export { Panel }
```

### When This Is Correct

Bad:

```tsx
<div className="rounded-2xl border bg-white p-6 shadow-sm">
  ...
</div>
```

Good:

```tsx
<Panel tone="default" size="md">
  ...
</Panel>
```

## How To Write A Feature File

A feature file should assemble primitives, not style them.

Good:

```tsx
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { Container } from "@/components/ui/layout/container"
import { Inline } from "@/components/ui/layout/inline"
import { Stack } from "@/components/ui/layout/stack"

export default function QuestionsPage() {
  return (
    <Container>
      <Stack gap={8}>
        <Inline align="center" justify="between" gap={4}>
          <h1>Questions</h1>
          <Button>Add question</Button>
        </Inline>

        <Panel tone="default" size="lg">
          Content
        </Panel>
      </Stack>
    </Container>
  )
}
```

Bad:

```tsx
export default function QuestionsPage() {
  return (
    <main className="container space-y-8 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold">Questions</h1>
        <button className="rounded-full bg-blue-600 px-4 py-2 text-white shadow">
          Add question
        </button>
      </div>
    </main>
  )
}
```

## When To Create A New Primitive

Create a new **layout primitive** if:
- `flex/grid + gap + align/justify` repeats
- the same composition pattern appears in multiple places
- a feature file needs layout utility classes

Create a new **UI primitive** if:
- `bg + border + rounded + shadow` repeats
- you need a reusable container, badge, alert, panel, or surface
- a feature file needs color, background, typography, or state styling

## When To Extend An Existing Primitive

Do not create a new component if a new `variant` or `size` is enough.

Extend an existing primitive if:
- you need the same component with different density
- you need the same component with a different visual tone
- you need the same layout with a different `gap` or `align`

## Anti-Patterns

### 1. One universal `Box` for everything

Bad props:
- `direction`
- `justify`
- `align`
- `gap`
- `bg`
- `border`
- `shadow`
- `radius`
- `tone`
- `textColor`

This just rebuilds Tailwind as React props.

### 2. Layout primitive with visual props

Bad:

```tsx
<Stack gap={6} background="white" shadow="sm" radius="lg" />
```

`Stack` should not own appearance.

### 3. UI primitive with page layout props

Bad:

```tsx
<Panel columns={3} justify="between" />
```

`Panel` should not own page composition.

### 4. Margin-driven spacing between siblings

Bad:

```tsx
<Card className="mb-4" />
<Card className="mb-4" />
```

Good:

```tsx
<Stack gap={4}>
  <Card />
  <Card />
</Stack>
```

## Decision Tree

1. I want to add a `className` in a feature file.
2. Stop.
3. Is this about composition?
4. If yes, use or create a layout primitive.
5. If not, this is about appearance.
6. Use or create a UI primitive.

## Minimum Review Standard

Check before commit:
- No raw Tailwind classes in feature files.
- Layout lives in `src/components/ui/layout/**`.
- Appearance lives in `src/components/ui/**`.
- Repeated patterns are extracted into a primitive or variant.
- Component APIs are semantic, not a pile of Tailwind-like props.
