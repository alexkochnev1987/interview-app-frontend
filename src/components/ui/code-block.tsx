import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const codeBlockVariants = cva('whitespace-pre-wrap font-mono text-foreground', {
  variants: {
    size: {
      md: 'text-sm leading-6 break-words',
      sm: 'text-xs leading-5 break-all',
    },
    inset: {
      none: '',
      'dismiss-affordance': 'pr-6',
    },
  },
  defaultVariants: {
    size: 'md',
    inset: 'none',
  },
})

interface CodeBlockProps
  extends HTMLAttributes<HTMLPreElement>,
    VariantProps<typeof codeBlockVariants> {}

export function CodeBlock({ className, size, inset, ...props }: CodeBlockProps) {
  return (
    <pre className={cn(codeBlockVariants({ size, inset }), className)} {...props} />
  )
}
