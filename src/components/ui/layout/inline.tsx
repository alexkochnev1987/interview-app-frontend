import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const inlineVariants = cva('flex flex-row', {
  variants: {
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
    },
    align: {
      stretch: 'items-stretch',
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
    },
    width: {
      auto: '',
      full: 'w-full',
    },
  },
  defaultVariants: {
    gap: 4,
    align: 'center',
    justify: 'start',
    wrap: 'nowrap',
    width: 'auto',
  },
})

type InlineProps = Omit<React.ComponentProps<'div'>, 'color'> &
  VariantProps<typeof inlineVariants> & {
    as?: keyof React.JSX.IntrinsicElements
  }

export function Inline({
  as,
  className,
  gap,
  align,
  justify,
  wrap,
  width,
  ...props
}: InlineProps) {
  const Comp = (as ?? 'div') as React.ElementType

  return (
    <Comp
      className={cn(
        inlineVariants({ gap, align, justify, wrap, width }),
        className,
      )}
      {...props}
    />
  )
}
