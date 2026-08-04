import { cva, type VariantProps } from 'class-variance-authority'
import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const chatComposerBarVariants = cva('p-3', {
  variants: {
    tone: {
      default: 'border-t border-border/60 bg-transparent',
      widget: 'border-t-2 border-[hsl(var(--primary)/0.28)] bg-card',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

export function ChatComposerBar({
  className,
  tone,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof chatComposerBarVariants>) {
  return <div className={cn(chatComposerBarVariants({ tone }), className)} {...props} />
}
