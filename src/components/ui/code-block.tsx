import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {}

export function CodeBlock({ className, ...props }: CodeBlockProps) {
  return (
    <pre
      className={cn(
        'whitespace-pre-wrap break-words font-mono text-sm leading-6 text-foreground',
        className,
      )}
      {...props}
    />
  )
}
