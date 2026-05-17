import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const gridVariants = cva('grid', {
  variants: {
    grow: {
      none: '',
      fill: 'min-h-0 min-w-0 flex-1',
    },
    gap: {
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
    },
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      'cards-2-3': 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
      'split-13-7': 'grid-cols-1 xl:grid-cols-[1.3fr_0.7fr]',
      'split-12-8': 'grid-cols-1 xl:grid-cols-[1.2fr_0.8fr]',
      'split-115-85': 'grid-cols-1 xl:grid-cols-[1.15fr_0.85fr]',
      'split-105-95': 'grid-cols-1 xl:grid-cols-[1.05fr_0.95fr]',
      'split-85-115': 'grid-cols-1 xl:grid-cols-[0.85fr_1.15fr]',
      'split-72-128': 'grid-cols-1 xl:grid-cols-[0.72fr_1.28fr]',
      'aside-22':
        'grid-cols-1 min-h-0 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-stretch xl:[&>*]:min-h-0',
      'aside-24':
        'grid-cols-1 min-h-0 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-stretch xl:[&>*]:min-h-0',
      'login-shell': 'grid-cols-1 lg:grid-cols-[1.1fr_420px] lg:items-center',
      'editor-2': 'grid-cols-1 xl:grid-cols-2',
      'identity-4': 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4',
      'identity-5': 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-5',
      'toolbar-2': 'grid-cols-1 md:grid-cols-[1fr_220px]',
      'toolbar-3': 'grid-cols-1 md:grid-cols-[1fr_220px_auto]',
      'toolbar-filter-search':
        'grid-cols-1 gap-3 [&>*]:min-w-0 md:grid-cols-[auto_minmax(16rem,1fr)] md:items-center',
      'metrics-3': 'grid-cols-1 md:grid-cols-3',
      'metrics-2-md': 'grid-cols-1 sm:grid-cols-2',
      'metrics-5': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
      'pagination-footer':
        'grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center [&>*:first-child]:min-w-0 [&>*:last-child]:justify-self-center sm:[&>*:last-child]:justify-self-end',
      'consent-shell':
        'grid-cols-1 content-start lg:grid-cols-[1.1fr_0.9fr]',
      'lobby-shell': cn(
        'grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]',
        'grid-rows-[minmax(min(42vh,280px),auto)_auto] lg:grid-rows-[minmax(0,1fr)]',
        '[&>*]:min-h-0',
      ),
    },
    align: {
      stretch: 'items-stretch',
      center: 'items-center',
    },
  },
  defaultVariants: {
    grow: 'none',
    gap: 4,
    columns: 1,
    align: 'stretch',
  },
})

type GridProps = Omit<React.ComponentProps<'div'>, 'color'> &
  VariantProps<typeof gridVariants> & {
    as?: keyof React.JSX.IntrinsicElements
  }

export function Grid({
  as,
  className,
  grow,
  gap,
  columns,
  align,
  ...props
}: GridProps) {
  const Comp = (as ?? 'div') as React.ElementType

  return (
    <Comp
      className={cn(gridVariants({ grow, gap, columns, align }), className)}
      {...props}
    />
  )
}
