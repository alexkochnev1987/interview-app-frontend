import { cva, type VariantProps } from 'class-variance-authority'
import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const chatResultCardVariants = cva(
  'rounded-xl border border-border/40 bg-[hsl(var(--surface-low)/0.55)]',
  {
    variants: {
      padding: {
        sm: 'px-2.5 py-2',
        md: 'px-3 py-2.5',
      },
    },
    defaultVariants: {
      padding: 'sm',
    },
  },
)

export function ChatResultCard({
  className,
  padding,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof chatResultCardVariants>) {
  return <div className={cn(chatResultCardVariants({ padding }), className)} {...props} />
}
