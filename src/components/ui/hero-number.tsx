import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export function HeroNumber({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'text-6xl font-semibold tracking-display-hero text-[hsl(var(--primary))]',
        className,
      )}
      {...props}
    />
  )
}
