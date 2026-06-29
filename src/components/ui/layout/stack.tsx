import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const stackVariants = cva('flex flex-col', {
  variants: {
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      1.5: 'gap-1.5',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
    },
    align: {
      stretch: 'items-stretch',
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
    width: {
      auto: '',
      full: 'w-full',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      reading: 'max-w-5xl',
      wide: 'max-w-6xl',
    },
    grow: {
      none: '',
      fill: 'min-h-0 min-w-0 flex-1',
    },
    height: {
      auto: '',
      full: 'h-full min-h-0',
    },
    overflow: {
      none: '',
      y: 'overflow-y-auto overscroll-contain [scrollbar-gutter:stable]',
    },
    placeSelf: {
      auto: '',
      start: 'self-start',
      center: 'self-center',
      stretch: 'self-stretch',
    },
    visibility: {
      always: '',
      'below-sm': 'sm:hidden',
      'sm-up': 'hidden sm:flex',
    },
  },
  defaultVariants: {
    gap: 4,
    align: 'stretch',
    justify: 'start',
    width: 'auto',
    grow: 'none',
    height: 'auto',
    overflow: 'none',
    placeSelf: 'auto',
    visibility: 'always',
  },
})

type StackProps = Omit<React.ComponentProps<'div'>, 'color'> &
  VariantProps<typeof stackVariants> & {
    as?: keyof React.JSX.IntrinsicElements
  }

export function Stack({
  as,
  className,
  gap,
  align,
  justify,
  width,
  grow,
  height,
  overflow,
  placeSelf,
  visibility,
  ...props
}: StackProps) {
  const Comp = (as ?? 'div') as React.ElementType

  return (
    <Comp
      className={cn(
        stackVariants({
          gap,
          align,
          justify,
          width,
          grow,
          height,
          overflow,
          placeSelf,
          visibility,
        }),
        className,
      )}
      {...props}
    />
  )
}
