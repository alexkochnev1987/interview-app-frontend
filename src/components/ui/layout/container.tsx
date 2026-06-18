import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const containerVariants = cva('container', {
  variants: {
    width: {
      default: '',
      prose: 'max-w-4xl',
      reading: 'max-w-5xl',
      wide: 'max-w-6xl',
    },
    align: {
      start: '',
      center: 'mx-auto',
    },
    layout: {
      default: '',
      viewportColumn: 'flex min-h-0 min-w-0 flex-1 flex-col',
    },
  },
  defaultVariants: {
    width: 'default',
    align: 'start',
    layout: 'default',
  },
})

type ContainerProps = Omit<React.ComponentProps<'div'>, 'color'> &
  VariantProps<typeof containerVariants> & {
    as?: keyof React.JSX.IntrinsicElements
  }

export function Container({
  as,
  className,
  width,
  align,
  layout,
  ...props
}: ContainerProps) {
  const Comp = (as ?? 'div') as React.ElementType

  return (
    <Comp
      className={cn(containerVariants({ width, align, layout }), className)}
      {...props}
    />
  )
}
