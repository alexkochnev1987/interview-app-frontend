import { type HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface PageShellProps extends HTMLAttributes<HTMLElement> {}

export function PageShell({ className, ...props }: PageShellProps) {
  return (
    <main
      className={cn(
        'container space-y-8 py-10 md:space-y-10 md:py-12',
        className,
      )}
      {...props}
    />
  )
}
