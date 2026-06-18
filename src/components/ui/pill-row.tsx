import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const pillRowVariants = cva('flex flex-wrap items-center gap-2', {
  variants: {
    reserveCorner: {
      false: '',
      true: 'pr-8',
    },
  },
  defaultVariants: {
    reserveCorner: false,
  },
})

interface PillRowProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pillRowVariants> {}

export function PillRow({ className, reserveCorner, ...props }: PillRowProps) {
  return (
    <div
      className={cn(pillRowVariants({ reserveCorner }), className)}
      {...props}
    />
  )
}
