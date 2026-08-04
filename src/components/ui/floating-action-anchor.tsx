'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

const floatingActionAnchorVariants = cva('fixed z-40', {
  variants: {
    corner: {
      'bottom-right': 'bottom-6 right-6',
    },
  },
  defaultVariants: {
    corner: 'bottom-right',
  },
})

interface FloatingActionAnchorProps
  extends ComponentProps<'div'>, VariantProps<typeof floatingActionAnchorVariants> {
  children: ReactNode
}

export function FloatingActionAnchor({
  children,
  className,
  corner,
  ...props
}: FloatingActionAnchorProps) {
  return (
    <div className={cn(floatingActionAnchorVariants({ corner }), className)} {...props}>
      {children}
    </div>
  )
}
