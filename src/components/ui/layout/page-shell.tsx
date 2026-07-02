import * as React from 'react'
import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const pageShellVariants = cva('container flex flex-col', {
  variants: {
    spacing: {
      default: 'gap-8 md:gap-10',
      tight: 'gap-6 md:gap-8',
      compact: 'gap-3',
    },
    padding: {
      default: 'py-10 md:py-12',
      top: 'pt-6',
      bottom: 'pb-12',
      compact: 'py-6',
      none: '',
    },
    align: {
      stretch: '',
      center: 'min-h-[calc(100vh-6rem)] justify-center',
    },
  },
  defaultVariants: {
    spacing: 'default',
    padding: 'default',
    align: 'stretch',
  },
})

interface PageShellProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof pageShellVariants> {
  as?: 'main' | 'section' | 'div'
}

export function PageShell({
  as,
  className,
  spacing,
  padding,
  align,
  ...props
}: PageShellProps) {
  const Comp = (as ?? 'main') as React.ElementType

  return (
    <Comp
      className={cn(pageShellVariants({ spacing, padding, align }), className)}
      {...props}
    />
  )
}
