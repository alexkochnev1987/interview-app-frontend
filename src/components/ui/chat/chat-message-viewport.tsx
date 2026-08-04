import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const chatMessageViewportVariants = cva(
  'overflow-y-auto overscroll-contain [scrollbar-gutter:stable] p-4',
  {
    variants: {
      size: {
        modal: 'max-h-[50vh] min-h-[320px]',
        widget: 'min-h-0 flex-1 bg-[hsl(var(--surface-low))] dark:bg-background',
      },
    },
    defaultVariants: { size: 'modal' },
  },
)

export function ChatMessageViewport({
  className,
  size,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof chatMessageViewportVariants>) {
  return <div className={cn(chatMessageViewportVariants({ size }), className)} {...props} />
}
