'use client'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const chatWidgetBackdropVariants = cva(
  'pointer-events-none fixed inset-0 z-30 motion-reduce:animate-none',
  {
    variants: {
      motion: {
        in: 'animate-in fade-in-0 duration-300 ease-out',
        out: 'animate-out fade-out-0 duration-200 ease-in',
      },
    },
    defaultVariants: {
      motion: 'in',
    },
  },
)

type ChatWidgetBackdropProps = VariantProps<typeof chatWidgetBackdropVariants> & {
  closing?: boolean
  className?: string
}

export function ChatWidgetBackdrop({ closing = false, className }: ChatWidgetBackdropProps) {
  return (
    <div
      aria-hidden
      className={cn(
        chatWidgetBackdropVariants({ motion: closing ? 'out' : 'in' }),
        'relative bg-[hsl(var(--scrim)/0.28)] backdrop-blur-[2px] before:pointer-events-none before:absolute before:inset-0 before:bg-[hsl(var(--primary)/0.07)]',
        className,
      )}
    />
  )
}
