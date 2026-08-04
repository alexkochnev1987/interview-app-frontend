import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const chatMessageBubbleVariants = cva('max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6', {
  variants: {
    variant: {
      user: 'bg-primary text-primary-foreground',
      assistant: 'border border-border/45 bg-card shadow-sm',
      success: 'border border-success-soft-border bg-success-soft text-success-soft-foreground',
    },
    muted: {
      true: 'text-muted-foreground',
      false: '',
    },
  },
  defaultVariants: { variant: 'assistant', muted: false },
})

export function ChatMessageBubble({
  className,
  variant,
  muted,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof chatMessageBubbleVariants>) {
  return <div className={cn(chatMessageBubbleVariants({ variant, muted }), className)} {...props} />
}
