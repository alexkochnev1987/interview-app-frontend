import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const bulletListVariants = cva('list-disc pl-5', {
  variants: {
    gap: {
      0: 'space-y-0',
      1: 'space-y-1',
      2: 'space-y-2',
      3: 'space-y-3',
    },
  },
  defaultVariants: {
    gap: 1,
  },
})

interface BulletListProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof bulletListVariants> {}

export function BulletList({ className, gap, ...props }: BulletListProps) {
  return <ul className={cn(bulletListVariants({ gap }), className)} {...props} />
}
