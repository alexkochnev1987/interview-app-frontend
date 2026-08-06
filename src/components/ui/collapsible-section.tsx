'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { type ReactNode, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { cn } from '@/lib/utils'

const collapsibleSectionVariants = cva('w-full overflow-hidden', {
  variants: {
    emphasis: {
      default: '',
      featured:
        'shadow-float ring-1 ring-danger-soft-border/35 transition-shadow duration-200 hover:shadow-float',
    },
  },
  defaultVariants: {
    emphasis: 'default',
  },
})

const collapsibleHeaderVariants = cva('border-b px-4 py-4 sm:px-5 sm:py-5', {
  variants: {
    tone: {
      default: 'border-hairline-strong bg-transparent',
      'danger-soft':
        'border-danger-soft-border bg-danger-soft text-danger-soft-foreground **:data-[slot=card-title]:text-danger-soft-foreground [&_[data-slot=card-action]_button]:border-danger-soft-foreground/25 [&_[data-slot=card-action]_button]:bg-background/95 [&_[data-slot=card-action]_button]:text-foreground [&_[data-slot=card-action]_button]:shadow-soft [&_[data-slot=card-action]_button]:hover:bg-background',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

const collapsibleToggleVariants = cva(
  'inline-flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-hidden transition-colors focus-visible:ring-3',
  {
    variants: {
      tone: {
        default: 'focus-visible:ring-ring/50',
        'danger-soft': 'focus-visible:ring-danger-soft-foreground/25',
      },
    },
    defaultVariants: {
      tone: 'default',
    },
  },
)

type CollapsibleSectionProps = {
  title: ReactNode
  actions?: ReactNode
  children: ReactNode
  leadingIcon?: ReactNode
  defaultExpanded?: boolean
  expandLabel: string
  collapseLabel: string
  className?: string
} & VariantProps<typeof collapsibleHeaderVariants> &
  VariantProps<typeof collapsibleSectionVariants>

export function CollapsibleSection({
  title,
  actions,
  children,
  leadingIcon,
  defaultExpanded = false,
  expandLabel,
  collapseLabel,
  className,
  tone = 'default',
  emphasis = 'default',
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const featured = tone === 'danger-soft' || emphasis === 'featured'

  return (
    <Card
      variant="surface"
      size="flush"
      className={cn(
        collapsibleSectionVariants({ emphasis: featured ? 'featured' : emphasis }),
        className,
      )}
    >
      <CardHeader spacing="sm" className={collapsibleHeaderVariants({ tone })} inset="none">
        <Inline justify="between" align="center" width="full" wrap="wrap" gap={3}>
          <button
            type="button"
            className={collapsibleToggleVariants({ tone })}
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-label={expanded ? collapseLabel : expandLabel}
          >
            <Icon size="md" tone="inherit">
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </Icon>
            {leadingIcon ? (
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full ring-1',
                  tone === 'danger-soft'
                    ? 'bg-danger-soft-foreground/10 text-danger-soft-foreground ring-danger-soft-foreground/20'
                    : 'bg-surface-low-glass text-muted-foreground ring-hairline',
                )}
              >
                {leadingIcon}
              </span>
            ) : null}
            <CardTitle size="lg">{title}</CardTitle>
          </button>
          {actions ? <div data-slot="card-action">{actions}</div> : null}
        </Inline>
      </CardHeader>
      {expanded ? (
        <CardContent spacing="lg" className="bg-surface-glass-soft/40 px-4 sm:px-5">
          {children}
        </CardContent>
      ) : null}
    </Card>
  )
}
