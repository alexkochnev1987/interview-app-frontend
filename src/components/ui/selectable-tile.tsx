'use client'

import type { LabelHTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const selectableTileVariants = cva(
  'flex cursor-pointer gap-4 rounded-3xl p-4 ring-1 transition-all',
  {
    variants: {
      selected: {
        true: 'bg-[hsl(var(--primary-fixed)/0.86)] shadow-soft ring-[hsl(var(--primary)/0.24)]',
        false:
          'bg-surface-low-soft ring-hairline hover:bg-surface-low-glass',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

interface SelectableTileProps
  extends LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof selectableTileVariants> {
  children: ReactNode
}

export function SelectableTile({
  className,
  selected,
  children,
  ...props
}: SelectableTileProps) {
  return (
    <label
      className={cn(selectableTileVariants({ selected }), className)}
      {...props}
    >
      {children}
    </label>
  )
}
