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
  },
  defaultVariants: {
    width: 'default',
    align: 'start',
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
  ...props
}: ContainerProps) {
  const Comp = (as ?? 'div') as React.ElementType

  return (
    <Comp
      className={cn(containerVariants({ width, align }), className)}
      {...props}
    />
  )
}
