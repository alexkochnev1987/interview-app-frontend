import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, ElementType } from 'react'

import { cn } from '@/lib/utils'

const panelVariants = cva('ring-1 ring-border/45', {
  variants: {
    tone: {
      surface: 'bg-[hsl(var(--surface-low)/0.85)]',
      surfaceStrong: 'bg-[hsl(var(--surface-low)/0.9)]',
      white: 'bg-white/85',
      slateWell: 'bg-slate-50 dark:bg-slate-950/45',
    },
    radius: {
      md: 'rounded-[1.25rem]',
      lg: 'rounded-[1.5rem]',
    },
    padding: {
      none: '',
      md: 'p-4',
      lg: 'p-5',
    },
    minHeight: {
      none: '',
      transcript: 'flex min-h-[130px] max-h-[130px] flex-col overflow-hidden',
    },
  },
  defaultVariants: {
    tone: 'surface',
    radius: 'md',
    padding: 'md',
    minHeight: 'none',
  },
})

type PanelProps = ComponentProps<'div'> &
  VariantProps<typeof panelVariants> & {
    as?: ElementType
  }

function Panel({
  as: Component = 'div',
  tone,
  radius,
  padding,
  minHeight,
  className,
  ...props
}: PanelProps) {
  return (
    <Component
      className={cn(panelVariants({ tone, radius, padding, minHeight }), className)}
      {...props}
    />
  )
}

export { Panel }
