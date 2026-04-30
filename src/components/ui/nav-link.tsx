'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const navLinkVariants = cva(
  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium no-underline transition-colors',
  {
    variants: {
      active: {
        true: 'bg-[hsl(var(--surface-low))] text-foreground ring-1 ring-border/60',
        false:
          'text-muted-foreground hover:bg-surface-low-soft hover:text-foreground',
      },
    },
    defaultVariants: { active: false },
  },
)

interface NavLinkProps
  extends ComponentProps<typeof Link>,
    VariantProps<typeof navLinkVariants> {}

export function NavLink({ active, className, ...props }: NavLinkProps) {
  return (
    <Link
      className={cn(navLinkVariants({ active }), className)}
      {...props}
    />
  )
}
