import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const pageShellVariants = cva('container py-10 md:py-12', {
  variants: {
    spacing: {
      default: 'space-y-8 md:space-y-10',
      tight: 'space-y-6 md:space-y-8',
    },
  },
  defaultVariants: {
    spacing: 'default',
  },
})

interface PageShellProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof pageShellVariants> {}

export function PageShell({ className, spacing, ...props }: PageShellProps) {
  return (
    <main
      className={cn(pageShellVariants({ spacing }), className)}
      {...props}
    />
  )
}
